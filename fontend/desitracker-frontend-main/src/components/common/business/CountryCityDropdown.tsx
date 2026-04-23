/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes } from "react-icons/fa";

interface City {
    label: string;
    value: string;
}

interface Country {
    label: string;
    value: string;
    cities: City[];
}

const Dropdown = ({
    label,
    value,
    options,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    placeholder: string;
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, []);

    const filtered = options.filter(
        (opt) => opt.label && opt.label.toLowerCase().includes(search?.toLowerCase())
    );


    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex justify-between cursor-pointer items-center w-full px-3 py-2 border border-gray-300 bg-white rounded-md text-sm hover:border-"
            >
                <span>{options.find((o) => o.value === value)?.label || placeholder}</span>
                <div className="flex items-center gap-1">
                    {value && (
                        <FaTimes
                            className="text-gray-400 hover:text-red-500 cursor-pointer text-sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                            }}
                        />
                    )}
                    <FaChevronDown
                        className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}
                    />
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md"
                    >
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder={`Search ${label.toLowerCase()}`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-2 py-1 text-sm border rounded border-gray-300"
                            />
                        </div>
                        <ul className="max-h-52 overflow-y-auto text-sm">
                            {filtered.length ? (
                                filtered.map((opt) => (
                                    <li
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                            setSearch("");
                                        }}
                                        className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${value === opt.value ? "bg-blue-100 text-[#222]" : ""
                                            }`}
                                    >
                                        {opt.label}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-2 text-gray-400">No matches</li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CountryCityDropdown = ({
    selectedCountry,
    selectedCity,
    onCountryChange,
    onCityChange,
}: {
    selectedCountry: string;
    selectedCity: string;
    onCountryChange: (val: string) => void;
    onCityChange: (val: string) => void;
}) => {
    const [countries, setCountries] = useState<Country[]>([]);

    useEffect(() => {
        fetch("/country.json")
            .then((res) => res.json())
            .then((data) => {
                const transformed: Country[] = data.map((country: any) => ({
                    label: country.name,
                    value: country.name,
                    cities: country.city.map((c: string) => ({
                        label: c,
                        value: c,
                    })),
                }));
                setCountries(transformed);
            })
            .catch((err) => console.error("Failed to load countries:", err));
    }, []);


    const countryOptions = countries.map((c) => ({
        label: c.label,
        value: c.value,
    }));

    const selectedCountryObj = countries?.find((c) => c.value === selectedCountry);
    const cityOptions = selectedCountryObj?.cities || [];

    return (
        <div className="space-y-4 cursor-pointer">
            <Dropdown
                label="Country"
                value={selectedCountry}
                onChange={(val) => {
                    onCountryChange(val);
                    onCityChange(""); // Reset city when country changes
                }}
                options={countryOptions}
                placeholder="Select Country"
            />
            {selectedCountry && (
                <Dropdown
                    label="City"
                    value={selectedCity}
                    onChange={onCityChange}
                    options={cityOptions}
                    placeholder="Select City"
                />
            )}
        </div>
    );
};

export default CountryCityDropdown;
