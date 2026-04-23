"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import DropdownWithOutsideClick from "./DropdownWithOutSideClick";
import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";
import { TCategory } from "@/components/admin-components/categories/category.types";
import { TiArrowSortedDown } from "react-icons/ti";
import { IoCloseOutline } from "react-icons/io5";

const CategoryDropdown = ({
  setSelectedId,
  parentCategory,
  label,
  className = "",
  hideLabel,
  selectedCategory,
  setSelectedCategory,
}: {
  setSelectedId: (id: string) => void;
  parentCategory?: TCategory;
  label?: string;
  className?: string;
  hideLabel?: boolean;
  selectedCategory: any;
  setSelectedCategory: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLButtonElement>(null);

  const { data: categoryData } = useGetAllCategoriesQuery({
    page: 1,
    limit: 1000,
    searchTerm: "",
    // Removed backend sorting here
  });

  const handleCategorySelect = (category: TCategory) => {
    setSelectedCategory(category);
    setSelectedId(category._id);
    setIsOpen(false);
  };

  // Filter categories based on searchTerm
  let filteredCategories = categoryData?.data?.filter((category: TCategory) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  
  // Sort the filtered categories alphabetically by name
  filteredCategories = filteredCategories.sort((a: TCategory, b: TCategory) =>
    a.name.localeCompare(b.name)
  );
  useEffect(() => {
    if(parentCategory){
      setSelectedCategory(parentCategory ?? null);
      setSelectedId(parentCategory?._id ?? "");
    }
  }, [parentCategory]);


  return (
    <div className="relative !cursor-pointer w-full">
      {!hideLabel && (
        <label className={`mb-1 text-xs font-medium text-gray-600 ${className}`}>
          {label}
        </label>
      )}

      <button
        ref={dropdownRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
      >
        <span className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedCategory?.name || "Select category"} {/* fallback text */}
        </span>

        {selectedCategory ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCategory(null);
              setSelectedId("");
            }}
            className="text-red-500 !cursor-pointer text-lg ml-2"
            aria-label="Clear selected category"
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

      <DropdownWithOutsideClick
        open={isOpen}
        onOutsideClick={() => setIsOpen(false)}
        targetedElement={dropdownRef}
      >
        <div className="absolute top-full !z-50 w-full bg-white border border-gray-200  ">
          <div className="p-2 border-b border-gray-100">
            <input
              type="search"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs text-gray-700 bg-white border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto text-left p-1 space-y-1" role="listbox">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category: TCategory) => (
                <li
                  key={category._id}
                  onClick={() => handleCategorySelect(category)}
                  className={`px-3 py-2 text-xs rounded cursor-pointer transition-colors font-medium ${selectedCategory?._id === category._id
                    ? "bg-blue-50 text-[#222]"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {category.name}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-xs text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      </DropdownWithOutsideClick>
    </div>
  );
};

export default CategoryDropdown;
