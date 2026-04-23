import React from "react";
import { motion } from "framer-motion";
import { FaCreditCard } from "react-icons/fa6";

interface PaymentMethodsProps {
  methods: string[];
}

const badgeColors = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-yellow-100 text-yellow-700",
  "bg-red-100 text-red-700",
];

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ methods }) => {
  if (!methods?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
      <div className="flex items-center mb-4 gap-2">
        <FaCreditCard className="text-" />
        <h2 className="text-xl font-semibold text-gray-800">Accepted Payment Methods</h2>
      </div>

      <motion.div
        className="flex flex-wrap gap-3 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {methods.map((method, index) => (
          <motion.span
            key={method}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border border-gray-200 shadow-sm ${badgeColors[index % badgeColors.length]}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {method}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};

export default PaymentMethods;
