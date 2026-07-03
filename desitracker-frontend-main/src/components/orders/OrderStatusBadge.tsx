import React from "react";

type Props = {
  status?: "pending" | "completed" | "cancelled" | string;
};

const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  const value = String(status || "pending").toLowerCase();

  const cls =
    value === "completed"
      ? "bg-green-100 text-green-700 border-green-200"
      : value === "cancelled"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold ${cls}`}
    >
      {value}
    </span>
  );
};

export default OrderStatusBadge;