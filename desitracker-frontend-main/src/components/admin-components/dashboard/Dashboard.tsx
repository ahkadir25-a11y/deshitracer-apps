"use client";
import React from "react";
import { Line } from "react-chartjs-2";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement, // Register ArcElement for Pie chart
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetSiteAnalyticsQuery } from "@/app/redux/services/siteAnylatics";

// Register all chart elements including ArcElement
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement, // This is important for Pie charts
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { data, error, isLoading } = useGetSiteAnalyticsQuery();

  // Handle loading and error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error fetching data</div>;
  }

  // Business Growth Data
  const businessGrowthData = {
    labels: data?.monthlyData?.map((month) => month.month), // Dynamically use months from data
    datasets: [
      {
        label: "Business Registrations",
        data: data?.monthlyData?.map((month) => month.businessCount), // Business count data
        borderColor: "black",
        tension: 0.4,
      },
      {
        label: "Active Businesses",
        data: data?.monthlyData?.map((month) => month.userCount), // User count data
        borderColor: "green",
        tension: 0.4,
      },
    ],
  };

  // Dynamic Pie chart data (Business Activity Breakdown)
  const businessActivityData = {
    labels: ["New Registrations", "User Reviews"],
    datasets: [
      {
        data: [
          data?.newRegistrations || 0, // Replace with dynamic data from API response
          data?.userReviews || 0,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 99, 132, 0.6)",
        ],
      },
    ],
  };

  return (
    <div>
      <div>
        <div className="md:p-6 p-3 bg-gray-100 h-full">
          <div className="flex md:flex-row flex-col justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">
              Business Dashboard
            </h2>
          </div>

          {/* Your other components and UI */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Total Users
              </h3>
              <p className="text-3xl mt-2 text-red-500">
                {data?.totalUserCount}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Unique Countries
              </h3>
              <p className="text-3xl mt-2 text-orange-500">
                {data?.uniqueCountries}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Average Rating
              </h3>
              <p className="text-3xl mt-2 text-">
                {data?.averageRatting?.toFixed(1)}/5
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Active Businesses
              </h3>
              <p className="text-3xl mt-2 text-indigo-500">
                {data?.totalBusinessCount}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Reviews from user
              </h3>
              <p className="text-3xl mt-2 text-">
                {data?.userReviews}/5
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">New User</h3>
              <p className="text-3xl mt-2 text-pink-700">
                {data?.newRegistrations}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Business Growth Line Chart */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Business Growth
              </h3>
              <Line data={businessGrowthData} options={{ responsive: true }} />
            </div>

            {/* Business Activity Breakdown Pie Chart */}
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-700">
                Business Activity
              </h3>
              <Pie data={businessActivityData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
