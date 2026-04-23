import React from "react";
import iconBusiness from "@/assets/icons/icon-business.svg";
import iconCreate from "@/assets/icons/icon-create.svg";
import iconGrowth from "@/assets/icons/icon-growth.svg";
import iconTracker from "@/assets/icons/icon-tracker.svg";
import Image from "next/image";
import { motion } from "framer-motion";
import WhatsAppFloatingButton from "@/app/(CommonLayout)/products/WhatsAppFloatingButton";

// Adjusted ease property for framer-motion
const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number], // Typecast to a valid easing function
    },
  }),
};

const HowItWorks = () => {
  const steps = [
    {
      icon: iconCreate,
      title: "Targeted Visibility to Diverse Community",
      text: "Reach thousands from your community actively searching for services like yours on a culturally connected local business platform.",
    },
    {
      icon: iconBusiness,
      title: "Direct Customer Engagement & Free Promotion",
      text: "Connect directly with potential customers and promote your business for free through our highly visible and interactive local listings.",
    },
    {
      icon: iconGrowth,
      title: "Find Trusted Local Diverse Businesses Easily",
      text: "Quickly discover verified businesses nearby, trusted by your community, all in one place with categories tailored to your needs.",
    },
    {
      icon: iconTracker,
      title: "Discover Hidden Gems & Exclusive Offers",
      text: "Explore unique businesses you didn’t know existed and enjoy special promotions available only to Desi Tracker users.",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="text-center flex md:absolute p-4 -bottom-40 z-5 flex-col w-full items-center justify-start gap-5"
    >
      <WhatsAppFloatingButton/>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 max-w-[1200px] mx-auto gap-5">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={cardVariants}
            className="flex flex-col bg-white hover:scale-105 shadow-xl transition-all duration-500 border-gray-200 hover:border-blue-300 gap-4 items-center p-5 md:p-3 rounded-xl cursor-pointer border"
          >
            <span className="text-4xl">
              <Image
                src={step.icon}
                alt={step.title.toLowerCase().replace(" ", "-")}
                width={80}
                height={80}
                className="w-20 h-20 md:w-14 md:h-14"
              />
            </span>
            <p className="font-semibold text-blue-700 text-md md:text-sm text-center">
              {step.title}
            </p>
            <p className="text-xs text-black leading-5 max-w-80 text-center md:text-[11px]">
              {step.text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default HowItWorks;
