import React from "react";
import OrdersList from "./OrdersList";

interface OrdersManagementPageProps {
  businessId: string;
  userId?: string;
}

const OrdersManagementPage: React.FC<OrdersManagementPageProps> = ({
  businessId,
  userId,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-extrabold text-gray-900">Order Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            View all orders, inspect full details, update status, or delete orders.
          </p>
        </div>

        <OrdersList businessId={businessId} userId={userId} />
      </div>
    </div>
  );
};

export default OrdersManagementPage;