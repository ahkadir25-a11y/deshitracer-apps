"use client";

import { useMemo, useState } from "react";
import {
  useCreateRotaEmployeeMutation,
  useDeleteRotaEmployeeMutation,
  useGetRotaEmployeesQuery,
  useGetRotaRolesQuery,
  useUpdateRotaEmployeeMutation,
  type RotaEmployee,
  type RotaRole,
} from "@/app/redux/services/rota.services";
import { useAppSelector } from "@/app/redux/hoook";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import RotaModal from "./RotaModal";

export default function EmployeeManager() {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string } | null;
  };

  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });

  const businessId = businessData?.data?.[0]?._id;

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RotaEmployee | null>(null);

  const roleParams = useMemo(() => {
    if (!businessId) return null;
    return { business: businessId, page: 1, limit: 200, isActive: true };
  }, [businessId]);

  const { data: rolesRes } = useGetRotaRolesQuery(roleParams as any, {
    skip: !roleParams,
  });

  const roles = (rolesRes?.data ?? []) as RotaRole[];

  const empParams = useMemo(() => {
    if (!businessId) return null;
    return {
      business: businessId,
      page,
      limit,
      searchTerm: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    };
  }, [businessId, page, limit, searchTerm]);

  const { data, isLoading, isError, error } = useGetRotaEmployeesQuery(
    empParams as any,
    {
      skip: !empParams,
    }
  );

  const [createEmployee, { isLoading: creating }] =
    useCreateRotaEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] =
    useUpdateRotaEmployeeMutation();
  const [deleteEmployee, { isLoading: deleting }] =
    useDeleteRotaEmployeeMutation();

  const total = data?.meta?.total ?? 0;
  const employees = data?.data ?? [];

  if (!businessId) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Business not found</h2>
        <p className="mt-2 text-sm text-gray-600">
          Your profile state does not have a business id. Once you connect
          businessId from auth state, this page will work.
        </p>
      </div>
    );
  }

  async function onSubmit(payload: any) {
    try {
      if (editing) {
        await updateEmployee({
          id: editing._id,
          business: businessId,
          body: payload,
        }).unwrap();
      } else {
        await createEmployee({
          business: businessId,
          ...payload,
        }).unwrap();
      }

      setOpen(false);
      setEditing(null);
    } catch (e: any) {
      alert(e?.data?.message || "Failed to save employee");
    }
  }

  async function onDelete(id: string) {
    const ok = confirm("Remove this employee? (soft delete)");
    if (!ok) return;

    try {
      await deleteEmployee({ id, business: businessId }).unwrap();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to delete employee");
    }
  }

  function roleName(emp: RotaEmployee) {
    const r: any = emp.role;
    if (typeof r === "string") return r;
    return r?.name || "—";
  }

  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
      <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
            Staff Management
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Employees
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Manage your staff, keep contact details organised, and assign each
            employee to the right role.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-gray-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-black"
        >
          + Add Employee
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px]">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Search employees
          </label>
          <input
            value={searchTerm}
            onChange={(e) => {
              setPage(1);
              setSearchTerm(e.target.value);
            }}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Rows per page
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          >
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px]">
            <thead className="bg-gray-50">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                <th className="px-5 py-4">Employee</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-gray-600" colSpan={6}>
                    Loading employees...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td className="px-5 py-10 text-sm text-red-600" colSpan={6}>
                    {(error as any)?.data?.message || "Failed to load employees"}
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center text-sm text-gray-600" colSpan={6}>
                    No employees found.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr
                    key={e._id}
                    className="transition hover:bg-gray-50/80"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-sm font-semibold text-white">
                          {(e.firstName?.[0] || "E").toUpperCase()}
                          {(e.lastName?.[0] || "").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {e.firstName} {e.lastName || ""}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            {e._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {e.email || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {e.phone || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700">
                        {roleName(e)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          e.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-700",
                        ].join(" ")}
                      >
                        {e.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditing(e);
                            setOpen(true);
                          }}
                          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(e._id)}
                          disabled={deleting}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
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

        <div className="flex flex-col gap-4 border-t border-gray-100 px-5 py-4 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            Showing {total === 0 ? 0 : (page - 1) * limit + 1}–
            {Math.min(page * limit, total)} of {total}
          </div>

          <div className="flex gap-2">
            <button
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium transition hover:bg-gray-100 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            >
              Prev
            </button>

            <button
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 font-medium transition hover:bg-gray-100 disabled:opacity-50"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <RotaModal
        open={open}
        title={editing ? "Edit Employee" : "Add Employee"}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <EmployeeForm
          roles={roles}
          initial={editing}
          loading={creating || updating}
          onSubmit={onSubmit}
        />
      </RotaModal>
    </div>
  );
}

function EmployeeForm({
  roles,
  initial,
  loading,
  onSubmit,
}: {
  roles: RotaRole[];
  initial: RotaEmployee | null;
  loading: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [firstName, setFirstName] = useState(initial?.firstName ?? "");
  const [lastName, setLastName] = useState(initial?.lastName ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    initial?.status ?? "ACTIVE"
  );

  const initialRoleId =
    typeof initial?.role === "string"
      ? initial.role
      : (initial?.role as any)?._id;

  const [role, setRole] = useState<string>(initialRoleId || roles?.[0]?._id || "cheif");

  const addr: any = (initial as any)?.address || {};
  const [line1, setLine1] = useState(addr?.line1 || "");
  const [city, setCity] = useState(addr?.city || "");
  const [postcode, setPostcode] = useState(addr?.postcode || "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          firstName,
          lastName,
          email,
          phone,
          status,
          role,
          address: { line1, city, postcode },
        });
      }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Basic Information
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Add the employee’s name and contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              First name
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Last name
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Work Details
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Assign a  employee status.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="hidden">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-2xl border  border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Address
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Optional address details for employee records.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Line 1"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Postcode"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-gray-100 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-gray-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:opacity-60"
        >
          {loading ? "Saving..." : initial ? "Update Employee" : "Save Employee"}
        </button>
      </div>
    </form>
  );
}