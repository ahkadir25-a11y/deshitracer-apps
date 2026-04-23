/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { useGetAllSlidersQuery } from "@/app/redux/services/slider.services";
import CategoryDropdown from "@/components/shears/drop-Down/CategoryDropdown";
import { TCategory } from "@/components/admin-components/categories/category.types";
import CountryDropDown from "@/components/shears/drop-Down/CountryDropDown";
// import HowItWorks from "./HowItWorks";
import CityDropDown from "@/components/shears/drop-Down/CityDropDown";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface Slider {
  id: string;
  url: string;
}

export default function HeroBanner() {
  const { data } = useGetAllSlidersQuery({});
  const [activeImage, setActiveImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const router = useRouter();
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<any>("United Kingdom");
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const handleCategoryChange = (categoryId: string) => {
    setCategoryId(categoryId);
  };
  console.log(categoryId)
  // Change background image at intervals (e.g., every 5 seconds)
  useEffect(() => {
    if (data?.data?.length > 0) {
      const interval = setInterval(() => {
        setActiveImage((prev) => (prev + 1) % data.data.length);
      }, 5000); // Change background every 5 seconds

      return () => clearInterval(interval); // Clean up the interval on unmount
    }
  }, [data]);
  return (
    <div
      style={{
        background: "linear-gradient(92deg, #1C2526 16%, #222 171%)"
      }}
      className="relative  text-white min-h-[60vh] lg:h-[85vh] md:h-[85vh] text-center flex flex-col md:justify-center justify-start md:items-center items-start"
    >
      {/* Dynamic Background Image with Framer Motion */}
      <div className="absolute  inset-0 ">
        {data?.data?.map((slider: Slider, index: number) => (
          <motion.div
            key={slider.id || index}
            className=" w-full absolute bg-cover inset-0"
            style={{
              backgroundImage: `url(${slider.url})`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === activeImage ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1,
              opacity: { ease: "easeInOut" },
            }}
          ></motion.div>
        ))}
      </div>

      {/* Overlay with gradient */}
      {/* <div
        className="absolute inset-0 z-0 "
        style={{
          background: "linear-gradient(92deg, #1C2526 16%, #222 171%)"
        }}
      ></div> */}

      {/* Content */}
      <div className="z-40 md:max-w-4xl max-w-3xl overflow-hidden  p-2 flex flex-col items-center md:justify-center justify-start pb-40 h-full mx-auto md:ml-auto w-full ">

        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="max-w-4xl mx-auto px-4"
        >
          <h1 className="md:text-4xl text-2xl font-normal  mb-2  text-white text-center  leading-tight tracking-tight drop-shadow-lg">
            Desi Tracker
          </h1>
          <h1 className="md:text-4xl text-2xl font-normal  mb-2  text-white text-center  leading-tight tracking-tight drop-shadow-lg">
            Search Diverse Businesses Worldwide
          </h1>
        </motion.div>

        {/* Search Bar Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="md:mb-6 my-5 w-full bg-black/30 rounded-xl p-3 backdrop-blur-md shadow-lg max-w-5xl mx-auto"
        >
          <div className="flex md:flex-row flex-col bg-white items-center w-full">
            <CategoryDropdown
              setSelectedId={handleCategoryChange}
              label="What are you looking for?"
              hideLabel
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
            <CountryDropDown
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
            />
            <CityDropDown
              selectedCity={selectedCity}
              setSelectedCity={(city: string) => {
                setSelectedCity(city);
              }}
              countryName={selectedCountry}
            />
            <button
              onClick={() => {
                const query: Record<string, string> = {};

                if (selectedCountry) query.location = selectedCountry;
                if (selectedCategory?._id) query.category = selectedCategory._id;
                if (selectedCity) query.city = selectedCity;

                // Create the query string
                const queryString = new URLSearchParams(query).toString();

                if (queryString) {
                  router.push(`/business?${queryString}`);
                }
              }}

              className={`md:px-5 px-3 md:py-3 cursor-pointer py-2 w-full md:w-auto flex items-center justify-center gap-2 text-white md:rounded-l-full  transition-all font-medium
              bg-gradient-to-r from-[#222] to-black hover:shadow-lg`}
            >
              <IoSearchOutline strokeWidth={18} size={20} />
              Search
            </button>

          </div>
        </motion.div>


        {/* Indicator Dots */}
        <div className="md:flex hidden absolute md:top-[50%] bottom-3 md:flex-col flex-row  gap-4  md:left-4 left-[50%]">
          {data?.data?.map((slider: Slider, index: number) => (
            <div
              key={slider.id || index}
              className={`w-3 h-3 rounded-full cursor-pointer transition-all ${index === activeImage
                ? "bg-gray-400 ring-2 ring-white w-5 h-5 p-1" // Increase size for padding effect inside the ring
                : "bg-white opacity-90 w-3 h-3"
                }`}
              onClick={() => setActiveImage(index)} // Allow manual navigation
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="md:mb-6 my-5 -z-1 w-full bg-black/30 rounded-xl p-3 backdrop-blur-md shadow-lg max-w-5xl mx-auto"
        >
          <div className="w-full backdrop-blur-md flex items-center bg-gray-50 border border-gray-200 rounded-lg shadow-md px-3 py-1 transition-all duration-300 hover:shadow-xl focus-within:shadow-xl">
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const query: Record<string, string> = {};
                  if (searchTerm) query.searchTerm = searchTerm;

                  const queryString = new URLSearchParams(query).toString();
                  if (queryString) {
                    router.push(`/business?${queryString}`);
                  }
                }
              }}
              className="ml-2 p-1.5 w-full bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400"
              placeholder="Search business name..."
            />

            <button
              onClick={() => {
                const query: Record<string, string> = {};
                if (searchTerm) query.searchTerm = searchTerm;

                // Create the query string
                const queryString = new URLSearchParams(query).toString();

                if (queryString) {
                  router.push(`/business?${queryString}`);
                }
              }}
              className="ml-1 flex items-center gap-3 px-5 py-2 bg-black text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
            >
              <FaSearch size={20} />
              Search
            </button>
          </div>
        </motion.div>

        {/* <BrowseByCategories /> */}
      </div>

      {/* <div className="md:block hidden">
        <HowItWorks />
      </div> */}
      <svg className="absolute lg:-bottom-2 bottom-0 left-0 w-full lg:h-[100px] h-[100px] md:block hidden"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none" ><path fill="#F9F7F1" fill-opacity="1" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,176C672,181,768,139,864,128C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
    </div>
  );
}
