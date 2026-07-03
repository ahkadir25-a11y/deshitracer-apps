
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from "react";

import { useGetAllSubCategoriesQuery } from "@/app/redux/services/sub-categories.services";
import DropdownWithOutsideClick from "./DropdownWithOutSideClick";
import { TSubCategory } from "@/components/admin-components/sub-categories/sub-categories.typers";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoCloseOutline } from "react-icons/io5";
import { TCategory } from "@/components/admin-components/categories/category.types";

const SingleSubCategoryDropdown = ({
  setSelectedId,
  label = "Select a sub category",
  hideLabel = true,
  className = "",
  selectedSubCategory,
  setSelectedSubCategory,
  selectedCategory,
}: {
  setSelectedId: (id: string) => void;
  label?: string;
  hideLabel?: boolean;
  className?: string;
  selectedSubCategory: TSubCategory | null;
  setSelectedSubCategory: any;
  selectedCategory: TCategory | null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef<HTMLButtonElement>(null);

  const { data: subCategoryData } = useGetAllSubCategoriesQuery({ limit: 10000 });

  const handleSubCategorySelect = (subCategory: TSubCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedId(subCategory._id);
    setIsOpen(false);
  };


  const filteredSubCategories = subCategoryData?.data
    ?.filter((subCategory: TSubCategory) => {
      // Only include subcategories whose parentCategory._id matches selectedCategory._id
      return (
        selectedCategory && subCategory.parentCategory?._id === selectedCategory._id
      );
    })
    ?.filter((subCategory: TSubCategory) => {
      // Apply search filter within the filtered list
      return subCategory.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });

  return (
    <div className="relative w-full">
      {hideLabel && <p className={`mb-1 text-xs font-medium text-gray-600 ${className}`}>{label}</p>}
      <button
        ref={dropdownRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border  border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedSubCategory?.name || label}
        </span>

        {selectedSubCategory ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSubCategory(null);
              setSelectedId("");
            }}
            className="text-red-500 !cursor-pointer text-lg ml-2"
            aria-label="Clear selected category"
          >
            <IoCloseOutline size={24} />
          </button>
        ) : (
          <TiArrowSortedDown
            className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180 text-" : ""
              }`}
            size={18}
          />
        )}
      </button>

      {/* Dropdown */}
      <DropdownWithOutsideClick
        open={isOpen}
        onOutsideClick={() => setIsOpen(false)}
        targetedElement={dropdownRef}
      >
        {isOpen && (
          <div className="absolute top-full z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-md">
            <div className="p-2 border-b border-gray-100">
              <input
                type="search"
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <ul className="max-h-52 overflow-y-auto p-2 space-y-1" role="listbox">
              {filteredSubCategories?.length > 0 ? (
                filteredSubCategories.map((subCategory: TSubCategory) => (
                  <li
                    key={subCategory._id}
                    onClick={() => handleSubCategorySelect(subCategory)}
                    className={`px-3 py-2 rounded-md cursor-pointer text-sm font-poppins transition ${selectedSubCategory?._id === subCategory._id
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    {subCategory.name}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-sm text-gray-400">No results found</li>
              )}
            </ul>
          </div>
        )}
      </DropdownWithOutsideClick>
    </div>

  );
};

export default SingleSubCategoryDropdown;
