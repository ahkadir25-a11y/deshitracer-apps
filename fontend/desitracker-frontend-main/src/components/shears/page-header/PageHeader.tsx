"use client";
import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  className?: string;
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  className,
  title,
  subtitle,
}) => {
  return (
    <div
      className={`relative py-20 text-white text-center flex flex-col justify-center items-center trackerBg ${className}`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Content */}
      <div className="z-10 w-full">
        {/* Text Animation from Top */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="md:text-5xl text-2xl font-[500]">{title}</h1>
          <p className="mt-2 md:text-lg text-sm">{subtitle}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default PageHeader;
