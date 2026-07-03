import { Schema, model } from 'mongoose';
import { IRotaTimesheet } from './timesheet.interface';

// One staff-initiated break (e.g. tea, lunch, hospital visit) while clocked in.
// `endAt` is null while the break is in progress.
const breakSchema = new Schema(
  {
    startAt: { type: Date, required: true },
    endAt:   { type: Date, default: null },
    reason:  { type: String, default: '' },
  },
  { _id: false },
);

const overtimeSchema = new Schema(
  {
    startAt: { type: Date, required: true },
    endAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['NONE', 'RUNNING', 'PENDING', 'APPROVED', 'REJECTED'],
      default: 'RUNNING',
    },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: '' },
  },
  { _id: false },
);

const undertimeSchema = new Schema(
  {
    minutes: { type: Number, min: 0, required: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: ['NONE', 'PENDING_EXCUSE', 'EXCUSED', 'MUST_MAKEUP', 'MADE_UP'],
      default: 'PENDING_EXCUSE',
    },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: '' },
  },
  { _id: false },
);

const rotaTimesheetSchema = new Schema<IRotaTimesheet>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: 'RotaEmployee', required: true, index: true },

    shift: { type: Schema.Types.ObjectId, ref: 'RotaShift', default: null },

    clockIn:  { type: Date, required: true, index: true },
    clockOut: { type: Date, default: null, index: true },

    breakMinutes: { type: Number, min: 0, default: 0 },
    // Live break log — each entry represents a staff "step out" while clocked
    // in. Sum of completed (endAt set) durations is added to `breakMinutes`
    // automatically by the service layer.
    breaks: { type: [breakSchema], default: [] },
    notes: { type: String, default: '' },

    overtime:  { type: overtimeSchema,  default: null },
    undertime: { type: undertimeSchema, default: null },

    source: { type: String, enum: ['STAFF', 'OWNER', 'OWNER_EDIT'], default: 'STAFF' },

    editedBy:   { type: Schema.Types.ObjectId, ref: 'User', default: null },
    editedAt:   { type: Date, default: null },
    editReason: { type: String, default: '' },

    // Set once when the "forgot to clock out" email is dispatched, so the
    // reminder cron does not spam the same staff member every 10 minutes.
    reminderSentAt: { type: Date, default: null },

    // True when the cron auto-closed this entry because the staff never clocked
    // out and the shift end passed the grace window. clockOut is set to shiftEnd.
    autoClockedOut: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

// Fast range queries for owner reports (employee timesheets within a window).
rotaTimesheetSchema.index({ business: 1, employee: 1, clockIn: 1 });
rotaTimesheetSchema.index({ business: 1, clockIn: 1 });

// Hard constraint: at most one OPEN (clockOut=null) entry per employee per business.
// Stops the staff clicking "Clock In" twice and creating phantom shifts.
rotaTimesheetSchema.index(
  { business: 1, employee: 1 },
  {
    unique: true,
    partialFilterExpression: { clockOut: null, isDeleted: false },
  },
);

export const RotaTimesheet = model<IRotaTimesheet>('RotaTimesheet', rotaTimesheetSchema);
