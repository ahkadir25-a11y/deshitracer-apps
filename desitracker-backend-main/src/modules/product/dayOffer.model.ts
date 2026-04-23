// models/dayOffer.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export type Weekday =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface IDayOffer extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  business_id: mongoose.Schema.Types.ObjectId;
  product_category_id?: mongoose.Schema.Types.ObjectId; // optional scoping
  day: Weekday;                 // weekday offer applies on
  discount_percent: number;     // 0–100
  start_date: Date;             // inclusive
  end_date?: Date | null;       // inclusive; null => no end
  createdAt: Date;
  updatedAt: Date;
}

const DayOfferSchema = new Schema<IDayOffer>(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    business_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    product_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductCategory' },
    day: {
      type: String,
      enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      required: true,
    },
    discount_percent: { type: Number, min: 0, max: 100, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
  },
  { timestamps: true }
);

// Enforce at most one offer per weekday per business
DayOfferSchema.index({ business_id: 1, day: 1 }, { unique: true });

// Helpful secondary index for date-window queries
DayOfferSchema.index({ business_id: 1, start_date: 1, end_date: 1 });

export const DayOffer = mongoose.model<IDayOffer>('DayOffer', DayOfferSchema);
export default DayOffer;
