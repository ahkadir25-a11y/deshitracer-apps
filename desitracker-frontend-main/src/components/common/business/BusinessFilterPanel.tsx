"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomToggle from "./CustomToggle";
import PageHeader from "@/components/shears/page-header/PageHeader";
import BusinessCard from "@/components/shears/business/BusinessCart";
import CategoryDropdown from "./CategoryDropdown";
import { languagesArray } from "@/components/shears/languages";
import CountryCityDropdown from "./CountryCityDropdown";
import { useSearchParams } from "next/navigation";
import LanguageDropdowns from "./LanguageDropdowns";

interface Business {
    _id: string;
    businessName: string;
    slug: string;
    category?: {
        name: string;
    };
    subCategory?: {
        name: string;
    };
    isActive: boolean;
    media?: {
        images?: { url: string }[];
    };
    locations?: {
        city?: string;
        state?: string;
        country?: string;
    };
    about?: string;
    contactDetails?: {
        phoneNumber?: string;
        websiteUrl?: string;
    };
    operationDetails?: {
        provideOnlineService?: boolean;
        provideHomeDelivery?: boolean;
        offerInStorePickup?: boolean;
        offerOnlineBooking?: boolean;
        isHalal?: boolean;
    };
}

const BusinessFilterPanel = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [itemsPerPage] = useState(10); // Number of items per page
    const searchParams = useSearchParams();
    const initialFilters = {
        searchTerm: searchParams.get("searchTerm") || "",
        businessName: "",
        slug: "",
        owner: "",
        category: searchParams.get("category") || "",
        subCategory: "",
        city: searchParams.get("city") || "",
        state: "",
        email: "",
        phoneNumber: "",
        country: searchParams.get("location") || "United Kingdom",
        isActive: undefined,
        isDeleted: undefined,
        isWheelChairAccessible: false,
        offerSpecialDiscount: false,
        provideHomeDelivery: false,
        provideOnlineService: false,
        offerOnlineBooking: false,
        isHalal: false,
        isParkingAvailable: false,
        officialLanguage: "",
        secondLanguage: "",
        acceptedPaymentMethod: "",
    };
    const [filters, setFilters] = useState(initialFilters);

    type FilterValue = string | boolean | undefined;

    const handleChange = (field: string, value: FilterValue) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const fetchBusinesses = async () => {
        try {
            setLoading(true);
            const cleanedParams = Object.fromEntries(
                Object.entries(filters).filter(([, value]) => {
                    if (typeof value === "boolean") return value === true;
                    return value !== "" && value !== undefined && value !== null;
                })
            );

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API}/business`, {
                params: {
                    ...cleanedParams,
                    isActive: true,
                    page: currentPage,
                    limit: itemsPerPage,
                },
            });

            const data = response.data;
            setBusinesses(data?.data || []);
            setTotalPages(data?.meta?.totalPage || 1);
        } catch (err) {
            console.error("Failed to fetch businesses", err);
        } finally {
            setLoading(false);
        }
    };
// 👉 Add this helper above your component (same file is fine)
const getVisiblePages = (current: number, total: number, maxVisible = 5) => {
  // If few pages, show all
  if (total <= maxVisible + 2) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const delta = Math.floor(maxVisible / 2); // e.g. 2 when maxVisible=5
  let left = Math.max(2, current - delta);
  let right = Math.min(total - 1, current + delta);

  // Ensure we always show exactly maxVisible middle pages when possible
  const needed = maxVisible - (right - left + 1);
  if (needed > 0) {
    if (left === 2) {
      right = Math.min(total - 1, right + needed);
    } else if (right === total - 1) {
      left = Math.max(2, left - needed);
    }
  }

  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [1];
  if (left > 2) pages.push("ellipsis-left");
  for (let p = left; p <= right; p++) pages.push(p);
  if (right < total - 1) pages.push("ellipsis-right");
  if (total > 1) pages.push(total);
  return pages;
};

    useEffect(() => {
        fetchBusinesses();
    }, [filters, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
        }
    };

    return (
        <div>
            <PageHeader
                className="fabBg md:h-[33vh] h-[150px]"
                title="Find Business Near You!"
                subtitle=""
            />
            <div className="grid grid-cols-1 max-w-7xl mx-auto px-4 py-8 lg:grid-cols-6 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Business Filters</h2>
                        <div className="grid !cursor-pointer grid-cols-1 gap-4">
                            <input
                                className="border border-gray-300 cursor-pointer px-3 py-2 rounded-md text-sm w-full"
                                placeholder="Search Term"
                                value={filters.searchTerm}
                                onChange={(e) => handleChange("searchTerm", e.target.value)}
                            />

                            <CategoryDropdown
                                selected={filters.category}
                                onChange={(val) => handleChange("category", val)}
                                showSubCategory={true}
                                subSelected={filters.subCategory}
                                onChangeSubCategory={(val) => handleChange("subCategory", val)}
                            />

                            <CountryCityDropdown
                                selectedCountry={filters.country}
                                selectedCity={filters.city}
                                onCountryChange={(val) => handleChange("country", val)}
                                onCityChange={(val) => handleChange("city", val)}
                            />

                            <LanguageDropdowns
                                languagesArray={languagesArray.map(lang => ({
                                    ...lang,
                                    id: String(lang.id),
                                }))}
                                filters={filters}
                                handleChange={handleChange}
                            />
                        </div>
                        {/* 🧩 Toggle Section */}
                        <div className="grid grid-cols-1 gap-4 mt-6">
                            <CustomToggle
                                label="Wheelchair Accessible"
                                checked={filters.isWheelChairAccessible}
                                onChange={() =>
                                    handleChange("isWheelChairAccessible", !filters.isWheelChairAccessible)
                                }
                            />
                            <CustomToggle
                                label="Special Discount"
                                checked={filters.offerSpecialDiscount}
                                onChange={() =>
                                    handleChange("offerSpecialDiscount", !filters.offerSpecialDiscount)
                                }
                            />
                            <CustomToggle
                                label="Home Delivery"
                                checked={filters.provideHomeDelivery}
                                onChange={() =>
                                    handleChange("provideHomeDelivery", !filters.provideHomeDelivery)
                                }
                            />
                            <CustomToggle
                                label="Halal Service"
                                checked={filters.isHalal}
                                onChange={() =>
                                    handleChange("isHalal", !filters.isHalal)
                                }
                            />
                            <CustomToggle
                                label="Online Service"
                                checked={filters.provideOnlineService}
                                onChange={() =>
                                    handleChange("provideOnlineService", !filters.provideOnlineService)
                                }
                            />
                            <CustomToggle
                                label="Online Booking"
                                checked={filters.offerOnlineBooking}
                                onChange={() =>
                                    handleChange("offerOnlineBooking", !filters.offerOnlineBooking)
                                }
                            />
                            <CustomToggle
                                label="Parking Available"
                                checked={filters.isParkingAvailable}
                                onChange={() =>
                                    handleChange("isParkingAvailable", !filters.isParkingAvailable)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    {loading ? (
                        <p className="text-center text-gray-500">Loading businesses...</p>
                    ) : businesses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center text-gray-500 py-8">
                            <p className="text-lg font-medium">No businesses found.</p>
                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2">
                            {businesses.map((biz) => (
                                <BusinessCard key={biz?._id} business={biz} />
                            ))}
                        </div>
                    )}

                  {/* Pagination Controls */}
{totalPages > 1 && (
  <nav aria-label="Pagination" className="mt-6">
    {/* Mobile: compact (smaller than sm) */}
    <div className="flex items-center justify-center gap-3 sm:hidden">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#222] text-white hover:bg-blue-700"
        }`}
        aria-label="Previous page"
      >
        Prev
      </button>

      <span className="text-sm text-gray-700 tabular-nums">
        {currentPage} / {totalPages}
      </span>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#222] text-white hover:bg-blue-700"
        }`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>

    {/* Desktop/tablet: windowed pages with ellipses */}
    <div className="hidden sm:flex items-center justify-center gap-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          currentPage === 1
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#222] text-white hover:bg-blue-700"
        }`}
        aria-label="Previous page"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {getVisiblePages(currentPage, totalPages, 5).map((item, idx) => {
          if (item === "ellipsis-left" || item === "ellipsis-right") {
            return (
              <span key={`${item}-${idx}`} className="px-2 text-gray-500 select-none">
                …
              </span>
            );
          }
          const page = item as number;
          const isActive = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                isActive
                  ? "bg-[#222] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-[#222] text-white hover:bg-blue-700"
        }`}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  </nav>
)}

                </div>
            </div>
        </div>
    );
};

export default BusinessFilterPanel;