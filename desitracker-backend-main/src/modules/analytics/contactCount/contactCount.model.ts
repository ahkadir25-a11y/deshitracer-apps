import mongoose, { Schema } from 'mongoose';
import { TContactCount } from './contactCount.interface';

// Review Schema Definition
const ContactCountSchema: Schema = new Schema<TContactCount>(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    username: { type: String },
  },
  { timestamps: true },
);
const ContactCount = mongoose.model<TContactCount>(
  'ContactCount',
  ContactCountSchema,
);

export default ContactCount;
