import Booking from "./booking.model";

export class BookingService {
  // Service method to create a booking
  static async createBooking(bookingDetails: any) {
    const newBooking = new Booking(bookingDetails);
    await newBooking.save();
    return newBooking;
  }

  // Service method to get bookings for a specific business
  static async getBookingsByBusiness(businessId: string) {
    return await Booking.find({ businessId }).populate('ownerId', 'name email');
  }
}
