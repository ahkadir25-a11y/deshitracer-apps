/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";

import OrderStatusBadge from "./OrderStatusBadge";
import OrderDetailsModal from "./OrderDetailsModal";
import { useDeleteOrderMutation, useListOrdersQuery, useUpdateOrderMutation } from "@/app/redux/services/orders.service";
import { useRouter } from "next/navigation";

interface OrdersListProps {
    businessId: string;
    userId?: string;
}

function currencySymbol(cur?: string) {
    const c = (cur || "").toUpperCase();
    if (c === "BDT") return "৳";
    if (c === "USD") return "$";
    if (c === "EUR") return "€";
    if (c === "GBP") return "£";
    if (c === "INR") return "₹";
    if (c === "AED") return "د.إ";
    if (c === "SAR") return "﷼";
    if (c === "QAR") return "ر.ق";
    return c ? `${c} ` : "";
}

function formatMoney(amount?: number, currency?: string) {
    if (typeof amount !== "number") return "";
    return `${currencySymbol(currency)}${amount.toFixed(2)}`;
}

const OrdersList: React.FC<OrdersListProps> = ({ businessId, userId }) => {
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [search, setSearch] = useState("");
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const router = useRouter();
    const {
        data: orders,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useListOrdersQuery({
        business_id: businessId,
        user_id: userId || undefined,
        status: statusFilter || undefined,
    });

    const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
    const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

    const filteredOrders = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return orders ?? [];

        return (orders ?? []).filter((order: any) => {
            const id = String(order?._id || "").toLowerCase();
            const table = String(order?.tableNo || "").toLowerCase();
            const notes = String(order?.notes || "").toLowerCase();
            const status = String(order?.status || "").toLowerCase();
            const businessName = String(order?.businessName || "").toLowerCase();

            return (
                id.includes(q) ||
                table.includes(q) ||
                notes.includes(q) ||
                status.includes(q) ||
                businessName.includes(q)
            );
        });
    }, [orders, search]);

    const handleUpdateStatus = async (
        order: any,
        newStatus: "pending" | "completed" | "cancelled"
    ) => {
        try {
            await updateOrder({
                id: order._id,
                business_id: businessId,
                updates: { status: newStatus },
            }).unwrap();
        } catch (err) {
            console.error("Failed to update order:", err);
            alert("Failed to update order status.");
        }
    };

    const handleDelete = async (orderId: string) => {
        const yes = window.confirm("Are you sure you want to delete this order?");
        if (!yes) return;

        try {
            await deleteOrder({ id: orderId, business_id: businessId }).unwrap();
        } catch (err) {
            console.error("Failed to delete order:", err);
            alert("Failed to delete order.");
        }
    };

    return (
        <>
            <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">Orders</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage pending, completed, and cancelled orders.
                            </p>
                        </div>

                        <button
                            onClick={() => refetch()}
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                        >
                            Refresh
                        </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order id, table, note..."
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All status</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            Showing <span className="font-extrabold text-gray-900">{filteredOrders.length}</span>{" "}
                            orders
                        </div>
                    </div>
                </div>

                <div className="p-5">
                    {isLoading || isFetching ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                            <p className="font-bold text-gray-700">Loading orders...</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                            <p className="font-bold text-red-700">Failed to load orders.</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
                            <p className="font-bold text-gray-900">No orders found</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Try changing filters or create some orders first.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order: any) => {
                                const currency = order?.currency || order?.items?.[0]?.currency || "USD";
                                const payable = order?.membershipDiscount?.applied
                                    ? order?.membershipDiscount?.payable
                                    : order?.subtotal;

                                return (
                                    <div
                                        key={order._id}
                                        className="rounded-3xl border border-gray-200 p-4 shadow-sm"
                                    >
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-base font-extrabold text-gray-900 break-all">
                                                        {order._id}
                                                    </p>
                                                    <OrderStatusBadge status={order.status} />
                                                </div>

                                                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 sm:grid-cols-2 xl:grid-cols-4">
                                                    <p>
                                                        <span className="font-semibold text-gray-500">Table:</span>{" "}
                                                        {order.tableNo || "-"}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-gray-500">Qty:</span>{" "}
                                                        {order.totalQty}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-gray-500">Subtotal:</span>{" "}
                                                        {formatMoney(order.subtotal, currency)}
                                                    </p>
                                                    <p>
                                                        <span className="font-semibold text-gray-500">Payable:</span>{" "}
                                                        <span className="font-extrabold text-gray-900">
                                                            {formatMoney(payable, currency)}
                                                        </span>
                                                    </p>
                                                </div>

                                                <p className="mt-2 text-xs text-gray-500">
                                                    Created: {new Date(order.createdAt).toLocaleString()}
                                                </p>

                                                {order.notes ? (
                                                    <p className="mt-3 line-clamp-2 text-sm text-gray-700">
                                                        <span className="font-semibold text-gray-500">Notes:</span>{" "}
                                                        {order.notes}
                                                    </p>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setSelectedOrderId(order._id)}
                                                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                                                >
                                                    View
                                                </button>

                                                <button
                                                    disabled={isUpdating || order.status === "completed"}
                                                    onClick={() => handleUpdateStatus(order, "completed")}
                                                    className={`rounded-2xl px-4 py-2 text-sm font-bold text-white ${order.status === "completed"
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : "bg-green-600 hover:bg-green-700"
                                                        }`}
                                                >
                                                    Complete
                                                </button>

                                                <button
                                                    onClick={() => router.push(`/profile/orders/edit/${order._id}`)}
                                                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    disabled={isUpdating || order.status === "cancelled"}
                                                    onClick={() => handleUpdateStatus(order, "cancelled")}
                                                    className={`rounded-2xl px-4 py-2 text-sm font-bold text-white ${order.status === "cancelled"
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : "bg-red-600 hover:bg-red-700"
                                                        }`}
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    disabled={isUpdating || order.status === "pending"}
                                                    onClick={() => handleUpdateStatus(order, "pending")}
                                                    className={`rounded-2xl px-4 py-2 text-sm font-bold text-white ${order.status === "pending"
                                                        ? "bg-gray-300 cursor-not-allowed"
                                                        : "bg-amber-500 hover:bg-amber-600"
                                                        }`}
                                                >
                                                    Mark Pending
                                                </button>

                                                <button
                                                    disabled={isDeleting}
                                                    onClick={() => handleDelete(order._id)}
                                                    className={`rounded-2xl px-4 py-2 text-sm font-bold text-white ${isDeleting ? "bg-gray-300 cursor-not-allowed" : "bg-gray-900 hover:bg-black"
                                                        }`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <OrderDetailsModal
                open={!!selectedOrderId}
                orderId={selectedOrderId}
                businessId={businessId}
                onClose={() => setSelectedOrderId(null)}
            />
        </>
    );
};

export default OrdersList;