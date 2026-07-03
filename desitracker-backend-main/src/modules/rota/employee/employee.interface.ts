import { Types } from 'mongoose';

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface IRotaEmployeeAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

// ─── NEW: Emergency contact sub-object for safety/HR records ───────────────
export interface IEmergencyContact {
  name?: string;
  phone?: string;
  relation?: string;
}

export interface IRotaEmployee {
  business: Types.ObjectId;

  firstName: string;
  lastName?: string;

  email: string;
  phone?: string;
  address?: IRotaEmployeeAddress;

  role?: Types.ObjectId; // ref: RotaRole

  status: EmployeeStatus;

  // Optional link to your auth user (if employees can login)
  user?: Types.ObjectId;

  notes?: string;

  // ─── NEW FIELDS: Advanced HR Profile ────────────────────────────────────
  // A custom unique staff ID set by the owner (e.g. "EMP-001")
  employeeId?: string;

  // Hourly pay rate — used for payroll cost calculations
  hourlyWage?: number;

  // The date this employee started working at the business
  joiningDate?: Date;

  // Emergency contact for this employee (safety requirement)
  emergencyContact?: IEmergencyContact;

  // Whether this employee is allowed to start overtime
  isOvertimeAllowed?: boolean;

  // Maximum scheduled hours per week. null = no limit (can work any hours).
  maxWeeklyHours?: number | null;
  // ────────────────────────────────────────────────────────────────────────

  // ─── Invite flow: short code emailed to the staff so they can set their own password
  inviteCode?: string | null;
  inviteCodeExpiresAt?: Date | null;
  inviteAcceptedAt?: Date | null;

  // Expo push token — saved by the app after the user grants notification permission.
  expoPushToken?: string | null;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  holidayAllowance?: number;
  photoUrl?: string | null;
  dateOfBirth?: Date | null;
}
