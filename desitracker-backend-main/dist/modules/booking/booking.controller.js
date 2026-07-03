"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.getBookingsByBusiness = exports.createBooking = void 0;
const booking_model_1 = __importDefault(require("./booking.model"));
const business_model_1 = require("../business/business.model");
const sendEmail_1 = __importDefault(require("../../utils/lib/sendEmail"));
const booking_template_1 = require("./booking.template");
const businessRecipients_1 = require("../../utils/lib/businessRecipients");
const businessAccess_1 = require("../../utils/lib/businessAccess");
// Update/delete take only a booking id, so the business scope must be enforced
// against the booking's own record — the caller must be owner/staff/admin of
// THAT business, not just any authenticated staff account.
const canManageBooking = (req, booking) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.id))
        return false;
    return (0, businessAccess_1.isBusinessMember)({ id: String(user.id), role: String(user.role), email: user.email }, String(booking.businessId));
});
// Controller for creating a booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ownerId, businessId, name, phone, email, bookingDate, guests, specialRequests } = req.body;
        const newBooking = new booking_model_1.default({
            ownerId,
            businessId,
            name,
            phone,
            email,
            bookingDate,
            guests,
            specialRequests,
        });
        yield newBooking.save();
        // Send the customer a branded confirmation. Best-effort: an email failure
        // must never fail the booking, so it's fully wrapped and non-blocking.
        if (email && String(email).includes('@')) {
            (() => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const business = yield business_model_1.Business.findById(businessId).select('businessName');
                    const businessName = (business === null || business === void 0 ? void 0 : business.businessName) || 'the restaurant';
                    yield (0, sendEmail_1.default)({
                        email,
                        fromName: businessName,
                        subject: `Your reservation at ${businessName} is confirmed`,
                        message: (0, booking_template_1.bookingConfirmationTemplate)({ businessName, name, bookingDate, guests, specialRequests }),
                    });
                }
                catch (mailErr) {
                    console.error('[booking] confirmation email failed:', mailErr === null || mailErr === void 0 ? void 0 : mailErr.message);
                }
            }))();
        }
        // Notify the business (owner + active staff) that a reservation came in.
        // Reservations are infrequent, so staff are included here. Best-effort: an
        // email failure must never fail the booking, so it's fully wrapped.
        (() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { businessName, recipients, notify } = yield (0, businessRecipients_1.resolveBusinessRecipients)(String(businessId), {
                    includeStaff: true,
                });
                if (notify.emailOnNewReservation && recipients.length) {
                    const subject = `📅 New reservation — ${businessName}`;
                    const message = (0, booking_template_1.bookingOwnerNotificationTemplate)({
                        businessName, name, phone, email, bookingDate, guests, specialRequests,
                    });
                    for (const to of recipients) {
                        try {
                            yield (0, sendEmail_1.default)({ email: to, fromName: businessName, subject, message });
                        }
                        catch (mailErr) {
                            console.error('[booking] owner email failed for', to, mailErr === null || mailErr === void 0 ? void 0 : mailErr.message);
                        }
                    }
                }
            }
            catch (notifyErr) {
                console.error('[booking] owner notify failed:', notifyErr === null || notifyErr === void 0 ? void 0 : notifyErr.message);
            }
        }))();
        return res.status(201).json({
            message: 'Booking created successfully',
            booking: newBooking,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating booking' });
    }
});
exports.createBooking = createBooking;
// Controller for getting bookings by businessId
const getBookingsByBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { businessId } = req.params;
        const bookings = yield booking_model_1.default.find({ businessId }).populate('ownerId', 'name email');
        return res.status(200).json(bookings);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching bookings' });
    }
});
exports.getBookingsByBusiness = getBookingsByBusiness;
// Controller for updating a booking
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, phone, bookingDate, guests, specialRequests } = req.body;
        const existing = yield booking_model_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!(yield canManageBooking(req, existing))) {
            return res.status(403).json({ message: 'You are not authorized for this business' });
        }
        const updatedBooking = yield booking_model_1.default.findByIdAndUpdate(id, { name, phone, bookingDate, guests, specialRequests }, { new: true });
        return res.status(200).json({
            message: 'Booking updated successfully',
            booking: updatedBooking,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating booking' });
    }
});
exports.updateBooking = updateBooking;
// Controller for deleting a booking
const deleteBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const existing = yield booking_model_1.default.findById(id);
        if (!existing) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (!(yield canManageBooking(req, existing))) {
            return res.status(403).json({ message: 'You are not authorized for this business' });
        }
        yield booking_model_1.default.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Booking deleted successfully' });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting booking' });
    }
});
exports.deleteBooking = deleteBooking;
