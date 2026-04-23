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
exports.getBookingsByBusiness = exports.createBooking = void 0;
const booking_model_1 = __importDefault(require("./booking.model"));
// Controller for creating a booking
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ownerId, businessId, name, phone, bookingDate, guests, specialRequests } = req.body;
        const newBooking = new booking_model_1.default({
            ownerId,
            businessId,
            name,
            phone,
            bookingDate,
            guests,
            specialRequests,
        });
        yield newBooking.save();
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
