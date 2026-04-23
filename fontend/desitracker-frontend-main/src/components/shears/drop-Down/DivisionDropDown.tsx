/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useRef } from "react";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoCloseOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import DropdownWithOutSideClick from "./DropdownWithOutSideClick"; // Assuming this component is the same as in CountryDropdown

interface DivisionDropdownProps {
  countryData: any;
  selectedDivision: string;
  setSelectedDivision: (division: string) => void;
}

const DivisionDropdown: React.FC<DivisionDropdownProps> = ({
  countryData,
  selectedDivision,
  setSelectedDivision,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredDivisions = countryData?.divisions?.filter((division: any) =>
    division?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
        style={{ minHeight: "40px" }}
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedDivision || "Select a Division"}
        </span>
        {selectedDivision ? (
          <button
            type="button"
            className="text-red-500 !cursor-pointer text-lg ml-2"
            aria-label="Clear selected division"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDivision("");
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
          className="absolute z-50 w-full mt-0.5 bg-white border border-gray-300"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              type="search"
              placeholder="Search for a Division"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <ul className="max-h-52 overflow-y-auto text-left p-1 space-y-1">
            {filteredDivisions?.length > 0 ? (
              filteredDivisions.map((division: any, idx: number) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedDivision(division.name);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors font-medium ${selectedDivision === division.name
                    ? "bg-blue-50 text-[#222]"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {division.name}
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

export default DivisionDropdown;
