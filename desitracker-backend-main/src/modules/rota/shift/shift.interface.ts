import { Types } from 'mongoose';

export type ShiftStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

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

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
