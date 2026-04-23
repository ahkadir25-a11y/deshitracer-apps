/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState, useRef, useEffect } from "react";
import DropdownWithOutsideClick from "./DropdownWithOutSideClick";
import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";
import { TCategory } from "@/components/admin-components/categories/category.types";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoCloseOutline } from "react-icons/io5";

const CategorySubCategoryDropDown = ({
    setSelectedId,
    setSubSelectedId,
    parentCategory,
    label = "Select a Category",
    className = "",
    hideLabel,
    selectedCategory,
    setSelectedCategory,
    selectedSubCategory,
    setSelectedSubCategory,
    required,
    setSelectedType,
    selectedType
}: {
    setSelectedId: (id: string) => void;
    setSubSelectedId: (id: string) => void;
    parentCategory?: TCategory;
    label?: string;
    className?: string;
    hideLabel?: boolean;
    selectedCategory: any;
    setSelectedCategory: any;
    selectedSubCategory: any;
    setSelectedSubCategory: any;
    required: boolean;
    setSelectedType?: any;
    selectedType?: any;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubCategoryOpen, setIsSubCategoryOpen] = useState(false);
    const [subSearchTerm, setSubSearchTerm] = useState("");

    const dropdownRef = useRef<HTMLButtonElement>(null);

    const { data: categoryData } = useGetAllCategoriesQuery({
        page: 1,
        limit: 1000,
        searchTerm: "",
    });

    const handleCategorySelect = (category: TCategory) => {
        setSelectedCategory(category);
        setSelectedSubCategory(null); // Reset subcategory when category changes
        setSelectedId(category._id);
        setIsOpen(false);
    };

    const handleSubCategorySelect = (subCategory: any) => {
        setSelectedSubCategory(subCategory);
        setSubSelectedId(subCategory?._id);
        setIsSubCategoryOpen(false); // Close subcategory dropdown after selection
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type); // Handle type selection (Takeway or Restaurant)
    };

    const filteredCategories = categoryData?.data
        .slice()
        .sort((a: TCategory, b: TCategory) => a.name.localeCompare(b.name))
        .filter((cat: TCategory) =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const filteredSubCategories = selectedCategory?.subCategories?.filter((subCategory: any) =>
        subCategory?.name?.toLowerCase().includes(subSearchTerm.toLowerCase())
    );

    useEffect(() => {
        if (parentCategory && categoryData?.data) {
            const matchedCategory = categoryData.data.find(
                (cat: TCategory) => cat._id === parentCategory._id
            );

            if (matchedCategory) {
                setSelectedId(matchedCategory._id);
                setSelectedCategory(matchedCategory);
            }
        }
    }, [parentCategory, categoryData]);

    return (
        <div className="relative !cursor-pointer w-full">
            <div className={`flex items-center gap-1`}>
                {!hideLabel && <p className={`${className}`}>{label}</p>}
                {required && <span className="text-red-500">*</span>}
            </div>
            <button
                ref={dropdownRef}
                type="button"
                className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                <p className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
                    <span>{selectedCategory ? selectedCategory.name : label}</span>
                </p>

                {!selectedCategory && (
                    <div>
                        <TiArrowSortedDown
                            className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180 text-" : ""}`}
                            size={18}
                        />
                    </div>
                )}
                {selectedCategory && (
                    <button
                        type="button"
                        className="text-red-500 !cursor-pointer text-lg ml-2"
                        onClick={() => {
                            setSelectedCategory(null);
                            setSelectedId("");
                            setSelectedSubCategory(null);
                            setSubSearchTerm(""); // Reset subcategory search
                        }}
                    >
                        <IoCloseOutline size={24} />
                    </button>
                )}
            </button>
            <DropdownWithOutsideClick
                open={isOpen}
                onOutsideClick={() => setIsOpen(false)}
                targetedElement={dropdownRef}
            >
                {isOpen && (
                    <div className="absolute z-10 w-full bg-white rounded-md shadow-[2px_2px_10px_0px] shadow-gray-300 top-full">
                        <div className="p-2">
                            <input
                                type="search"
                                className="w-full border px-3 py-2 !bg-white focus:bg-white focus:!outline-none focus:ring-0 !rounded text-xs md:text-sm xl:text-sm font-normal font-poppins !border-[#DEE4E8] outline-none transition-colors duration-300"
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <ul className="max-h-52 overflow-y-auto px-2 space-y-1 pb-2">
                            {filteredCategories?.map((category: TCategory) => (
                                <li
                                    key={category._id}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer ${selectedCategory?._id === category._id
                                        ? "bg-blue-100"
                                        : "hover:bg-gray-100"
                                        }`}
                                >
                                    <span className="text-sm font-poppins text-gray-500">
                                        {category.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </DropdownWithOutsideClick>

            {/* Type Dropdown for Food & Dining */}
            {selectedCategory?.name === "Food & Dining" && (
                <div >
                    <select
                        id="type"
                        value={selectedType}
                        onChange={(e) => handleTypeSelect(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm mt-2"
                    >
                        <option value="">Select Type</option>
                        <option value="Takeway">Takeway</option>
                        <option value="Restaurant">Restaurant</option>
                    </select>
                </div>
            )}

            {/* Subcategory Dropdown with Search */}
            {selectedCategory && selectedCategory.subCategories && (
                <div className="relative !cursor-pointer mt-4 w-full">
                    <button
                        type="button"
                        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
                        onClick={() => setIsSubCategoryOpen(!isSubCategoryOpen)}
                    >
                        <p className="truncate p-1 text-xs text-left flex items-center gap-1 text-gray-700 font-poppins">
                            <span>{selectedSubCategory ? selectedSubCategory.name : "Select a Subcategory"}</span>
                            {required && <span className="text-red-500">*</span>}
                        </p>
                        {!selectedSubCategory && (
                            <TiArrowSortedDown
                                className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isSubCategoryOpen ? "rotate-180 text-" : ""}`}
                                size={18}
                            />
                        )}
                        {selectedSubCategory && (
                            <button
                                type="button"
                                className="text-red-500 !cursor-pointer text-lg ml-2"
                                onClick={() => setSelectedSubCategory(null)}
                            >
                                <IoCloseOutline size={24} />
                            </button>
                        )}
                    </button>

                    {/* Add DropdownWithOutsideClick for Subcategories */}
                    <DropdownWithOutsideClick
                        open={isSubCategoryOpen}
                        onOutsideClick={() => setIsSubCategoryOpen(false)}
                        targetedElement={dropdownRef}
                    >
                        {isSubCategoryOpen && (
                            <div className="absolute z-10 w-full bg-white rounded-md mt-1 shadow-[2px_2px_10px_0px] shadow-gray-300 top-full">
                                <div className="p-2">
                                    <input
                                        type="search"
                                        className="w-full border px-3 py-2 !bg-white focus:bg-white focus:!outline-none focus:ring-0 !rounded text-xs md:text-sm xl:text-sm font-normal font-poppins !border-[#DEE4E8] outline-none transition-colors duration-300"
                                        placeholder="Search subcategories..."
                                        value={subSearchTerm}
                                        onChange={(e) => setSubSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ul className="max-h-52 overflow-y-auto px-2 space-y-1 pb-2">
                                    {filteredSubCategories?.sort((a: any, b: any) => a.name.localeCompare(b.name))
                                        .map((subCategory: any) => (
                                            <li
                                                key={subCategory._id}
                                                onClick={() => handleSubCategorySelect(subCategory)}
                                                className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer ${selectedSubCategory?._id === subCategory._id
                                                    ? "bg-blue-100"
                                                    : "hover:bg-gray-100"
                                                    }`}
                                            >
                                                <span className="text-sm font-poppins text-gray-500">
                                                    {subCategory.name}
                                                </span>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </DropdownWithOutsideClick>
                </div>
            )}
        </div>
    );
};

export default CategorySubCategoryDropDown;
