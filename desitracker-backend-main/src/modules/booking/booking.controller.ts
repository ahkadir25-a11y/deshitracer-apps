import { Request, Response } from 'express';
import Booking from './booking.model';
import { Business } from '../business/business.model';
import sendEmail from '../../utils/lib/sendEmail';
import { bookingConfirmationTemplate, bookingOwnerNotificationTemplate } from './booking.template';
import { resolveBusinessRecipients } from '../../utils/lib/businessRecipients';
import { isBusinessMember } from '../../utils/lib/businessAccess';

// Update/delete take only a booking id, so the business scope must be enforced
// against the booking's own record — the caller must be owner/staff/admin of
// THAT business, not just any authenticated staff account.
const canManageBooking = async (req: Request, booking: { businessId: unknown }): Promise<boolean> => {
  const user = (req as any).user;
  if (!user?.id) return false;
  return isBusinessMember(
    { id: String(user.id), role: String(user.role), email: user.email },
    String(booking.businessId),
  );
};

// Controller for creating a booking
export const createBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { ownerId, businessId, name, phone, email, bookingDate, guests, specialRequests } = req.body;

    const newBooking = new Booking({
      ownerId,
      businessId,
      name,
      phone,
      email,
      bookingDate,
      guests,
      specialRequests,
    });

    await newBooking.save();

    // Send the customer a branded confirmation. Best-effort: an email failure
    // must never fail the booking, so it's fully wrapped and non-blocking.
    if (email && String(email).includes('@')) {
      (async () => {
        try {
          const business = await Business.findById(businessId).select('businessName');
          const businessName = business?.businessName || 'the restaurant';
          await sendEmail({
            email,
            fromName: businessName,
            subject: `Your reservation at ${businessName} is confirmed`,
            message: bookingConfirmationTemplate({ businessName, name, bookingDate, guests, specialRequests }),
          });
        } catch (mailErr: any) {
          console.error('[booking] confirmation email failed:', mailErr?.message);
        }
      })();
    }

    // Notify the business (owner + active staff) that a reservation came in.
    // Reservations are infrequent, so staff are included here. Best-effort: an
    // email failure must never fail the booking, so it's fully wrapped.
    (async () => {
      try {
        const { businessName, recipients, notify } = await resolveBusinessRecipients(String(businessId), {
          includeStaff: true,
        });
        if (notify.emailOnNewReservation && recipients.length) {
          const subject = `📅 New reservation — ${businessName}`;
          const message = bookingOwnerNotificationTemplate({
            businessName, name, phone, email, bookingDate, guests, specialRequests,
          });
          for (const to of recipients) {
            try {
              await sendEmail({ email: to, fromName: businessName, subject, message });
            } catch (mailErr: any) {
              console.error('[booking] owner email failed for', to, mailErr?.message);
            }
          }
        }
      } catch (notifyErr: any) {
        console.error('[booking] owner notify failed:', notifyErr?.message);
      }
    })();

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

// Controller for updating a booking
export const updateBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, phone, bookingDate, guests, specialRequests } = req.body;

    const existing = await Booking.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (!(await canManageBooking(req, existing))) {
      return res.status(403).json({ message: 'You are not authorized for this business' });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { name, phone, bookingDate, guests, specialRequests },
      { new: true }
    );

    return res.status(200).json({
      message: 'Booking updated successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating booking' });
  }
};

// Controller for deleting a booking
export const deleteBooking = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const existing = await Booking.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (!(await canManageBooking(req, existing))) {
      return res.status(403).json({ message: 'You are not authorized for this business' });
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error deleting booking' });
  }
};
