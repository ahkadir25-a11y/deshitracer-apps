import {
  FaPhoneAlt,
  FaFacebookF,
  FaInstagram,
  FaTimes,
  FaCommentDots,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";

interface FloatingSocialButtonsProps {
  phone?: string;
  facebook?: string;
  instagram?: string;
}

const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({
  phone,
  facebook,
  instagram,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleButtons = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 cursor-pointer right-6 z-50 flex flex-col items-center gap-3">
      {/* Toggle Button */}
      <button
        onClick={toggleButtons}
        className="w-12 h-12 bg-[#222] hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition"
        aria-label={isOpen ? "Close Buttons" : "Open Buttons"}
      >
        {isOpen ? <FaTimes size={20} /> : <FaCommentDots size={20} />}
      </button>

      {/* Social Buttons */}
      <AnimatePresence>
        {isOpen && (
          <>
            {instagram && (
              <motion.a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-white shadow-lg"
                aria-label="Instagram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <FaInstagram size={20} />
              </motion.a>
            )}
            {facebook && (
              <motion.a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#222] hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg"
                aria-label="Facebook"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <FaFacebookF size={20} />
              </motion.a>
            )}
            {phone && (
              <motion.a
                href={`tel:${phone}`}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg"
                aria-label="Call"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <FaPhoneAlt size={18} />
              </motion.a>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingSocialButtons;
