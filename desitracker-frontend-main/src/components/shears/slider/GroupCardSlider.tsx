/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import locationImg from "../../../assets/icons/location.gif";
import { motion } from "framer-motion";

const GroupCardSlider = ({ branches }: { branches: any[] }) => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    loop: false,
    mode: "free-snap",
    slides: {
      perView: 1,
      spacing: 16,
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: {
          perView: 2,
          spacing: 16,
        },
      },
      "(min-width: 1024px)": {
        slides: {
          perView: 3,
          spacing: 20,
        },
      },
    },
  });

  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Image src={locationImg} alt="Branches" width={24} height={24} />
        <h2 className="text-base font-semibold text-gray-800">
          Our Branches
        </h2>
      </div>

      <div ref={ref} className="keen-slider py-2">
        {branches.map((branch: any, index: number) => (
          <motion.div
            key={index}
            className="keen-slider__slide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4 h-full flex flex-col justify-between">
              <Image
                src={locationImg}
                alt={branch?.branchName || "Branch Image"}
                className="w-full h-36 object-contain rounded mb-4"
              />
              <div className="text-sm font-semibold text-[#222] truncate">
                {branch?.branchName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {branch?.address}, {branch?.city}, {branch?.state},{" "}
                {branch?.postCode}, {branch?.country}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default GroupCardSlider;
