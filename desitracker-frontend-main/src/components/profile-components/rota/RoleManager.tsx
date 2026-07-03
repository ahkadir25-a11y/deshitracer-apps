"use client";

import { useMemo, useState } from "react";
import {
  useCreateRotaRoleMutation,
  useDeleteRotaRoleMutation,
  useGetRotaRolesQuery,
  useUpdateRotaRoleMutation,
  type RotaRole,
} from "@/app/redux/services/rota.services";
import { useAppSelector } from "@/app/redux/hoook";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import RotaModal from "./RotaModal";



export default function RoleManager() {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string } | null;
  };
  const { data: businessData, isLoading: busniessLoading } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });
  const businessId = businessData && businessData?.data[0]?._id;
  const [searchTerm, setSearchTerm] = useState("");
  const [isActive, setIsActive] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RotaRole | null>(null);

  const params = useMemo(() => {
    if (!businessId) return null;
    return {
      business: businessId,
      page,
      limit,
      searchTerm: searchTerm || undefined,
      isActive: isActive === "all" ? undefined : isActive === "true",
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    };
  }, [businessId, page, limit, searchTerm, isActive]);

  const { data, isLoading, isError, error } = useGetRotaRolesQuery(params as any, {
    skip: !params,
  });

  const [createRole, { isLoading: creating }] = useCreateRotaRoleMutation();
  const [updateRole, { isLoading: updating }] = useUpdateRotaRoleMutation();
  const [deleteRole, { isLoading: deleting }] = useDeleteRotaRoleMutation();

  const total = data?.meta?.total ?? 0;
  const roles = data?.data ?? [];

  if (!businessId) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Business not found</h2>
        <p className="mt-1 text-sm text-gray-600">
          Your profile state doesn’t have a business id. Once you connect businessId from auth state, this page will work.
        </p>
      </div>
    );
  }

  async function onSubmit(payload: { name: string; description?: string; isActive: boolean }) {
    try {
      if (editing) {
        await updateRole({
          id: editing._id,
          business: businessId,
          body: payload,
        }).unwrap();
      } else {
        await createRole({
          business: businessId,
          ...payload,
        }).unwrap();
      }
      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      alert(e?.data?.message || "Failed to save role");
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Remove this role? (soft delete)");
    if (!ok) return;
    try {
      await deleteRole({ id, business: businessId }).unwrap();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to delete role");
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Roles</h2>
          <p className="text-sm text-gray-600">Define job roles like Manager, Chef, Reception.</p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
        >
          + Add Role
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={searchTerm}
          onChange={(e) => {
            setPage(1);
            setSearchTerm(e.target.value);
          }}
          placeholder="Search roles..."
          className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />

        <select
          value={isActive}
          onChange={(e) => {
            setPage(1);
            setIsActive(e.target.value as any);
          }}
          className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          value={limit}
          onChange={(e) => {
            setPage(1);
            setLimit(Number(e.target.value));
          }}
          className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        >
          <option value={10}>Show 10</option>
          <option value={20}>Show 20</option>
          <option value={50}>Show 50</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-6 text-sm text-gray-600" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="px-3 py-6 text-sm text-red-600" colSpan={4}>
                  {(error as any)?.data?.message || "Failed to load roles"}
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-sm text-gray-600" colSpan={4}>
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.map((r) => (
                <tr key={r._id} className="rounded-xl bg-gray-50">
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-500">{r._id}</div>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-700">{r.description || "—"}</td>
                  <td className="px-3 py-3">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
                        r.isActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700",
                      ].join(" ")}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(r);
                          setOpen(true);
                        }}
                        className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(r._id)}
                        disabled={deleting}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-700">
        <div>
          Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            className="rounded-lg border bg-white px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>
          <button
            className="rounded-lg border bg-white px-3 py-1.5 hover:bg-gray-100 disabled:opacity-50"
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <RotaModal
        open={open}
        title={editing ? "Edit Role" : "Add Role"}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <RoleForm
          initial={editing}
          loading={creating || updating}
          onSubmit={onSubmit}
        />
      </RotaModal>
    </div>
  );
}

function RoleForm({
  initial,
  loading,
  onSubmit,
}: {
  initial: RotaRole | null;
  loading: boolean;
  onSubmit: (payload: { name: string; description?: string; isActive: boolean }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, description, isActive });
      }}
      className="space-y-4"
    >
      <div>
        <label className="text-sm font-medium text-gray-700">Role name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Manager"
          className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
          rows={3}
          className="mt-1 w-full rounded-xl border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-gray-50 px-4 py-3">
        <div>
          <div className="text-sm font-medium text-gray-900">Active</div>
          <div className="text-xs text-gray-600">Inactive roles cannot be used for scheduling</div>
        </div>
        <button
          type="button"
          onClick={() => setIsActive((v) => !v)}
          className={[
            "h-8 w-14 rounded-full p-1 transition",
            isActive ? "bg-gray-900" : "bg-gray-300",
          ].join(" ")}
        >
          <div
            className={[
              "h-6 w-6 rounded-full bg-white transition",
              isActive ? "translate-x-6" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
