

/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { TiArrowSortedDown } from "react-icons/ti";
import DropdownWithOutSideClick from "./DropdownWithOutSideClick";
import { IoCloseOutline } from "react-icons/io5";

interface Country {
  name: string;
  city: string[];
}

const CityDropDown = ({
  selectedCity,
  setSelectedCity,
  countryName,
}: any) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

const filteredCity: string[] =
  selectedCountry?.city
    ?.filter((city: string) =>
      city?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    ?.sort((a: string, b: string) => {
      const indexA = a.toLowerCase().indexOf(searchTerm.toLowerCase());
      const indexB = b.toLowerCase().indexOf(searchTerm.toLowerCase());
      return indexA - indexB;
    }) || [];

  useEffect(() => {
    fetch("/country.json")
      .then((response) => response.json())
      .then((data) => setCountries(data))
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (countryName && countries.length > 0) {
      const found = countries.find((item: Country) => item.name === countryName);
      setSelectedCountry(found || null);
    }
  }, [countryName, countries]);

  return (
    <div className="relative !cursor-pointer w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          if (!countryName) {
            toast.error("Select a country first!");
            return;
          }
          setIsOpen(!isOpen);
        }}
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedCity || "Select a City"}
        </span>

        {selectedCity ? (
          <button
            type="button"
            className="text-red-500 !cursor-pointer text-lg ml-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCity("");
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
          <div className="p-2 ">
            <input
              type="search"
              placeholder="Search your city"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto text-left p-1 space-y-1">
            {filteredCity?.length > 0 ? (
              filteredCity.map((city: string, idx: number) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors font-medium ${selectedCity === city
                    ? "bg-blue-50 text-[#222]"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {city}
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

export default CityDropDown;
