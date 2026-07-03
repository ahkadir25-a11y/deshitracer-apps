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
exports.BookingService = void 0;
const booking_model_1 = __importDefault(require("./booking.model"));
class BookingService {
    // Service method to create a booking
    static createBooking(bookingDetails) {
        return __awaiter(this, void 0, void 0, function* () {
            // Basic input validation — guests must be a sane positive integer and the
            // booking must carry a valid date.
            const guests = Number(bookingDetails === null || bookingDetails === void 0 ? void 0 : bookingDetails.guests);
            if (!Number.isInteger(guests) || guests < 1 || guests > 100) {
                throw new Error('guests must be a whole number between 1 and 100');
            }
            const when = new Date(bookingDetails === null || bookingDetails === void 0 ? void 0 : bookingDetails.bookingDate);
            if (Number.isNaN(when.getTime())) {
                throw new Error('bookingDate is invalid');
            }
            const newBooking = new booking_model_1.default(Object.assign(Object.assign({}, bookingDetails), { guests, bookingDate: when }));
            yield newBooking.save();
            return newBooking;
        });
    }
    // Service method to get bookings for a specific business (paginated + capped).
    static getBookingsByBusiness(businessId_1) {
        return __awaiter(this, arguments, void 0, function* (businessId, page = 1, limit = 20) {
            const _limit = Math.min(100, Math.max(1, Number(limit) || 20));
            const _page = Math.max(1, Number(page) || 1);
            return yield booking_model_1.default.find({ businessId })
                .sort({ bookingDate: -1 })
                .skip((_page - 1) * _limit)
                .limit(_limit)
                .populate('ownerId', 'name email');
        });
    }
}
exports.BookingService = BookingService;
