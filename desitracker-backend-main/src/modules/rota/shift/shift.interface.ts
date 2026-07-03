import { Types } from 'mongoose';

export type ShiftStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

// NORMAL       — nobody flagged this shift as a problem.
// NEEDS_COVER  — assigned employee can't make it; owner asked for cover.
// COVERED      — owner has reassigned to a replacement; original recorded.
export type CoverStatus = 'NORMAL' | 'NEEDS_COVER' | 'COVERED';

export interface IRotaShift {
  business: Types.ObjectId;

  // Can be null if you want "unassigned shifts" (common in real rota systems)
  employee?: Types.ObjectId | null;

  role: Types.ObjectId; // ref: RotaRole

  startAt: Date; // store UTC
  endAt: Date;   // store UTC

  breakMinutes?: number;
  location?: string;
  notes?: string;

  status: ShiftStatus;

  // Absence cover bookkeeping.
  coverStatus: CoverStatus;
  originalEmployee?: Types.ObjectId | null; // who was supposed to do this shift
  coverNote?: string;                       // reason for needing cover

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  pushReminderSentAt?: Date | null;

  // If true, the owner has requested the staff member to stay for overtime.
  ownerMandatedOvertime?: boolean;
}
