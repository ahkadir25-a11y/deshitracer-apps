/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";
import { useGetOrderByIdQuery } from "@/app/redux/services/orders.service";

interface OrderDetailsModalProps {
  orderId: string | null;
  businessId: string;
  open: boolean;
  onClose: () => void;
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

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  orderId,
  businessId,
  open,
  onClose,
}) => {
  const { data, isLoading, isFetching, error } = useGetOrderByIdQuery(
    { id: orderId || "", business_id: businessId },
    { skip: !open || !orderId || !businessId }
  );

  if (!open) return null;

  const order = data;
  const currency = order?.currency || order?.items?.[0]?.currency || "USD";

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="absolute left-1/2 top-1/2 w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Order Details</h2>
            <p className="text-sm text-gray-500">
              {orderId ? `Order ID: ${orderId}` : "Loading order"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-800 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="max-h-[75vh] overflow-auto p-5">
          {isLoading || isFetching ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 text-center">
              <p className="text-sm font-bold text-gray-700">Loading order...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-sm font-bold text-red-700">Failed to load order.</p>
            </div>
          ) : !order ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm font-bold text-gray-700">Order not found.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    General
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Business</span>
                      <span className="font-bold text-gray-900">
                        {order.businessName || order.business_id}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">User</span>
                      <span className="font-bold text-gray-900">{order.user_id}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Table</span>
                      <span className="font-bold text-gray-900">
                        {order.tableNo || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Status</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Created</span>
                      <span className="font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Summary
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Total Qty</span>
                      <span className="font-bold text-gray-900">{order.totalQty}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-bold text-gray-900">
                        {formatMoney(order.subtotal, currency)}
                      </span>
                    </div>

                    {order.membershipDiscount?.applied && (
                      <>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Discount %</span>
                          <span className="font-bold text-gray-900">
                            {order.membershipDiscount.percent}%
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Discount Amount</span>
                          <span className="font-bold text-green-700">
                            -{" "}
                            {formatMoney(
                              order.membershipDiscount.discountAmount,
                              currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-gray-500">Payable</span>
                          <span className="font-extrabold text-gray-900">
                            {formatMoney(order.membershipDiscount.payable, currency)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Notes
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                  {order.notes || "No notes"}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  Items
                </p>

                <div className="mt-4 space-y-3">
                  {(order.items || []).map((item: any) => (
                    <div
                      key={item.lineId}
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="mt-1 text-sm text-gray-600">
                            Qty: {item.quantity} • Unit:{" "}
                            {formatMoney(item.price, item.currency || currency)}
                          </p>

                          {Array.isArray(item.selectedOptions) &&
                            item.selectedOptions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.selectedOptions.map((opt: any) => (
                                  <span
                                    key={`${opt.optionGroupId}_${opt.value}`}
                                    className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700"
                                  >
                                    {opt.optionGroupName}: {opt.value}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-500">Line total</p>
                          <p className="font-extrabold text-gray-900">
                            {formatMoney(
                              Number(item.price || 0) * Number(item.quantity || 0),
                              item.currency || currency
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;