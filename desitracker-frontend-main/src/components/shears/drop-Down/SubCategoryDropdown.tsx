/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import { IoCaretDownOutline } from "react-icons/io5";
import DropdownWithOutsideClick from "./DropdownWithOutSideClick";
import { TSubCategory } from "@/components/admin-components/sub-categories/sub-category";
import { useGetAllSubCategoriesQuery } from "@/app/redux/services/sub-categories.services";

const SubCategoryDropdown = ({
  selectedIds,
  oneSelectedIds,
}: {
  selectedIds: string[];
  oneSelectedIds: (ids: string[]) => void;
  defaultValues?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLButtonElement>(null);

  const { data: subCategoryData, isLoading: subCategoryLoading } =
    useGetAllSubCategoriesQuery({
      sort: JSON.stringify({ name: "asc" }),
    });
  const handleSubCategorySelect = (category: TSubCategory) => {
    const isSelected = selectedIds.includes(category._id);
    let updatedIds = [...selectedIds];
    if (!isSelected) {
      // Add the subcategory to selectedIds if not selected
      updatedIds.push(category._id);
    } else {
      updatedIds = updatedIds.filter((id) => id !== category._id);
    }
    oneSelectedIds(updatedIds);
    setIsOpen(false);
  };

  const filteredSubCategories = subCategoryData?.data?.filter(
    (category: TSubCategory) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (subCategoryLoading) {
    return <p>Loading...!</p>;
  }
  return (
    <div className="relative">
      <div>
        <p>Select Sub Categories</p>

        <button
          ref={dropdownRef}
          type="button"
          className="w-full border cursor-pointer shadow flex justify-between items-center bg-white px-3 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#52A5FE] hover:ring-[#52A5FE] rounded text-xs md:text-sm xl:text-sm font-normal font-poppins border-[#DEE4E8] outline-none transition-colors duration-300 focus:ring-2 ring-[#52A5FE]"
          onClick={() => setIsOpen(!isOpen)}
        >
          <p className="text-sm font-poppins px-1">
            {selectedIds.length > 0
              ? selectedIds.map((id) => (
                  <span key={id} className="mr-2">
                    {
                      subCategoryData?.data?.find((sub: any) => sub._id === id)
                        ?.name
                    }
                  </span>
                ))
              : "Select Parent Categories"}
          </p>
          <IoCaretDownOutline className="text-black" />
        </button>
        <DropdownWithOutsideClick
          open={isOpen}
          onOutsideClick={() => setIsOpen(false)}
          targetedElement={dropdownRef}
        >
          <div>
            {isOpen && (
              <div
                className={`absolute z-10 w-full bg-white rounded-md shadow-[2px_2px_10px_0px] shadow-gray-300 top-full`}
              >
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
                  {filteredSubCategories?.map((SubCategory: TSubCategory) => (
                    <li
                      key={SubCategory._id}
                      onClick={() => handleSubCategorySelect(SubCategory)}
                      className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer ${
                        selectedIds.includes(SubCategory._id)
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <span className="text-sm font-poppins text-gray-500">
                        {SubCategory.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DropdownWithOutsideClick>
      </div>
    </div>
  );
};

export default SubCategoryDropdown;
