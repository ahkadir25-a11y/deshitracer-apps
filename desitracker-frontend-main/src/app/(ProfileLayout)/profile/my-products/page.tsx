/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useAppSelector } from "@/app/redux/hoook";
import {
  useGetProductsByUserAndBusinessQuery,
  useDeleteProductMutation,
} from "@/app/redux/services/products.services";
import { useRouter } from "next/navigation";
import {
  useGetAllBusinessQuery,
  useUpdateBusinessMutation,
} from "@/app/redux/services/business.services";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import CategoryManager from "@/components/CategoryManager";
import Image from "next/image";
import {  Plus, Edit3, Trash2 } from "lucide-react";
import { skipToken } from "@reduxjs/toolkit/query";


/** status helper */
function computeDiscountStatus(p: any): {
  label: string;
  tone: "gray" | "green" | "amber" | "red";
} {
  const pct = Number(p?.discount_percent ?? 0);
  if (!pct || pct <= 0) return { label: "No discount", tone: "gray" };

  const now = new Date();
  const start = p?.discount_start ? new Date(p.discount_start) : null;
  const end = p?.discount_end ? new Date(p.discount_end) : null;

  const active =
    pct > 0 &&
    (!start || now >= start) &&
    (!end || now <= end);

  if (active) return { label: "Active", tone: "green" };
  if (start && now < start) return { label: "Scheduled", tone: "amber" };
  if (end && now > end) return { label: "Expired", tone: "red" };
  return { label: "Unlimited", tone: "gray" };
}

const toneClasses: Record<string, string> = {
  gray: "bg-slate-100 text-slate-700 border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
};

const MyProducts: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string };
  };
  const [deleteProduct] = useDeleteProductMutation();
  const Router = useRouter();

  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });
  const [updateBusiness] = useUpdateBusinessMutation();
  const activeBusinessId = businessData?.data?.[0]?._id as string | undefined;
  const productsQueryArg =
    user?.id && activeBusinessId
      ? { user_id: user.id, business_id: activeBusinessId }
      : skipToken;

  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useGetProductsByUserAndBusinessQuery(productsQueryArg);



  // Local state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // on business load, set checkoutNumber
  useEffect(() => {
    if (businessData?.data?.[0]?.checkoutNumber) {
      setPhoneNumber(businessData.data[0].checkoutNumber);
    }
  }, [businessData?.data]);

  // derived list
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchTerm) return products;
    const q = searchTerm.toLowerCase();
    return products.filter((p: any) => p.name?.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const allSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p: any) => selectedIds.has(p._id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p: any) => p._id)));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateNewProduct = () => {
    Router.push("/profile/my-products/create");
  };

  const handleUpdateWhatsAppNumber = async () => {
    try {
      const business = {
        ...businessData?.data,
        owner: user?.id as string,
        checkoutNumber: phoneNumber,
      };
      await updateBusiness({
        slug: businessData?.data?.[0]?.slug,
        updatedBusinessData: business,
      }).unwrap();
      toast.success("WhatsApp number updated!");
    } catch (error: any) {
      console.error("Error updating business:", error);
      toast.error(
        error?.data?.errorSources?.[0]?.message ||
        "Error updating business. Please try again."
      );
    }
  };



  const handleDelete = async (productId: string) => {
    const ok = window.confirm(
      "Delete this product? This action cannot be undone."
    );
    if (!ok) return;
    try {
      await deleteProduct(productId).unwrap();
      toast.success("Product deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product.");
    }
  };

  // Loading & errors
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7F9FB]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#35B0A6] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 text-sm">Loading products…</p>
        </div>
      </div>
    );
  }

  if (error || !activeBusinessId) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F7F9FB]">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-1">No Business Found.</p>
          <p className="text-sm text-red-500/80">
            Please create a business first or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-5 py-6 bg-[#F7F9FB]">
      {/* Categories manager */}
      <div className="mb-6">
        <CategoryManager />
      </div>

      {/* Header actions */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
        <h2 className="text-[20px] font-semibold text-slate-800">My Products</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNewProduct}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092]"
          >
            <Plus className="w-4 h-4" />
            Create Product
          </button>
        </div>
      </div>

      {/* WhatsApp Number */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4">
        <label
          htmlFor="whatsAppNumber"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          WhatsApp Number
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <PhoneInput
            international
            defaultCountry="US"
            value={phoneNumber}
            onChange={(value) => setPhoneNumber(value ?? "")}
            className="px-3 py-2 w-full border border-slate-300 rounded-md bg-white"
            placeholder="Enter WhatsApp number"
          />
          <button
            onClick={handleUpdateWhatsAppNumber}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
          >
            Update
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          This number will be used for customer communication.
        </p>
      </div>
      {/* Toolbar: Search + Bulk discount + Schedule */}
      <div className="mb-4 bg-white rounded-xl border border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-2">
            <label
              htmlFor="searchTerm"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Search Products
            </label>
            <input
              id="searchTerm"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 w-full border border-slate-300 rounded-md bg-white"
              placeholder="Type a product name…"
            />
          </div>

          {/* <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bulk Discount
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-md"
                  placeholder="e.g. 15"
                />
              </div>
              <button
                onClick={handleApplyBulkDiscount}
                disabled={bulkSaving}
                className="px-4 py-2 rounded-md text-white text-sm font-medium bg-[#1F6B75] hover:bg-[#1b5d65] disabled:opacity-60"
                title={
                  selectedIds.size
                    ? `Apply to ${selectedIds.size} selected`
                    : "Select rows first"
                }
              >
                {bulkSaving ? "Applying…" : "Apply"}
              </button>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={scheduleEnabled}
                  onChange={(e) => setScheduleEnabled(e.target.checked)}
                  className="accent-[#1F6B75]"
                />
                Schedule discount (optional)
              </label>
              {scheduleEnabled && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      Start (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={startLocal}
                      onChange={(e) => setStartLocal(e.target.value)}
                      className="w-full px-2 py-2 border border-slate-300 rounded-md bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      End (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={endLocal}
                      onChange={(e) => setEndLocal(e.target.value)}
                      className="w-full px-2 py-2 border border-slate-300 rounded-md bg-white text-sm"
                    />
                  </div>
                  <p className="sm:col-span-2 text-[11px] text-slate-500">
                    Leave either field blank for an open-ended window.
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              Applies to selected rows only.
            </p>
          </div> */}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-slate-600">
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    className="accent-[#1F6B75]"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Discount %</th>
                {/* NEW: status + window */}
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Final Price</th>
                <th className="py-3 px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => {
                  const isChecked = selectedIds.has(p._id);
                  const thumb =
                    p.thumbnail ||
                    (Array.isArray(p.images) && p.images[0]?.url) ||
                    "/placeholder.png";
                  const discount = Number(p?.discount_percent ?? 0);
                  const status = computeDiscountStatus(p);
                  const finalPrice =
                    typeof p?.final_price === "number"
                      ? p.final_price
                      : Math.round(Number(p.price) * (1 - discount / 100) * 100) /
                      100;

                  const startText = p?.discount_start
                    ? new Date(p.discount_start).toLocaleString()
                    : "";
                  const endText = p?.discount_end
                    ? new Date(p.discount_end).toLocaleString()
                    : "";

                  return (
                    <tr
                      key={p._id}
                      className="border-b last:border-b-0 border-slate-100 hover:bg-slate-50/60"
                    >
                      <td className="py-3 px-3 align-middle">
                        <input
                          type="checkbox"
                          className="accent-[#1F6B75]"
                          checked={isChecked}
                          onChange={() => toggleRow(p._id)}
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                            <Image
                              src={thumb}
                              alt={p.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-800 truncate">
                              {p.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate max-w-[420px]">
                              {p.description}
                            </div>
                            {/* NEW: show window if present */}
                            {(p?.discount_start || p?.discount_end) && (
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {p?.discount_start ? `From ${startText}` : "From: —"}{" "}
                                &middot;{" "}
                                {p?.discount_end ? `Until ${endText}` : "Until: —"}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 align-middle text-slate-800">
                        {p.currency || "USD"} {Number(p.price).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {isNaN(discount) ? 0 : discount}%
                        </span>
                      </td>

                      {/* NEW: status */}
                      <td className="py-3 px-3 align-middle">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${toneClasses[status.tone]}`}
                          title={
                            p?.discount_start || p?.discount_end
                              ? `${startText || "—"} → ${endText || "—"}`
                              : "No window set"
                          }
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 align-middle font-semibold text-slate-900">
                        {p.currency || "USD"} {Number(finalPrice).toFixed(2)}
                      </td>

                      <td className="py-3 px-3 align-middle">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              Router.push(`/profile/my-products/edit/${p._id}`)
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    No products available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* footer w/ selection info */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
          <div>
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : "No rows selected"}
          </div>
          <div className="text-slate-400">
            Showing {filteredProducts?.length ?? 0} item(s)
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProducts;
