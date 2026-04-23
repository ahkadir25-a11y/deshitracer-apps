/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, Suspense } from "react";
import BusinessCart from "@/components/shears/business/BusinessCart";

import PageHeader from "@/components/shears/page-header/PageHeader";
import { FaSearch } from "react-icons/fa"; // Import React Icons
import { LuSettings2 } from "react-icons/lu";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetAllBusinessListingQuery,
} from "@/app/redux/services/business.services";
import ToggleButton from "@/components/shears/button/ToggleButton";
import CountryDropDown from "@/components/shears/drop-Down/CountryDropDown";
import CityDropDown from "@/components/shears/drop-Down/CityDropDown";
import { TCategory } from "@/components/admin-components/categories/category.types";
import { useGetCategoryQuery } from "@/app/redux/services/categories.services";
import { TSubCategory } from "@/components/admin-components/sub-categories/sub-categories.typers";
import { Dropdown } from "@/components/shears/drop-Down/Dropdown";
import { DropdownItem } from "@/components/shears/shears-typers";
import { languagesArray } from "@/components/shears/languages";
import CategorySubCategoryDropDown from "@/components/shears/drop-Down/Category&SubCategoryDropDown";

interface Filters {
  searchTerm: string;
  location: string;
  category: string;
  country: string;
  provideHomeDelivery: boolean;
  provideOnlineService: boolean;
  offerInStorePickup: boolean;
  isParkingAvailable: boolean;
  offerOnlineBooking: boolean;
}

const Filters = ({
  filters,
  setFilters,
  handleFilterClick,
}: {
  filters: any;
  setFilters: (val: any) => void;
  handleFilterClick: () => void;
}) => {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const { data } = useGetCategoryQuery({
    categorySlug: category,
  });
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<TSubCategory | null>(null);
  const [secondLanguage, setsecondLanguage] = useState<DropdownItem | null>();

  const [languages, setLanguages] = useState<DropdownItem | null>(null);
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFilters((prev: any) => ({
      ...prev,
      price: Number(e.target.value),
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { id, value } = e.target;
    setFilters((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleToggleChange = (id: string, value: boolean) => {
    setFilters((prev: Filters) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev: Filters) => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    setFilters((prev: Filters) => ({
      ...prev,
      subCategory: subCategoryId,
    }));
  };
  const handleLanguageChange = (language: DropdownItem | null) => {
    setFilters((prev: Filters) => ({
      ...prev,
      officialLanguage: language?.label || "",
    }));
    setLanguages(language);
  };
  const handlesecondLanguageChange = (language: DropdownItem | null) => {
    setFilters((prev: Filters) => ({
      ...prev,
      secondLanguage: language?.label || "",
    }));
    setsecondLanguage(language);
  };

  const handleCountryChange = (country: string) => {
    setFilters((prev: Filters) => ({
      ...prev,
      country,
    }));
  };
  const handleCityChange = (city: string) => {
    setFilters((prev: Filters) => ({
      ...prev,
      city,
    }));
  };
  const router = useRouter();
  const removeQueryChat = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("location");
    params.delete("searchTrem");
    params.delete("category");

    const newPath = `/business?${params.toString()}`;
    router.push(newPath);
  };
  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      searchTerm: "",
      location: "",
      category: "",
      subCategory: "",
      officialLanguage: "",
      secondLanguage: "",
      provideHomeDelivery: false,
      provideOnlineService: false,
      offerInStorePickup: false,
      isParkingAvailable: false,
      offerOnlineBooking: false,
      isDeleted: false,
      isActive: true,
      country: "",
      city: "",
      established: "",
      howToHearAboutDesiTracker: "",
    });
    removeQueryChat();
    setSelectedCategory(null);
    setSelectedSubCategory(null);
    setLanguages(null);
    setsecondLanguage(null);
  };

  useEffect(() => {
    if (data?.data?._id) {
      setSelectedCategory(data.data); // This sets the dropdown category
      setFilters((prev: Filters) => ({
        ...prev,
        category: data.data._id, // Ensures filters reflect the correct category ID
      }));
    }
  }, [data?.data?._id]);


  useEffect(() => {
    if (filters.category || filters.subCategory) {
      handleFilterClick(); // this is your business fetch trigger
    }
  }, [filters.category, filters.subCategory]);

  return (
    <div className="w-full bg-white border border-neutral-200 rounded">
      <div className="flex bg-gray-100 border-b rounded-t border-neutral-200 justify-between items-center p-3">
        <div className="flex">
          <LuSettings2 size={30} />
          <p className="text-xl">Filter & Apply</p>
        </div>
        <button
          onClick={clearAllFilters}
          className="cursor-pointer px-2 py-1 border border-gray-500 text-black text-xs rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear All Filters
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* Keyword */}
        <div className="mb-4 flex items-center bg-neutral-50 border border-gray-200 rounded-sm px-2">
          <FaSearch className="h-5 w-5 text-blue-400" />
          <input
            type="text"
            id="searchTerm"
            value={filters.searchTerm}
            onChange={handleInputChange}
            className="ml-2 p-3 w-full bg-transparent border-none focus:outline-none"
            placeholder="Search business name..."
          />
        </div>
        <CountryDropDown
          selectedCountry={filters.country}
          setSelectedCountry={handleCountryChange}
        />

        <CityDropDown
          selectedCity={filters.city}
          setSelectedCity={handleCityChange}
          countryName={filters.country}
          setFilters={setFilters}
        />

        <CategorySubCategoryDropDown
required={true}
          setSelectedId={handleCategoryChange} // Pass the selected category ID to handleCategoryChange
          label="Select Category"
          hideLabel
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setSelectedSubCategory={setSelectedSubCategory}
          selectedSubCategory={selectedSubCategory}
          setSubSelectedId={handleSubCategoryChange}
          parentCategory={category ? { _id: category } as TCategory : undefined}
        />
        <Dropdown
          items={languagesArray}
          placeholder="Select Language"
          label=""
          required={true}
          onSelect={handleLanguageChange}
          selectedItem={languages}
        />
        {/* Select Second Languages Options */}
        <Dropdown
          items={languagesArray}
          placeholder="Select Second Language"
          label=""
          required={true}
          onSelect={handlesecondLanguageChange}
          selectedItem={secondLanguage}
        />

        {/* Provide Home Delivery */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Home Delivery</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("provideHomeDelivery", value)
            }
            toggleValue={filters.provideHomeDelivery}
          />
        </div>

        {/* Provide Online Service */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Online Service</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("provideOnlineService", value)
            }
            toggleValue={filters.provideOnlineService}
          />
        </div>
        {/* Provide Online Service */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Halal Service</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("isHalal", value)
            }
            toggleValue={filters.isHalal}
          />
        </div>
        {/* Offer In-Store Pickup */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">In-Store Pickup</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("offerInStorePickup", value)
            }
            toggleValue={filters.offerInStorePickup}
          />
        </div>

        {/* Is Parking Available */}
        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Parking Available</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("isParkingAvailable", value)
            }
            toggleValue={filters.isParkingAvailable}
          />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <label className="mr-2">Online Booking</label>
          <ToggleButton
            onToggle={(value) =>
              handleToggleChange("offerOnlineBooking", value)
            }
            toggleValue={filters.offerOnlineBooking}
          />
        </div>
        {/* 
        <button
          onClick={handleFilterClick}
          className="mt-4 w-full cursor-pointer py-2.5 bg-black text-white text-xl rounded focus:outline-none focus:ring-2 focus:ring-"
        >
          Apply & Filter
        </button> */}
      </div>
    </div>
  );
};

const BusinessSearchListing = () => {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    searchTerm: "",
    location: "",
    category: "",
    subCategory: "",
    officialLanguage: "",
    country: "",
    provideHomeDelivery: false,
    provideOnlineService: false,
    offerInStorePickup: false,
    isParkingAvailable: false,
    offerOnlineBooking: false,
  });

  const searchTrem = searchParams.get("searchTrem");
  const location = searchParams.get("location");
  const category = searchParams.get("category");
  const {
    data: businesses,
    isLoading,
    isError,
    refetch,
  } = useGetAllBusinessListingQuery(filters);

  const handleFilterClick = () => {
    refetch();
  };

  useEffect(() => {
    if (searchTrem) {
      setFilters((prev) => ({ ...prev, searchTerm: searchTrem }));
    }
    if (location) {
      setFilters((prev) => ({
        ...prev,
        location,
        country: location, // ✅ Set country from URL param
      }));
    }
    if (category) {
      setFilters((prev) => ({ ...prev, category })); // ✅ fix here
    }
  }, [searchTrem, location, category]);


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="bg-white mx-auto">
        {/* <BusinessSearchForm /> */}
        <PageHeader
          className="fabBg md:h-[30vh]  h-[150px] "
          title="Find Business Near You!"
          subtitle=""
        />
        <div className="flex md:flex-row flex-col gap-10 justify-center md:my-20 my-5 w-full container mx-auto ">
          {/* left site */}
          <div className="md:max-w-sm w-full">
            <Filters
              filters={filters}
              setFilters={setFilters}
              handleFilterClick={handleFilterClick}
            />
          </div>
          {/* Right site */}
          <div className="w-full">
            <div className="w-full bg-white border p-3 border-neutral-200 rounded">
              {businesses?.data?.length} Results
            </div>
            <div className="space-y-10 mt-4">
              {/* Show shimmer effect when data is loading */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse bg-gray-200 h-40 p-4 rounded-md shadow-sm"
                    >
                      <div className="w-3/4 h-6 bg-gray-300 rounded-sm mt-4 mx-4"></div>
                      <div className="w-1/2 h-6 bg-gray-300 rounded-sm mt-2 mx-4"></div>
                      <div className="w-full h-4 bg-gray-300 rounded-sm mt-2 mx-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                businesses?.data?.map((business: any) => (
                  <BusinessCart key={business?._id} business={business} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default BusinessSearchListing;
