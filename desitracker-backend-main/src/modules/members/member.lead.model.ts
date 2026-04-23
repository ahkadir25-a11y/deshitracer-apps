import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IMemberLead extends Document {
  _id: Types.ObjectId;
  owner_member_id: Types.ObjectId;   // who saved the lead
  lead_member_id: Types.ObjectId;    // the member saved as lead
  createdAt: Date;
  updatedAt: Date;
}

const MemberLeadSchema = new Schema<IMemberLead>(
  {
    owner_member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    lead_member_id: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
  },
  { timestamps: true }
);

// 🔒 Prevent duplicate lead entries per owner
MemberLeadSchema.index({ owner_member_id: 1, lead_member_id: 1 }, { unique: true });

export const MemberLead: Model<IMemberLead> =
  mongoose.model<IMemberLead>('MemberLead', MemberLeadSchema);