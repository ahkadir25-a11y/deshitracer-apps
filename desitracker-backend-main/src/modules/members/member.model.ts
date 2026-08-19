import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMember extends Document {
    _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  password: string;
  city?: string;
  profileImageUrl?: string;
  serialNumber: string;
  qrSlug: string;
  qrCodeUrl?: string;
  active: boolean;
  expoPushToken?: string | null;
  notificationPrefs?: {
    newOffers: boolean;
    promotionalEmails: boolean;
  };
  deletedAt?: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
}

const MemberSchema = new Schema<IMember>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true, select: false },
    city: { type: String },
    profileImageUrl: { type: String },

    serialNumber: { type: String, required: true, unique: true, index: true },
    qrSlug: { type: String, required: true, unique: true, index: true },
    qrCodeUrl: { type: String },

    active: { type: Boolean, default: true },
    expoPushToken: { type: String, default: null },
    // Only toggles that map to a notification the system actually sends:
    // newOffers -> the "New Member Offer!" push, promotionalEmails -> lead
    // promotion emails. Default true so existing members are unaffected.
    notificationPrefs: {
      newOffers: { type: Boolean, default: true },
      promotionalEmails: { type: Boolean, default: true },
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MemberSchema.pre('save', async function (next) {
  const doc = this as IMember;
  if (doc.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    doc.password = await bcrypt.hash(doc.password, salt);
  }
  next();
});

MemberSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Member: Model<IMember> = mongoose.model<IMember>('Member', MemberSchema);

// ---- serial counter ----
interface ICounter extends Document { key: string; seq: number }
const CounterSchema = new Schema<ICounter>({
  key: { type: String, unique: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

export async function getNextSerial(): Promise<string> {
  const year = new Date().getFullYear();
  const doc = await Counter.findOneAndUpdate(
    { key: `member-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(doc.seq).padStart(6, '0');
  return `DT-${year}-${padded}`;
}
