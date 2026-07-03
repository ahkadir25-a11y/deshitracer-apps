"use strict";
// Forgot-to-clock-out reminder job.
//
// Runs periodically and finds open timesheets (clockOut = null) where the
// scheduled shift ended more than FORGOT_THRESHOLD_MIN minutes ago AND the
// staff member has not started overtime. Sends ONE email per timesheet —
// `reminderSentAt` is stamped so we never re-email the same entry.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runForgotClockOutReminder = runForgotClockOutReminder;
exports.runAutomaticOvertimeTransition = runAutomaticOvertimeTransition;
exports.runAutoClockOut = runAutoClockOut;
const timesheet_model_1 = require("./timesheet.model");
const employee_model_1 = require("../employee/employee.model");
const sendEmail_1 = __importDefault(require("../../../utils/lib/sendEmail"));
const push_1 = require("../../../utils/lib/push");
const FORGOT_THRESHOLD_MIN = 30;
function buildEmailBody(opts) {
    const overdueHM = (() => {
        const m = opts.overdueMinutes;
        const h = Math.floor(m / 60);
        const r = m % 60;
        if (h && r)
            return `${h}h ${r}m`;
        if (h)
            return `${h}h`;
        return `${r}m`;
    })();
    const endStr = opts.shiftEnd.toLocaleString('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
        hour: '2-digit', minute: '2-digit',
    });
    return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #b45309; margin: 0 0 12px 0;">Forgot to clock out?</h2>
      <p style="color: #0f172a; font-size: 15px; line-height: 1.5;">
        Hi ${opts.firstName || 'there'},
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Your scheduled shift ended at <b>${endStr}</b>
        (about <b>${overdueHM} ago</b>) but you are still clocked in on Deshi Tracker.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.6;">
        Please open the app and either <b>clock out</b>, or
        <b>start overtime</b> if you are still working.
      </p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
        — Deshi Tracker (automated reminder)
      </p>
    </div>
  `;
}
function runForgotClockOutReminder() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const now = new Date();
        const cutoff = new Date(now.getTime() - FORGOT_THRESHOLD_MIN * 60 * 1000);
        // Candidates: still clocked in, never reminded, has a shift attached.
        const candidates = yield timesheet_model_1.RotaTimesheet.find({
            clockOut: null,
            isDeleted: false,
            reminderSentAt: null,
            shift: { $ne: null },
        })
            .populate('shift', 'endAt')
            .populate('employee', 'firstName email')
            .lean({ virtuals: false });
        let emailed = 0;
        let failed = 0;
        for (const ts of candidates) {
            const shift = ts.shift;
            const employee = ts.employee;
            if (!(shift === null || shift === void 0 ? void 0 : shift.endAt) || !(employee === null || employee === void 0 ? void 0 : employee.email))
                continue;
            const shiftEnd = new Date(shift.endAt);
            if (shiftEnd.getTime() > cutoff.getTime())
                continue;
            // Skip if overtime is running — they're still working intentionally.
            const otStatus = (_a = ts.overtime) === null || _a === void 0 ? void 0 : _a.status;
            if (otStatus === 'RUNNING')
                continue;
            const overdueMinutes = Math.floor((now.getTime() - shiftEnd.getTime()) / 60000);
            try {
                yield (0, sendEmail_1.default)({
                    email: employee.email,
                    subject: 'Reminder: please clock out — Deshi Tracker',
                    message: buildEmailBody({
                        firstName: employee.firstName || '',
                        shiftEnd,
                        overdueMinutes,
                    }),
                });
                // Also send a push notification if the employee has a token.
                const empDoc = yield employee_model_1.RotaEmployee.findById(ts.employee).select('expoPushToken').lean();
                const pushToken = empDoc === null || empDoc === void 0 ? void 0 : empDoc.expoPushToken;
                if (pushToken) {
                    yield (0, push_1.sendExpoPush)({
                        to: pushToken,
                        title: '⚠️ Forgot to clock out?',
                        body: `Your shift ended ${overdueMinutes} min ago. Please clock out or start overtime.`,
                        sound: 'default',
                        data: { type: 'FORGOT_CLOCKOUT', timesheetId: String(ts._id) },
                    });
                }
                yield timesheet_model_1.RotaTimesheet.updateOne({ _id: ts._id }, { $set: { reminderSentAt: now } });
                emailed += 1;
            }
            catch (err) {
                failed += 1;
                console.error(`[forgotClockOut] failed for timesheet ${ts._id}: ${err === null || err === void 0 ? void 0 : err.message}`);
            }
        }
        return { checked: candidates.length, emailed, failed };
    });
}
// Automatic Overtime Transition Job
// 
// Runs periodically to check for shifts where the owner has mandated overtime.
// If the staff is still clocked in and the shift end time has passed, this job
// automatically starts the overtime block on the timesheet so the staff member
// doesn't have to manually initiate it.
function runAutomaticOvertimeTransition() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        // Find all timesheets that are still open, and have a shift attached
        const candidates = yield timesheet_model_1.RotaTimesheet.find({
            clockOut: null,
            isDeleted: false,
            shift: { $ne: null },
            // We only care about timesheets that DO NOT already have a running or approved overtime block
            'overtime.status': { $nin: ['RUNNING', 'APPROVED', 'PENDING'] }
        })
            .populate('shift', 'endAt ownerMandatedOvertime')
            .lean({ virtuals: false });
        let transitioned = 0;
        let failed = 0;
        for (const ts of candidates) {
            const shift = ts.shift;
            if (!(shift === null || shift === void 0 ? void 0 : shift.endAt) || !shift.ownerMandatedOvertime)
                continue;
            const shiftEnd = new Date(shift.endAt);
            // Only transition if the shift end time has passed
            if (now.getTime() > shiftEnd.getTime()) {
                try {
                    yield timesheet_model_1.RotaTimesheet.updateOne({ _id: ts._id }, {
                        $set: {
                            overtime: {
                                startAt: shiftEnd,
                                status: 'APPROVED',
                                decisionNote: 'Automatically transitioned by Owner Mandated Overtime'
                            }
                        }
                    });
                    transitioned += 1;
                }
                catch (err) {
                    failed += 1;
                    console.error(`[runAutomaticOvertimeTransition] failed for timesheet ${ts._id}: ${err === null || err === void 0 ? void 0 : err.message}`);
                }
            }
        }
        return { checked: candidates.length, transitioned, failed };
    });
}
// Automatic Clock-Out Job
//
// Safety net for staff who forget to clock out. Finds open timesheets where the
// scheduled shift ended more than AUTO_CLOCKOUT_GRACE_MIN minutes ago and the
// staff is NOT on overtime, then closes them by setting clockOut = shiftEnd.
//
// Why shiftEnd (not "now")? Paid hours are already capped at the shift end in
// the worked-minutes calc, so closing at shiftEnd keeps the record consistent
// and never pays for the forgotten extra hours. Owner-mandated / staff overtime
// is intentionally left running and is never auto-closed here.
function runAutoClockOut() {
    return __awaiter(this, void 0, void 0, function* () {
        // Grace window after shift end before we step in. Default 0 = close the
        // instant the shift ends. Set AUTO_CLOCKOUT_GRACE_MIN to allow a buffer.
        const graceMin = Math.max(0, Number(process.env.AUTO_CLOCKOUT_GRACE_MIN) || 0);
        const now = new Date();
        const cutoff = new Date(now.getTime() - graceMin * 60 * 1000);
        // Open entries with a shift attached and no active/decided overtime block.
        // RUNNING/PENDING/APPROVED overtime = the person is (or may be) still working,
        // so leave those alone.
        const candidates = yield timesheet_model_1.RotaTimesheet.find({
            clockOut: null,
            isDeleted: false,
            shift: { $ne: null },
            'overtime.status': { $nin: ['RUNNING', 'PENDING', 'APPROVED'] },
        })
            .populate('shift', 'endAt ownerMandatedOvertime')
            .lean({ virtuals: false });
        let closed = 0;
        let failed = 0;
        for (const ts of candidates) {
            const shift = ts.shift;
            if (!(shift === null || shift === void 0 ? void 0 : shift.endAt))
                continue;
            // Owner-mandated overtime shifts are intentionally kept open past shift end
            // so the overtime-transition job can start the OT block. Never auto-close
            // these — closing them would cancel the mandated overtime.
            if (shift.ownerMandatedOvertime)
                continue;
            const shiftEnd = new Date(shift.endAt);
            // Only close once we are past the grace window.
            if (shiftEnd.getTime() > cutoff.getTime())
                continue;
            try {
                yield timesheet_model_1.RotaTimesheet.updateOne({ _id: ts._id, clockOut: null }, {
                    $set: {
                        clockOut: shiftEnd,
                        autoClockedOut: true,
                        // Close any break that is still open, capping it at the shift end.
                        'breaks.$[open].endAt': shiftEnd,
                    },
                }, { arrayFilters: [{ 'open.endAt': null }] });
                closed += 1;
            }
            catch (err) {
                failed += 1;
                console.error(`[autoClockOut] failed for timesheet ${ts._id}: ${err === null || err === void 0 ? void 0 : err.message}`);
            }
        }
        return { checked: candidates.length, closed, failed };
    });
}
