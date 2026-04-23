'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCommentDots } from 'react-icons/fa6';

const WhatsAppFloatingButton = () => {
  const whatsappNumber = '447712220802';

  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 2000); // show bubble after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex items-end gap-2">
         {/* WhatsApp Button */}
      <motion.a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="bg-black hover:bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
      >
        <FaCommentDots className="text-2xl" />
      </motion.a>
      {/* Tooltip / Bubble */}
      {showBubble && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-white text-black text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs"
        >
          Hey! Need help?
        </motion.div>
      )}

     
    </div>
  );
};

export default WhatsAppFloatingButton;
