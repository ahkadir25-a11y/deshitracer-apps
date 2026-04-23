// app/components/CategoryManager.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/app/redux/hoook";
import {
  type Category,
  type UpdateCategoryDTO,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/app/redux/services/category.service";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import { Edit3, Trash2, Plus } from "lucide-react";

type FoodOrDrink = "Food" | "Drink";

type FormState = {
  name: string;
  description?: string;
  user_id: string;
  business_id: string[];
  foodOrDrink?: FoodOrDrink;
};

export default function CategoryManager() {
  const { user } = useAppSelector((s) => s.auth) as { user?: { id: string } };

  const { data, isLoading, isError, refetch } = useGetCategoriesQuery({
    user_id: user?.id,
  });

  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });

  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const currentBusiness = businessData?.data?.[0];

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    user_id: user?.id ?? "",
    business_id: [],
    foodOrDrink: "Food",
  });

  useEffect(() => {
    if (user?.id) {
      setForm((f) => ({ ...f, user_id: user.id }));
    }
  }, [user?.id]);

  const businesses: { _id: string; name?: string; businessName?: string }[] =
    businessData?.data ?? [];

  const businessName = (id: string) =>
    businesses.find((b) => b._id === id)?.businessName ||
    businesses.find((b) => b._id === id)?.name ||
    "Business";

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const submitting = creating || updating || deleting;

  // ✅ FIXED: check business type + business category name, not typed category name
  const normalizedBusinessType = (currentBusiness?.selectedType || "").trim().toLowerCase();
  const normalizedBusinessCategoryName = (currentBusiness?.category?.name || "")
    .trim()
    .toLowerCase();

  const shouldShowFoodDrinkOption =
    ["restaurant", "takeout"].includes(normalizedBusinessType) &&
    normalizedBusinessCategoryName === "food & dining";

  useEffect(() => {
    if (shouldShowFoodDrinkOption) {
      setForm((f) => ({
        ...f,
        foodOrDrink: f.foodOrDrink || "Food",
      }));
    } else {
      setForm((f) => ({
        ...f,
        foodOrDrink: undefined,
      }));
    }
  }, [shouldShowFoodDrinkOption]);

  const resetForm = () =>
    setForm({
      name: "",
      description: "",
      user_id: user?.id ?? "",
      business_id: [],
      foodOrDrink: "Food",
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_id) return;

    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        user_id: form.user_id,
        business_id: currentBusiness?._id as any,
      };

      if (shouldShowFoodDrinkOption) {
        payload.foodOrDrink = form.foodOrDrink || "Food";
      }

      if (editingId) {
        const patch: UpdateCategoryDTO & { foodOrDrink?: FoodOrDrink } = payload;
        await updateCategory({ id: editingId, patch }).unwrap();
      } else {
        await createCategory(payload).unwrap();
      }

      resetForm();
      setEditingId(null);
      setOpen(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  const onEdit = (c: Category & { foodOrDrink?: FoodOrDrink }) => {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description ?? "",
      user_id: String(c.user_id),
      business_id: currentBusiness?._id ? [currentBusiness._id] : [],
      foodOrDrink: c.foodOrDrink || "Food",
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  return (
    <div className="pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Categories</h1>
          <p className="text-xs text-slate-500">
            {isLoading ? "Loading…" : `${filtered.length} item(s)`}
          </p>
          {currentBusiness && (
            <p className="text-xs text-slate-500 mt-1">
              Business Type: <span className="font-medium">{currentBusiness?.selectedType}</span>
              {" • "}
              Main Category: <span className="font-medium">{currentBusiness?.category?.name}</span>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-64 border border-slate-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#35B0A6]"
            />
            <span className="absolute left-3 top-2.5 text-slate-400">⌕</span>
          </div>

          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092]"
          >
            <Plus className="w-4 h-4" />
            New Category
          </button>
        </div>
      </div>

      {isError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700 mb-4">
          Failed to load categories.
        </div>
      )}

      {isLoading ? (
        <div className="rounded border border-slate-200 bg-white p-4 text-slate-500">
          Loading…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left">
              <tr className="text-slate-600">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="px-4 py-3 font-semibold">Businesses</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.map((c: any) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>

                  <td className="px-4 py-2 text-slate-600">
                    {c.description || "—"}
                  </td>

                  <td className="px-4 py-2 text-slate-600">
                    {c.foodOrDrink ? (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          c.foodOrDrink === "Food"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                      >
                        {c.foodOrDrink}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="px-4 py-2 text-slate-500">{String(c.user_id)}</td>

                  <td className="px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray((c as any).business_id) ? (
                        (c as any).business_id.map((id: string) => (
                          <span
                            key={id}
                            className="text-xs px-2 py-0.5 rounded-full border border-slate-300 text-slate-600 bg-slate-50"
                          >
                            {businessName(id)}
                          </span>
                        ))
                      ) : (c as any).business_id ? (
                        <span className="text-xs px-2 py-0.5 rounded-full border border-slate-300 text-slate-600 bg-slate-50">
                          {businessName((c as any).business_id)}
                        </span>
                      ) : null}
                    </div>
                  </td>

                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                        onClick={() => onEdit(c)}
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => onDelete(c._id)}
                        disabled={deleting}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No categories.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Edit Category" : "New Category"}
              </h2>

              <button
                onClick={() => {
                  setOpen(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#35B0A6]"
                  placeholder="e.g. Beverages"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#35B0A6]"
                  placeholder="Optional"
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                />
              </div>

              {shouldShowFoodDrinkOption && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category Type
                  </label>
                  <select
                    value={form.foodOrDrink || "Food"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        foodOrDrink: e.target.value as FoodOrDrink,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#35B0A6]"
                  >
                    <option value="Food">Food</option>
                    <option value="Drink">Drink</option>
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Because this business is under Food & Dining and type is Restaurant/Takeout, choose whether this category is Food or Drink.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setOpen(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-md text-white text-sm font-medium bg-gradient-to-r from-[#1F6B75] to-[#35B0A6] hover:from-[#1b5d65] hover:to-[#2da092] disabled:opacity-50"
                >
                  {editingId ? "Save changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}