import React, { useState, useRef, useEffect } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoCloseOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { currencies } from "@/app/utils/currencies";

interface CurrencySelectProps {
  currency: string;
  setCurrency: (currency: string) => void;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({ currency, setCurrency }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Alphabetically sort the currencies
  const sortedCurrencies = [...currencies].sort((a, b) => a.name.localeCompare(b.name));

  // Filter currencies based on the search term
  const filteredCurrencies = sortedCurrencies.filter((currencyOption) =>
    currencyOption.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show the first 10 currencies
  const displayedCurrencies = filteredCurrencies.slice(0, 70);

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
        style={{ minHeight: "40px" }}
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {currency || "Select a Currency"}
        </span>
        {currency ? (
          <button
            type="button"
            className="text-red-500 !cursor-pointer text-lg ml-2"
            aria-label="Clear selected currency"
            onClick={(e) => {
              e.stopPropagation();
              setCurrency("");
              setSearchTerm("");
            }}
          >
            <IoCloseOutline size={24} />
          </button>
        ) : (
          <TiArrowSortedDown
            className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            size={18}
          />
        )}
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute z-50 w-full mt-0.5 bg-white border border-gray-300"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="search"
              placeholder="Search for a currency"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto text-left p-1 space-y-1">
            {displayedCurrencies.length > 0 ? (
              displayedCurrencies.map((currencyOption) => (
                <li
                  key={currencyOption.code}
                  onClick={() => {
                    setCurrency(currencyOption.code);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors font-medium ${currency === currencyOption.code
                    ? "bg-blue-50 text-[#222]"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {currencyOption.name} ({currencyOption.code})
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400">No results found</li>
            )}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default CurrencySelect;
