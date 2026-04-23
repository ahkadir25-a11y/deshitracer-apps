"use client";
import React from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useGetMeQuery } from "@/app/redux/services/users.services";
import { useGetBusinessAnalyticsQuery } from "@/app/redux/services/business.services";
import { useGetOrdersQuery } from "@/app/redux/services/orders.service";
import { Users, TrendingUp, DollarSign, Star, Clock, ShoppingBag } from "lucide-react";
import { useGetShiftsQuery } from "@/app/redux/services/rota.services";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const UserDashboard = () => {
  const { data: userData, isLoading: userLoading } = useGetMeQuery(undefined);
  const businessId = userData?.business?._id;

  const { data: stats, isLoading: statsLoading } = useGetBusinessAnalyticsQuery(businessId, {
    skip: !businessId,
  });
  const { data: ordersData, isLoading: ordersLoading } = useGetOrdersQuery({ business_id: businessId }, {
    skip: !businessId,
  });
  const { data: rotaData, isLoading: rotaLoading } = useGetShiftsQuery(undefined);

  if (userLoading || statsLoading || ordersLoading || rotaLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  const orders = ordersData?.data || [];
  const totalRevenue = orders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0);

  // Business Growth Data
  const visitTrendData = {
    labels: stats?.monthly?.map((m: any) => m.month.split("-")[1]) || ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Member Visits",
        data: stats?.monthly?.map((m: any) => m.count) || [40, 60, 45, 80],
        borderColor: "black",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const activityData = {
    labels: ["Verified Scans", "Pending"],
    datasets: [
      {
        data: [stats?.totalCount || 100, 12],
        backgroundColor: [
          "#000000",
          "#eeeeee",
        ],
      },
    ],
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Owner Command Center</h1>
          <p className="text-gray-500 mt-1">Real-time overview of {userData?.business?.businessName || "your business"}</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <div className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 ring-4 ring-green-100"></div>
            <span className="text-sm font-semibold text-gray-700">Business Live</span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          icon={<Users className="text-blue-600" size={24} />} 
          label="Total Visits" 
          value={stats?.totalCount || 0} 
          trend="+14%" 
          color="blue"
        />
        <MetricCard 
          icon={<DollarSign className="text-green-600" size={24} />} 
          label="Total Revenue" 
          value={`£${totalRevenue}`} 
          trend="+5.2%" 
          color="green"
        />
        <MetricCard 
          icon={<Clock className="text-orange-600" size={24} />} 
          label="Active Rota" 
          value={rotaData?.data?.length || 0} 
          color="orange"
        />
        <MetricCard 
          icon={<Star className="text-yellow-600" size={24} />} 
          label="Avg Rating" 
          value="4.9" 
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">Visit Trends</h3>
            <select className="text-sm border-none bg-gray-50 rounded-lg p-2 font-semibold">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Line data={visitTrendData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { color: "#f0f0f0" } }, x: { grid: { display: false } } }
            }} />
          </div>
        </div>

        {/* Breakdown & Recent */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Device Activity</h3>
          <div className="h-[180px] mb-8">
            <Pie data={activityData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quick Links</h4>
            <div className="grid grid-cols-2 gap-3">
              <QuickLink icon={<ShoppingBag size={18} />} label="Products" />
              <QuickLink icon={<TrendingUp size={18} />} label="Analytics" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, trend, color }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    orange: "bg-orange-50",
    yellow: "bg-yellow-50"
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]">
      <div className={`p-3 rounded-2xl w-fit mb-4 ${colorMap[color] || "bg-gray-50"}`}>
        {icon}
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-tight">{label}</p>
          <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
        {trend && (
          <div className="bg-green-100 px-2 py-1 rounded-lg">
            <span className="text-xs font-bold text-green-700">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const QuickLink = ({ icon, label }: any) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors">
    <div className="mr-3 text-gray-600">{icon}</div>
    <span className="text-sm font-bold text-gray-700">{label}</span>
  </div>
);

export default UserDashboard;
