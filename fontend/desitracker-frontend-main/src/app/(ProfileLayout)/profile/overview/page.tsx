/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useAppSelector } from "@/app/redux/hoook";
import {
  useGetAllBusinessQuery,
  useGetBusinessAnalyticsQuery,
} from "@/app/redux/services/business.services";
import React, { useState } from "react";
import { IoAnalytics } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa";

interface MonthlyData {
  month: string;
  count: number;
}

interface AnalyticsData {
  totalCount: number;
  monthly: MonthlyData[];
}

interface Business {
  _id: string;
  businessName: string;
  category: { name: string };
  established: { $date: string };
  contactDetails: { websiteUrl: string };
}

interface AnalyticsCardProps {
  businessId: string;
  business: Business;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ businessId, business }) => {
  const { data, isLoading, isError } = useGetBusinessAnalyticsQuery(businessId);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleExpand = () => setIsExpanded(!isExpanded);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-1"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-red-500 text-center">
        ⚠️ Failed to load analytics for <strong>{business.businessName}</strong>
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center text-gray-500">
        📊 No analytics data available for <strong>{business.businessName}</strong>
      </div>
    );
  }

  const { totalCount, monthly }: AnalyticsData = data.data;

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">{business.businessName}</h2>
        <button
          onClick={handleToggleExpand}
          className="text-[#222] cursor-pointer hover:underline text-sm flex items-center gap-1"
        >
          {isExpanded ? "Hide Analytics" : "View Analytics"} <IoAnalytics />
        </button>
      </div>
      <div className="text-sm text-gray-600">
        <p><strong>Category:</strong> {business.category?.name}</p>
        <p>
          <strong>Website:</strong>{" "}
          <a
            href={business.contactDetails?.websiteUrl}
            className="text-black hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {business.contactDetails?.websiteUrl}
          </a>
        </p>
      </div>
      {isExpanded && (
        <div className="mt-3">
          <h3 className="text-sm font-medium mb-1">Total Visitors: {totalCount}</h3>
          <table className="w-full text-sm border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left border-b border-gray-200">Month</th>
                <th className="p-2 text-left border-b border-gray-200">Visitors</th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((item) => (
                <tr key={item.month} className="border-b border-gray-100">
                  <td className="p-2">{item.month}</td>
                  <td className="p-2">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const OverviewPage = () => {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string } | null;
  };
  const { data, isLoading, isError } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold p-3 border-b border-gray-200">
        Business Overview
      </h1>

      {isLoading && (
        <div className="text-center text-gray-500 p-4">Loading businesses...</div>
      )}

      {isError && (
        <div className="text-center text-red-500 p-4">
          Failed to fetch businesses. Please try again later.
        </div>
      )}

      {!isLoading && !data?.data?.length && (
        <div className="text-center text-gray-400 mt-10">
          <div className="text-5xl mb-2 flex justify-center text-gray-300">
            <FaBuilding />
          </div>
          <p className="text-lg font-medium">No businesses found</p>
          <p className="text-sm">Start by adding your first business.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-3">
        {data?.data?.map((business: any) => (
          <AnalyticsCard
            key={business._id}
            businessId={business._id}
            business={business}
          />
        ))}
      </div>
    </div>
  );
};

export default OverviewPage;
