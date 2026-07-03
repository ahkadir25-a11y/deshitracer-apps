import Booking from "./booking.model";

export class BookingService {
  // Service method to create a booking
  static async createBooking(bookingDetails: any) {
    // Basic input validation — guests must be a sane positive integer and the
    // booking must carry a valid date.
    const guests = Number(bookingDetails?.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > 100) {
      throw new Error('guests must be a whole number between 1 and 100');
    }
    const when = new Date(bookingDetails?.bookingDate);
    if (Number.isNaN(when.getTime())) {
      throw new Error('bookingDate is invalid');
    }

    const newBooking = new Booking({ ...bookingDetails, guests, bookingDate: when });
    await newBooking.save();
    return newBooking;
  }

  // Service method to get bookings for a specific business (paginated + capped).
  static async getBookingsByBusiness(businessId: string, page = 1, limit = 20) {
    const _limit = Math.min(100, Math.max(1, Number(limit) || 20));
    const _page = Math.max(1, Number(page) || 1);
    return await Booking.find({ businessId })
      .sort({ bookingDate: -1 })
      .skip((_page - 1) * _limit)
      .limit(_limit)
      .populate('ownerId', 'name email');
  }
}
