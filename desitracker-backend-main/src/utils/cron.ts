// Central place to start all background cron jobs. Called once from
// server.ts after the DB connection succeeds.

import cron from 'node-cron';
import { runForgotClockOutReminder, runAutomaticOvertimeTransition, runAutoClockOut } from '../modules/rota/timesheet/timesheet.reminder';
import { runShiftStartReminder } from '../modules/rota/timesheet/timesheet.shiftreminder';

let started = false;

export function startCronJobs(): void {
  if (started) return;
  started = true;

  // Every minute: remind staff whose shift starts in ~1 hour.
  cron.schedule('* * * * *', () => {
    runShiftStartReminder().catch((e: any) =>
      console.error('[cron:shiftReminder]', e?.message),
    );
  });

  // Every minute: instantly clock out staff whose shift just ended and who
  // are not on overtime, so forgotten sessions close right at shift end.
  cron.schedule('* * * * *', async () => {
    try {
      const res = await runAutoClockOut();
      if (res.closed > 0 || res.failed > 0) {
        console.log('[cron] autoClockOut —', res);
      }
    } catch (e: any) {
      console.error('[cron:autoClockOut]', e?.message);
    }
  });

  // Every 10 minutes: email staff who forgot to clock out.
  cron.schedule('*/10 * * * *', async () => {
    try {
      const result = await runForgotClockOutReminder();
      console.log('[Cron] runForgotClockOutReminder finished:', result);
      
      const autoOtResult = await runAutomaticOvertimeTransition();
      console.log('[Cron] runAutomaticOvertimeTransition finished:', autoOtResult);

      if (result.emailed > 0 || result.failed > 0) {
        console.log(
          `[cron] forgotClockOut — checked ${result.checked}, emailed ${result.emailed}, failed ${result.failed}`,
        );
      }
    } catch (err: any) {
      console.error('[cron] forgotClockOut crashed:', err?.message);
    }
  });

  console.log('[cron] scheduled jobs registered');
}
