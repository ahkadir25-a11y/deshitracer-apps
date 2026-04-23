// src/modules/members/member.deactivation.model.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type DeactivationStatus = 'pending' | 'accepted' | 'rejected';

export interface IDeactivationRequest extends Document {
  _id: Types.ObjectId;
  member_id: Types.ObjectId;
  serialNumber: string;
  name: string;
  phone: string;

  reason?: string;
  note?: string;

  status: DeactivationStatus;          // pending | accepted | rejected
  processedAt?: Date | null;
  processedBy?: string | null;         // admin identifier or API key id
  processedNote?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const DeactivationRequestSchema = new Schema<IDeactivationRequest>(
  {
    member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    serialNumber: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },

    reason: { type: String },
    note: { type: String },

    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
    processedAt: { type: Date, default: null },
    processedBy: { type: String, default: null },
    processedNote: { type: String, default: null },
  },
  { timestamps: true }
);

// Optional: prevent multiple concurrent pendings per member
DeactivationRequestSchema.index({ member_id: 1, status: 1 });

export const DeactivationRequest: Model<IDeactivationRequest> =
  mongoose.model<IDeactivationRequest>('DeactivationRequest', DeactivationRequestSchema);
