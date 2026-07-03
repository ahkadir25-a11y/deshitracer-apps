"use strict";
// Shift start reminder — runs every minute.
// Finds shifts starting in 55–65 minutes (centred on 1 hour) that have not
// yet had a push reminder sent, then notifies each assigned employee.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runShiftStartReminder = runShiftStartReminder;
const shift_model_1 = require("../shift/shift.model");
const push_1 = require("../../../utils/lib/push");
const REMIND_MIN = 60;
const WINDOW_MIN = 5;
function fmtTime(d) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}
function runShiftStartReminder() {
    return __awaiter(this, void 0, void 0, function* () {
        const now = new Date();
        const windowStart = new Date(now.getTime() + (REMIND_MIN - WINDOW_MIN) * 60 * 1000);
        const windowEnd = new Date(now.getTime() + (REMIND_MIN + WINDOW_MIN) * 60 * 1000);
        // Shifts starting inside the window that haven't been push-reminded yet.
        const shifts = yield shift_model_1.RotaShift.find({
            isDeleted: false,
            startAt: { $gte: windowStart, $lte: windowEnd },
            pushReminderSentAt: null,
            employee: { $ne: null },
        }).populate('employee');
        let sent = 0;
        let failed = 0;
        for (const shift of shifts) {
            try {
                const emp = shift.employee;
                if (!(emp === null || emp === void 0 ? void 0 : emp.expoPushToken))
                    continue;
                const startStr = fmtTime(new Date(shift.startAt));
                yield (0, push_1.sendExpoPush)({
                    to: emp.expoPushToken,
                    title: '⏰ Shift starting soon',
                    body: `Your shift starts at ${startStr}. Don't forget to clock in!`,
                    sound: 'default',
                    data: { type: 'SHIFT_REMINDER', shiftId: String(shift._id) },
                });
                yield shift_model_1.RotaShift.updateOne({ _id: shift._id }, { $set: { pushReminderSentAt: now } });
                sent += 1;
            }
            catch (err) {
                failed += 1;
                console.error(`[shiftReminder] shift ${shift._id}: ${err === null || err === void 0 ? void 0 : err.message}`);
            }
        }
        return { checked: shifts.length, sent, failed };
    });
}
