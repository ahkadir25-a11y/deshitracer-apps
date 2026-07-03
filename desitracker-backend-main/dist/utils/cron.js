"use strict";
// Central place to start all background cron jobs. Called once from
// server.ts after the DB connection succeeds.
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
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const timesheet_reminder_1 = require("../modules/rota/timesheet/timesheet.reminder");
const timesheet_shiftreminder_1 = require("../modules/rota/timesheet/timesheet.shiftreminder");
let started = false;
function startCronJobs() {
    if (started)
        return;
    started = true;
    // Every minute: remind staff whose shift starts in ~1 hour.
    node_cron_1.default.schedule('* * * * *', () => {
        (0, timesheet_shiftreminder_1.runShiftStartReminder)().catch((e) => console.error('[cron:shiftReminder]', e === null || e === void 0 ? void 0 : e.message));
    });
    // Every minute: instantly clock out staff whose shift just ended and who
    // are not on overtime, so forgotten sessions close right at shift end.
    node_cron_1.default.schedule('* * * * *', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield (0, timesheet_reminder_1.runAutoClockOut)();
            if (res.closed > 0 || res.failed > 0) {
                console.log('[cron] autoClockOut —', res);
            }
        }
        catch (e) {
            console.error('[cron:autoClockOut]', e === null || e === void 0 ? void 0 : e.message);
        }
    }));
    // Every 10 minutes: email staff who forgot to clock out.
    node_cron_1.default.schedule('*/10 * * * *', () => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield (0, timesheet_reminder_1.runForgotClockOutReminder)();
            console.log('[Cron] runForgotClockOutReminder finished:', result);
            const autoOtResult = yield (0, timesheet_reminder_1.runAutomaticOvertimeTransition)();
            console.log('[Cron] runAutomaticOvertimeTransition finished:', autoOtResult);
            if (result.emailed > 0 || result.failed > 0) {
                console.log(`[cron] forgotClockOut — checked ${result.checked}, emailed ${result.emailed}, failed ${result.failed}`);
            }
        }
        catch (err) {
            console.error('[cron] forgotClockOut crashed:', err === null || err === void 0 ? void 0 : err.message);
        }
    }));
    console.log('[cron] scheduled jobs registered');
}
