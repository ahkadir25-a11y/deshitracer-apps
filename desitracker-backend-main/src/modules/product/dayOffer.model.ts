// models/dayOffer.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export type Weekday =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface IDayOffer extends Document {
  user_id: mongoose.Schema.Types.ObjectId;
  business_id: mongoose.Schema.Types.ObjectId;
  // Scope, narrowest first. An offer with product_ids covers exactly those
  // products; with only product_category_id it covers that category; with
  // neither it covers the whole menu.
  product_category_id?: mongoose.Schema.Types.ObjectId;
  product_ids?: mongoose.Schema.Types.ObjectId[];
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
    product_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
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

// There is deliberately no unique index on { business_id, day }.
//
// There used to be, and it made two ordinary things impossible: scheduling
// next month's Sunday offer while this month's was still running, and giving
// two categories different discounts on the same day. Uniqueness is the wrong
// shape for this — what must not happen is two offers of the *same scope*
// whose date windows overlap, which no single-field index can express. That
// check lives in assertNoOverlappingOffer() in product.service.ts.
//
// NOTE: the old index still exists on any database created before this change
// and must be dropped, or inserts will keep failing with E11000. See
// syncDayOfferIndexes() in product.service.ts, which is run at startup.
DayOfferSchema.index({ business_id: 1, day: 1 });

// Helpful secondary index for date-window queries
DayOfferSchema.index({ business_id: 1, start_date: 1, end_date: 1 });

export const DayOffer = mongoose.model<IDayOffer>('DayOffer', DayOfferSchema);
export default DayOffer;
