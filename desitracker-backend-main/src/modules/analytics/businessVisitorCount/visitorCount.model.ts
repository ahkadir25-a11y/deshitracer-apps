import mongoose, { Schema } from 'mongoose';
import { TVisitorCount } from './visitorCount.interface';

// Review Schema Definition
const VisitorCountSchema: Schema = new Schema<TVisitorCount>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    ipAddress: { type: String },
  },
  { timestamps: true },
);
const VisitorCount = mongoose.model<TVisitorCount>(
  'VisitorCount',
  VisitorCountSchema,
);

export default VisitorCount;
