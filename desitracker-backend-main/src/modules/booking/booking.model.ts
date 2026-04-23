import mongoose, { Schema, Document } from 'mongoose';

// Booking schema interface
export interface IBooking extends Document {
  ownerId: mongoose.Schema.Types.ObjectId;
  businessId: mongoose.Schema.Types.ObjectId;
  name: string;
  phone: string;
  bookingDate: Date;
  guests: number;
  specialRequests: string;
}

// Booking Schema
const BookingSchema: Schema = new Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    bookingDate: { type: Date, required: true },
    guests: { type: Number, required: true },
    specialRequests: { type: String, default: '' },
  },
  { timestamps: true }
);

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
