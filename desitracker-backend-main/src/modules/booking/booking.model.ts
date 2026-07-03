import mongoose, { Schema, Document } from 'mongoose';

// Booking schema interface
export interface IBooking extends Document {
  ownerId: mongoose.Schema.Types.ObjectId;
  businessId: mongoose.Schema.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  bookingDate: Date;
  guests: number;
  specialRequests: string;
}

// Booking Schema
const BookingSchema: Schema = new Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '', trim: true, lowercase: true },
    bookingDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    specialRequests: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index the hot query paths — booking lists are always scoped to a business and
// ordered by date. Without this, every booking-management load is a full scan.
BookingSchema.index({ businessId: 1, bookingDate: 1 });

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
