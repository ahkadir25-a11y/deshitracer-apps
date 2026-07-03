/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ImSpinner2 } from "react-icons/im"; // Spinner icon from react-icons
import { seatResvation } from "../utils/allowedBooking";
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string; // New prop for WhatsApp number
  business: any;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, whatsappNumber, business }) => {
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [bookingDate, setBookingDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const getOpeningHoursForDate = (date: Date) => {
    if (!business?.openingHours) return { start: null, end: null };

    const dayIndexToName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayIndexToName[date.getDay()];

    const openingHour = business.openingHours.find((d: any) => d.day === dayName);

    if (!openingHour || !openingHour.start || !openingHour.end) {
      return { start: null, end: null };
    }

    // Convert "HH:mm" to Date object (on same date)
    const [startHour, startMinute] = openingHour.start.split(':').map(Number);
    const [endHour, endMinute] = openingHour.end.split(':').map(Number);

    const startDate = new Date(date);
    startDate.setHours(startHour, startMinute, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(endHour, endMinute, 0, 0);

    return { start: startDate, end: endDate };
  };
  const { start: minTimeRaw, end: maxTimeRaw } = bookingDate ? getOpeningHoursForDate(bookingDate) : { start: null, end: null };
  const minTime = minTimeRaw ?? undefined;
  const maxTime = maxTimeRaw ?? undefined;

  const disabledDays = useMemo(() => {
    const dayMap: Record<string, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    if (!business?.openingHours || !Array.isArray(business.openingHours)) return new Set<number>();

    return new Set(
      business.openingHours
        .filter((day: any) => !day.start && !day.end)
        .map((day: any) => dayMap[day.day])
    );
  }, [business]);

  const isDayAllowed = (date: Date) => {
    const day = date.getDay(); // 0 (Sun) to 6 (Sat)
    return !disabledDays.has(day);
  };
  // Simulate a loading state for 2 seconds
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000); // 2 seconds delay
    }
  }, [isOpen]);

  const isFormValid = () => {
    return name && phone && bookingDate && guests > 0;
  };

  const handleSubmit = () => {
    if (!bookingDate || !name || !phone || guests < 1) return;



    // Format the booking details as a message
    const message = `
      *Booking Details:*
      *Name*: ${name}
      *Phone*: ${phone}
      *Date*: ${bookingDate.toLocaleString()}
      *Guests*: ${guests}
      ${specialRequests ? `*Special Requests*: ${specialRequests}` : ""}
    `;

    // Send the booking details via WhatsApp
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    // Close the modal and reset form fields after submission
    handleClose();
  };

  const handleClose = () => {
    // Close the modal and clear the form fields
    setName("");
    setPhone("");
    setBookingDate(null);
    setGuests(1);
    setSpecialRequests("");
    onClose(); // Close the modal
  };

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-30 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-5 rounded-lg shadow-md w-96"
        initial={{ scale: 0.8 }}
        animate={{ scale: isOpen ? 1 : 0.8 }}
        exit={{ scale: 0.8 }}
      >
        {loading ? (
          // Show the spinner for 2 seconds before the form
          <div className="flex justify-center items-center h-56">
            <ImSpinner2 className="animate-spin text-blue-500 text-4xl" />
          </div>
        ) : (
          // Show the booking form after 2 seconds
          <div>
            <h2 className="text-gray-800 text-2xl font-semibold mb-6 text-center">
              Book Your Reservation
            </h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="text-gray-600 block">Name</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-gray-600 block">Phone Number</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="">
                <label className="text-gray-600 block">Booking Date & Time</label>
                <DatePicker
                  selected={bookingDate}
                  onChange={(date: Date | null) => setBookingDate(date)}
                  showTimeSelect
                  filterDate={isDayAllowed}
                  minTime={minTime}
                  maxTime={maxTime}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none w-80 "
                  required
                />
              </div>
              {
                (seatResvation.includes(business.selectedType || "") || seatResvation.includes(business.selectedSubCategory?.name || "")) &&
                <div>
                  <label className="text-gray-600 block">Number of person</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              }
              <div>
                <label className="text-gray-600 block">Special Requests</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Any dietary preferences or seating requests?"
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleSubmit}
                  className={`bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!isFormValid()} // Disable button if form is invalid
                >
                  Book Now
                </button>
                <button
                  type="button"
                  onClick={handleClose} // Close and reset form fields
                  className="text-red-500 py-2 px-4 rounded-lg hover:bg-red-100 focus:outline-none"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BookingModal;
