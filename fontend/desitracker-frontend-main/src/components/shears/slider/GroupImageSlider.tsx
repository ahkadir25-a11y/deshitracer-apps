/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import Image from "next/image";
import clsx from "clsx";

const GroupImageSlider = ({ images }: { images: any[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const perView = Math.min(images.length, 3);

  const [ref, instanceRef] = useKeenSlider<HTMLDivElement>({
    loop: images.length > 1,
    mode: "free-snap",
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel);
    },
    slides: {
      perView: perView,
      spacing: 10,  // Reduced spacing to remove gap
    },
    breakpoints: {
      "(min-width: 640px)": {
        slides: {
          perView: Math.min(images.length, 2),
          spacing: 10,  // Adjusted spacing
        },
      },
      "(min-width: 1024px)": {
        slides: {
          perView: Math.min(images.length, 3),
          spacing: 16,
        },
      },
    },
  });

  return (
    <div className="w-full">
      <div ref={ref} className="keen-slider overflow-hidden">
        {images.map((image: any, index: number) => (
          <div key={index} className="keen-slider__slide">
            <div className="relative w-full h-80 sm:h-96 lg:h-96 overflow-hidden shadow-md group">
              <Image
                src={image.url}
                alt={image.description || `Image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105 cursor-pointer"  // Added cursor-pointer for click
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {/* Optional Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => instanceRef.current?.moveToIdx(idx)}
              className={clsx(
                "w-3 h-3 rounded-full transition-all",
                currentSlide === idx
                  ? "bg-[#222] scale-110"
                  : "bg-gray-300 hover:bg-blue-400"
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupImageSlider;
