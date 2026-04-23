import { Request, Response } from 'express';
import Booking from './booking.model';

// Controller for creating a booking
export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ownerId, businessId, name, phone, bookingDate, guests, specialRequests } = req.body;

    const newBooking = new Booking({
      ownerId,
      businessId,
      name,
      phone,
      bookingDate,
      guests,
      specialRequests,
    });

    await newBooking.save();
    return res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating booking' });
  }
};

// Controller for getting bookings by businessId
export const getBookingsByBusiness = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { businessId } = req.params;
    const bookings = await Booking.find({ businessId }).populate('ownerId', 'name email');
    
    return res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching bookings' });
  }
};
