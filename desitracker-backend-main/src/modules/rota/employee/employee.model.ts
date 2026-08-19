import { Schema, model } from 'mongoose';
import { IRotaEmployee } from './employee.interface';

const addressSchema = new Schema(
  {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postcode: { type: String },
    country: { type: String },
  },
  { _id: false }
);

// ─── NEW: Emergency contact sub-schema ───────────────────────────────────────
const emergencyContactSchema = new Schema(
  {
    name:     { type: String, trim: true, default: '' },
    phone:    { type: String, trim: true, default: '' },
    relation: { type: String, trim: true, default: '' },
  },
  { _id: false }
);
// ──────────────────────────────────────────────────────────────────────────────

const rotaEmployeeSchema = new Schema<IRotaEmployee>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },

    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true, default: '' },

    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: addressSchema, default: {} },

    // ✅ role is free-text (no separate Role model)
    role: { type: String, trim: true, default: '' },

    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },

    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    notes: { type: String, default: '' },

    // ─── NEW FIELDS: Advanced HR Profile ─────────────────────────────────────
    // Custom staff ID assigned by the owner (e.g. "EMP-001"). Optional.
    employeeId: { type: String, trim: true, default: null },

    // Pay per hour — used by the payroll cost analytics calculator.
    hourlyWage: { type: Number, min: 0, default: null },

    // The date this person officially started working at this business.
    joiningDate: { type: Date, default: null },

    // Emergency contact — stored for HR/safety purposes.
    emergencyContact: { type: emergencyContactSchema, default: {} },

    // Annual paid-holiday allowance in DAYS. Default 28 (UK statutory minimum
    // for full-time staff). Owner can adjust per employee.
    holidayAllowance: { type: Number, min: 0, default: 28 },

    // Profile photo (Cloudinary URL or equivalent).
    photoUrl: { type: String, default: null },
    coverPhotoUrl: { type: String, default: null },

    // Used for birthday reminders on the owner's rota view.
    dateOfBirth: { type: Date, default: null },

    // Whether this employee is allowed to start overtime
    isOvertimeAllowed: { type: Boolean, default: false },

    // Max hours per week this employee can be scheduled. null = no cap.
    maxWeeklyHours: { type: Number, min: 0, default: null },
    // ─────────────────────────────────────────────────────────────────────────

    // ─── Invite flow ────────────────────────────────────────────────────────
    // Short code (e.g. 8 chars) emailed to staff so they can set their own password.
    // Cleared on accept. Indexed for fast lookup during acceptInvite.
    inviteCode: { type: String, default: null, index: true },
    inviteCodeExpiresAt: { type: Date, default: null },
    inviteAcceptedAt: { type: Date, default: null },
    // ─────────────────────────────────────────────────────────────────────────

    expoPushToken: { type: String, default: null },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Unique employee email per business (ignores soft-deleted docs)
rotaEmployeeSchema.index(
  { business: 1, email: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const RotaEmployee = model<IRotaEmployee>('RotaEmployee', rotaEmployeeSchema);