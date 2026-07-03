// Shift start reminder — runs every minute.
// Finds shifts starting in 55–65 minutes (centred on 1 hour) that have not
// yet had a push reminder sent, then notifies each assigned employee.

import { RotaShift } from '../shift/shift.model';
import { RotaEmployee } from '../employee/employee.model';
import { sendExpoPush } from '../../../utils/lib/push';

const REMIND_MIN = 60;
const WINDOW_MIN = 5;

function fmtTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export async function runShiftStartReminder(): Promise<{
  checked: number;
  sent: number;
  failed: number;
}> {
  const now = new Date();
  const windowStart = new Date(now.getTime() + (REMIND_MIN - WINDOW_MIN) * 60 * 1000);
  const windowEnd   = new Date(now.getTime() + (REMIND_MIN + WINDOW_MIN) * 60 * 1000);

  // Shifts starting inside the window that haven't been push-reminded yet.
  const shifts = await RotaShift.find({
    isDeleted: false,
    startAt: { $gte: windowStart, $lte: windowEnd },
    pushReminderSentAt: null,
    employee: { $ne: null },
  }).populate<{ employee: any }>('employee');

  let sent = 0;
  let failed = 0;

  for (const shift of shifts) {
    try {
      const emp = shift.employee as any;
      if (!emp?.expoPushToken) continue;

      const startStr = fmtTime(new Date(shift.startAt));

      await sendExpoPush({
        to: emp.expoPushToken,
        title: '⏰ Shift starting soon',
        body: `Your shift starts at ${startStr}. Don't forget to clock in!`,
        sound: 'default',
        data: { type: 'SHIFT_REMINDER', shiftId: String(shift._id) },
      });

      await RotaShift.updateOne(
        { _id: shift._id },
        { $set: { pushReminderSentAt: now } },
      );
      sent += 1;
    } catch (err: any) {
      failed += 1;
      console.error(`[shiftReminder] shift ${shift._id}: ${err?.message}`);
    }
  }

  return { checked: shifts.length, sent, failed };
}
