import { Schema, model, Types } from 'mongoose';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type LeaveType = 'HOLIDAY' | 'SICK' | 'UNPAID' | 'OTHER';

export interface IRotaLeave {
  business: Types.ObjectId;
  employee: Types.ObjectId;

  type: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;

  status: LeaveStatus;

  decidedBy?: Types.ObjectId | null;   // owner/admin who approved or rejected
  decidedAt?: Date | null;
  decisionNote?: string;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const rotaLeaveSchema = new Schema<IRotaLeave>(
  {
    business: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    employee: { type: Schema.Types.ObjectId, ref: 'RotaEmployee', required: true, index: true },

    type: { type: String, enum: ['HOLIDAY', 'SICK', 'UNPAID', 'OTHER'], default: 'HOLIDAY' },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    reason: { type: String, default: '' },

    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING', index: true },

    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: '' },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

rotaLeaveSchema.index({ business: 1, status: 1, startDate: 1 });

export const RotaLeave = model<IRotaLeave>('RotaLeave', rotaLeaveSchema);
