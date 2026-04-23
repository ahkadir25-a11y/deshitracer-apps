
/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import DropdownWithOutSideClick from "./DropdownWithOutSideClick";
import { IoCloseOutline } from "react-icons/io5";

interface Country {
  name: string;
  city: string[];
}

const CountryDropDown = ({
  selectedCountry,
  setSelectedCountry,
  className,
}: any) => {
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCountry = countries?.filter((country: Country) =>
    country?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetch("/country.json")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  return (
    <div className={`w-full !cursor-pointer ${className || ""} h-full relative`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
        style={{ minHeight: "40px" }}
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedCountry || "Select a Country"}
        </span>

        {selectedCountry ? (
          <button
            type="button"
            className="text-red-500 !cursor-pointer text-lg ml-2"
            aria-label="Clear selected category"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCountry("");
              setSearchTerm("");
            }}
          >
            <IoCloseOutline size={24} />
          </button>
        ) : (
          <div>
            <TiArrowSortedDown
              className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180 text-" : ""}`}
              size={18}
            />
          </div>
        )}
      </button>

      <DropdownWithOutSideClick
        open={isOpen}
        targetedElement={dropdownRef}
        onOutsideClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-0.5 bg-white border border-gray-300 "
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="search"
              placeholder="Search your country"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto text-left p-1 space-y-1">
            {filteredCountry?.length > 0 ? (
              filteredCountry.map((country: Country, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedCountry(country.name);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors font-medium ${selectedCountry === country.name
                    ? "bg-blue-50 text-[#222]"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {country.name}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400">No results found</li>
            )}
          </ul>
        </motion.div>
      </DropdownWithOutSideClick>
    </div>
  );
};

export default CountryDropDown;
