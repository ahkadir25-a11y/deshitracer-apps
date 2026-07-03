import { Types } from 'mongoose';

// STAFF       — created by the staff member clocking in/out from the app.
// OWNER       — created directly by the owner (e.g. recording a paper shift).
// OWNER_EDIT  — originally created by staff but later adjusted by the owner.
export type TimesheetSource = 'STAFF' | 'OWNER' | 'OWNER_EDIT';

// Overtime workflow — staff initiates AFTER scheduled shift end. Owner decides.
// PENDING = staff submitted, owner hasn't decided.
// APPROVED = counts toward pay.
// REJECTED = does not count.
export type OvertimeStatus = 'NONE' | 'RUNNING' | 'PENDING' | 'APPROVED' | 'REJECTED';

// Undertime workflow — auto-detected when staff clocks out before shift end.
// PENDING_EXCUSE = staff submitted a reason, awaiting owner decision.
// EXCUSED = owner accepted, time is excused (paid).
// MUST_MAKEUP = owner rejected, staff must make up the time another day.
// MADE_UP = staff made it up; owner marked as resolved.
export type UndertimeStatus = 'NONE' | 'PENDING_EXCUSE' | 'EXCUSED' | 'MUST_MAKEUP' | 'MADE_UP';

export interface IOvertimeBlock {
  startAt: Date;
  endAt?: Date | null;
  status: OvertimeStatus;
  decidedBy?: Types.ObjectId | null;
  decidedAt?: Date | null;
  decisionNote?: string;
}

export interface IBreakBlock {
  startAt: Date;
  endAt?: Date | null;   // null while break is in progress
  reason?: string;
}

export interface IUndertimeBlock {
  minutes: number;          // computed at clock-out: minutes short of shift end
  reason?: string;          // staff's explanation
  status: UndertimeStatus;
  decidedBy?: Types.ObjectId | null;
  decidedAt?: Date | null;
  decisionNote?: string;
}

export interface IRotaTimesheet {
  business: Types.ObjectId;
  employee: Types.ObjectId; // ref: RotaEmployee

  // Optional planned shift this clock-in is fulfilling. Used to compute
  // overtime (any time after shift.endAt counts as OT).
  shift?: Types.ObjectId | null;

  clockIn: Date;            // store UTC
  clockOut?: Date | null;   // null means "still clocked in"

  breakMinutes?: number;
  breaks?: IBreakBlock[];
  notes?: string;

  // Staff-initiated overtime AFTER the shift ended (separate from the
  // implicit overtime computed when clockOut is past shift.endAt).
  overtime?: IOvertimeBlock | null;

  // Auto-detected when clockOut is BEFORE shift.endAt.
  undertime?: IUndertimeBlock | null;

  source: TimesheetSource;

  // Audit trail when the owner adjusts a staff-recorded entry.
  editedBy?: Types.ObjectId | null;
  editedAt?: Date | null;
  editReason?: string;

  // Set once after the "forgot to clock out" reminder email is sent.
  reminderSentAt?: Date | null;

  // True when the system auto-closed this entry (staff never clocked out and
  // the shift ended past the grace window). clockOut is set to the shift end.
  autoClockedOut?: boolean;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
