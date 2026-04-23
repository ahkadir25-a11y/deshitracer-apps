"use client";

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaTimes } from "react-icons/fa";

interface SubCategory {
    _id: string;
    name: string;
}

interface Category {
    _id: string;
    name: string;
    subCategories?: SubCategory[];
}

interface Props {
    selected: string;
    onChange: (value: string) => void;

    showSubCategory?: boolean;
    className?: string;
    subSelected?: string;
    onChangeSubCategory?: (value: string) => void;
}

const CategoryDropdown: React.FC<Props> = ({
    selected,
    onChange,
    showSubCategory = false,
    subSelected = "",
    onChangeSubCategory,
    className
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [subOpen, setSubOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [subSearchTerm, setSubSearchTerm] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);
    const subRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_BASE_API}/category?page=1&limit=1000`).then((res) => {
            setCategories(res.data.data);
        });
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
                setSearchTerm("");
            }
            if (subRef.current && !subRef.current.contains(e.target as Node)) {
                setSubOpen(false);
                setSubSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCategory = categories.find((c) => c._id === selected);
    const selectedLabel = selectedCategory?.name || "Select Category";

    const selectedSub = selectedCategory?.subCategories?.find((s) => s._id === subSelected);
    const subLabel = selectedSub?.name || "Select Subcategory";

    const filteredCategories = categories
        .slice() // Create a shallow copy to avoid mutating the original array
        .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
        .filter((cat) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );



    const filteredSubCategories =
        (selectedCategory?.subCategories || [])
            .filter((sub) =>
                sub.name.toLowerCase().includes(subSearchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name));


    return (
        <div className="space-y-4">
            {/* Category Dropdown */}
            <div className="relative w-full" ref={dropdownRef}>
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className={`flex cursor-pointer items-center  justify-between w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:border- transition  ${className}`}
                >
                    <span>{selectedLabel}</span>
                    <div className="flex items-center gap-2 ml-2">
                        {selected && (
                            <FaTimes
                                className="text-gray-400 hover:text-red-500 cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange("");
                                    
                                    if (onChangeSubCategory) onChangeSubCategory("");
                                }}
                            />
                        )}
                        <FaChevronDown className={`text-xs transition-transform ${open ? "rotate-180" : ""}`} />
                    </div>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-auto"
                        >
                            <div className="p-2 ">
                                <input
                                    type="text"
                                    placeholder="Search category..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-1 text-xs border border-gray-200 rounded"
                                />
                            </div>
                            <ul>
                                {filteredCategories.map((cat) => (
                                    <li
                                        key={cat._id}
                                        onClick={() => {
                                            onChange(cat._id);
                                            setOpen(false);
                                            setSearchTerm("");
                                            if (onChangeSubCategory) onChangeSubCategory("");
                                        }}
                                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${selected === cat._id ? "bg-blue-100 text-[#222]" : "text-gray-700"
                                            }`}
                                    >
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subcategory Dropdown */}
            {showSubCategory && (selectedCategory?.subCategories?.length ?? 0) > 0 && (
                <div className="relative w-full" ref={subRef}>
                    <button
                        onClick={() => setSubOpen((prev) => !prev)}
                        className="flex items-center cursor-pointer justify-between w-full px-4 py-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm hover:border- transition"
                    >
                        <span>{subLabel}</span>
                        <div className="flex items-center gap-2 ml-2">
                            {subSelected && (
                                <FaTimes
                                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeSubCategory?.("");
                                    }}
                                />
                            )}
                            <FaChevronDown className={`text-xs transition-transform ${subOpen ? "rotate-180" : ""}`} />
                        </div>
                    </button>

                    <AnimatePresence>
                        {subOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden"
                            >
                                <div className="p-2 border-gray-100">
                                    <input
                                        type="search"
                                        placeholder="Search subcategory..."
                                        value={subSearchTerm}
                                        onChange={(e) => setSubSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                                    />
                                </div>
                                <ul className="max-h-48 overflow-y-auto">
                                    {filteredSubCategories.length > 0 ? (
                                        filteredSubCategories.map((sub) => (
                                            <li
                                                key={sub._id}
                                                onClick={() => {
                                                    onChangeSubCategory?.(sub._id);
                                                    setSubOpen(false);
                                                    setSubSearchTerm("");
                                                }}
                                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${subSelected === sub._id
                                                    ? "bg-blue-100 text-[#222]"
                                                    : "text-gray-700"
                                                    }`}
                                            >
                                                {sub.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-2 text-xs text-gray-400">No results found</li>
                                    )}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            )}
        </div>
    );
};

export default CategoryDropdown;
