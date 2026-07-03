import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMemberScan extends Document {
  member: Types.ObjectId;
  businessId?: Types.ObjectId;
  businessName?: string;
  scannedAt: Date;
}

const MemberScanSchema = new Schema<IMemberScan>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
    businessName: { type: String },
    scannedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: false }
);

export const MemberScan = mongoose.model<IMemberScan>('MemberScan', MemberScanSchema);
