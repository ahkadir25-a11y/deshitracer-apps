"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiX } from "react-icons/fi"; // Import Feather Icon

interface Language {
  id: string;
  label: string;
}

interface Filters {
  officialLanguage: string;
  secondLanguage: string;
}

interface Props {
  languagesArray: Language[];
  filters: Filters;
  handleChange: (field: keyof Filters, value: string) => void;
}

const LanguageDropdowns: React.FC<Props> = ({ languagesArray, filters, handleChange }) => {
  const [searchOfficial, setSearchOfficial] = useState('');
  const [searchSecond, setSearchSecond] = useState('');
  const [showOfficialDropdown, setShowOfficialDropdown] = useState(false);
  const [showSecondDropdown, setShowSecondDropdown] = useState(false);

  const officialRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (officialRef.current && !officialRef.current.contains(event.target as Node)) {
        setShowOfficialDropdown(false);
      }
      if (secondRef.current && !secondRef.current.contains(event.target as Node)) {
        setShowSecondDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedLanguages = [...languagesArray].sort((a, b) => a.label.localeCompare(b.label));

  const filteredOfficial = sortedLanguages.filter(lang =>
    lang.label.toLowerCase().includes(searchOfficial.toLowerCase())
  );

  const filteredSecond = sortedLanguages.filter(lang =>
    lang.label.toLowerCase().includes(searchSecond.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Official Language */}
      <div className="relative" ref={officialRef}>
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full">
          <input
            type="text"
            placeholder="Select Language you want to speak"
            value={searchOfficial || filters.officialLanguage}
            onChange={(e) => {
              setSearchOfficial(e.target.value);
              setShowOfficialDropdown(true);
            }}
            onFocus={() => setShowOfficialDropdown(true)}
            className="flex-1 outline-none text-sm"
          />
          {filters.officialLanguage && (
            <FiX
              className="h-5 w-5 text-gray-400 cursor-pointer"
              onClick={() => {
                handleChange('officialLanguage', '');
                setSearchOfficial('');
              }}
            />
          )}
        </div>
        {showOfficialDropdown && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-auto w-full">
            {filteredOfficial.length > 0 ? (
              filteredOfficial.map(lang => (
                <li
                  key={lang.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleChange('officialLanguage', lang.label);
                    setSearchOfficial(lang.label);
                    setShowOfficialDropdown(false);
                  }}
                >
                  {lang.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No matches found</li>
            )}
          </ul>
        )}
      </div>

      {/* Second Language */}
      <div className="relative" ref={secondRef}>
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-full">
          <input
            type="text"
            placeholder="Select Second Language"
            value={searchSecond || filters.secondLanguage}
            onChange={(e) => {
              setSearchSecond(e.target.value);
              setShowSecondDropdown(true);
            }}
            onFocus={() => setShowSecondDropdown(true)}
            className="flex-1 outline-none text-sm"
          />
          {filters.secondLanguage && (
            <FiX
              className="h-5 w-5 text-gray-400 cursor-pointer"
              onClick={() => {
                handleChange('secondLanguage', '');
                setSearchSecond('');
              }}
            />
          )}
        </div>
        {showSecondDropdown && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-md max-h-48 overflow-auto w-full">
            {filteredSecond.length > 0 ? (
              filteredSecond.map(lang => (
                <li
                  key={lang.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    handleChange('secondLanguage', lang.label);
                    setSearchSecond(lang.label);
                    setShowSecondDropdown(false);
                  }}
                >
                  {lang.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No matches found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LanguageDropdowns;
