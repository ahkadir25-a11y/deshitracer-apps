"use client";
import React from "react";
import ToggleButton from "@/components/shears/button/ToggleButton";
import { FaSearch, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import { LuSettings2 } from "react-icons/lu";
import { useRouter } from "next/navigation";

// Filters Interface
interface Filters {
  searchTerm: string;
  location: string;
  category: string;
  subCategory: string;
  provideHomeDelivery: boolean;
  provideOnlineService: boolean;
  offerInStorePickup: boolean;
  isParkingAvailable: boolean;
  offerOnlineBooking: boolean;
  acceptedPaymentMethod: string;
  foodOptions: string;
  offerSpecialDiscount: boolean;
  isWheelChairAccessible: boolean;
}

interface FiltersProps {
  filters: Filters;
  setFilters: (val: Filters | ((prev: Filters) => Filters)) => void;
  handleFilterClick: () => void;
  resetFilters?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  filters,
  setFilters,
  handleFilterClick,
}) => {
  const router = useRouter(); // Initialize router

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { id, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleToggleChange = (id: string, value: boolean) => {
    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Function to update query params in the URL when filters are applied
  const updateQueryParams = () => {
    const params = new URLSearchParams();

    // Only include filters that are not falsy or empty
    Object.keys(filters).forEach((key) => {
      const filterKey = key as keyof Filters; // Assert key as keyof Filters
      if (filters[filterKey] && filters[filterKey] !== "") {
        params.set(key, String(filters[filterKey]));
      }
    });

    router.replace(`?${params.toString()}`); // Update the URL with the current filters
  };

  // Handle the "Apply & Filter" button click
  const handleApplyFilter = () => {
    updateQueryParams();
    handleFilterClick();
  };

  // Handle the "Clear All" button click
  const handleClearAll = () => {
    setFilters({
      searchTerm: "",
      location: "",
      category: "",
      subCategory: "",
      provideHomeDelivery: false,
      provideOnlineService: false,
      offerInStorePickup: false,
      isParkingAvailable: false,
      offerOnlineBooking: false,
      acceptedPaymentMethod: "",
      foodOptions: "",
      offerSpecialDiscount: false,
      isWheelChairAccessible: false,
    });

    const params = new URLSearchParams();
    router.replace(`?${params.toString()}`); // Clear the search params from the URL
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded">
      <div className="flex bg-gray-100 border-b rounded-t border-neutral-200 justify-between items-center p-3">
        <p className="text-2xl">Filter & Apply</p>
        <LuSettings2 size={30} />
      </div>
      <div className="p-4">
        {/* Keyword */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <FaSearch className="h-5 w-5 text-blue-400" />
          <input
            type="text"
            id="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
            placeholder="Search products..."
          />
        </div>

        {/* Location */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <FaMapMarkerAlt className="h-5 w-5 text-blue-400" />
          <input
            type="text"
            id="location"
            value={filters.location}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
            placeholder="Enter location..."
          />
        </div>

        {/* Category */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <FaBriefcase className="h-5 w-5 text-blue-400" />
          <select
            id="category"
            value={filters.category}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
          >
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home</option>
            <option value="toys">Toys</option>
          </select>
        </div>

        {/* Subcategory */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <select
            id="subCategory"
            value={filters.subCategory}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
          >
            <option value="">Select Subcategory</option>
            <option value="smartphones">Smartphones</option>
            <option value="laptops">Laptops</option>
          </select>
        </div>

        {/* Payment Method */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <select
            id="acceptedPaymentMethod"
            value={filters.acceptedPaymentMethod}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full cursor-pointer bg-transparent border-none focus:outline-none"
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Apple Pay">Apple Pay</option>
          </select>
        </div>

        {/* Food Options */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <select
            id="foodOptions"
            value={filters.foodOptions}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
          >
            <option value="">Select Food Options</option>
            <option value="Halal">Halal</option>
            <option value="Kosher">Kosher</option>
            <option value="Vegan">Vegan</option>
          </select>
        </div>

        {/* Special Discount */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Special Discount</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("offerSpecialDiscount", value)
            }
            toggleValue={filters.offerSpecialDiscount}
          />
        </div>

        {/* Wheelchair Accessibility */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Wheelchair Accessible</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("isWheelChairAccessible", value)
            }
            toggleValue={filters.isWheelChairAccessible}
          />
        </div>

        {/* Apply & Reset Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={handleApplyFilter}
            className="w-full py-2.5 bg-black text-white text-xl rounded focus:outline-none focus:ring-2 focus:ring-"
          >
            Apply & Filter
          </button>
          <button
            onClick={handleClearAll}
            className="w-full py-2.5 bg-gray-500 text-white text-xl rounded focus:outline-none focus:ring-2 focus:ring-gray-500 ml-2"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
