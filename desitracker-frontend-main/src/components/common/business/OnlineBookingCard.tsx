/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BookingModal from "@/components/shears/form/BookingModal";
import { motion } from "framer-motion";
import { useState } from "react";

const OnlineBookingCard = ({ link, business }: { link: string, business: any; }) => {
  const [showModal, setShowModal] = useState(false);


  return (
    <motion.div
      className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-start gap-4 max-w-[1210px] mb-4 mx-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Right: Call Button */}
      {
        business?.operationDetails?.offerOnlineBooking &&
        <button
          className="bg-[#222] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition"
          onClick={() => setShowModal(true)}
        >
          {business?.selectedType === "Restaurant" ? "Table Reservation" : "Appoinment"}
        </button>
      }
      {
        business?.operationDetails?.menuLink && (
          <button
            className="bg-[#222] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition"
            onClick={() => window.open(business.operationDetails.menuLink, '_blank')}
          >
            Menu
          </button>
        )
      }


      <BookingModal business={business} isOpen={showModal} onClose={() => setShowModal(false)} whatsappNumber={business?.operationDetails?.whatsappNumber} />
      {
        business?.offerOnlineBooking &&
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#222] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition"
        >
          Online Service
        </a>
      }

      {
        business?.checkoutNumber &&
        <button
          onClick={() => {
            const element = document.getElementById('products-section');
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }
          }} // Scroll to the products section when clicked
          className="bg-[#222] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition"
        >
          View Products
        </button>
      }
      {
        business?.checkoutNumber &&
        <button
          onClick={() => {
            const element = document.getElementById('products-offers');
            if (element) {
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
              });
            }
          }} // Scroll to the products section when clicked
          className="bg-[#222] text-white px-5 py-2.5 rounded-md text-sm font-medium hover:bg-black transition"
        >
          Offers
        </button>
      }

    </motion.div>
  );
};

export default OnlineBookingCard;
