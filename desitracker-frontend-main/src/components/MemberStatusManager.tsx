/* src/components/members/MemberManager.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useSearchMemberBySerialQuery,
  useSetMemberStatusBySerialMutation,
  usePagedMembersQuery,
} from "@/app/redux/services/member.service";
import {
  FiSearch,
  FiUser,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiCopy,
  FiCheckCircle,
  FiAlertCircle,
  FiRotateCcw,
} from "react-icons/fi";

const LIMIT_OPTIONS = [10, 20, 50];

const MemberManager: React.FC = () => {
  /* ========== A) QUICK SERIAL LOOKUP & STATUS ========== */
  const [inputSerial, setInputSerial] = useState("");
  const [querySerial, setQuerySerial] = useState("");

  const {
    data: serialData,
    isFetching: isSerialFetching,
    isError: isSerialError,
    error: serialError,
    refetch: refetchSerial,
    isUninitialized: serialUninit,
  } = useSearchMemberBySerialQuery(querySerial, {
    skip: !querySerial,
  });

  const [setStatusBySerial, { isLoading: isUpdatingSerial }] =
    useSetMemberStatusBySerialMutation();

  // local active toggle for the serial lookup card
  const [activeChoice, setActiveChoice] = useState<boolean | null>(null);

  useEffect(() => {
    if (serialData) setActiveChoice(serialData.membershipStatus === "Valid Member");
  }, [serialData]);

  const serialNotFound =
    isSerialError &&
    (typeof serialError === "object" &&
      serialError &&
      "status" in (serialError as any) &&
      (serialError as any).status === 404);

  const onSerialSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const serial = inputSerial.trim();
    if (!serial) return;
    setQuerySerial(serial);
  };

  const onSerialReset = () => {
    setInputSerial("");
    setQuerySerial("");
    setActiveChoice(null);
  };

  const onSerialSubmitStatus = async () => {
    if (!querySerial || activeChoice === null) return;
    try {
      const res = await setStatusBySerial({
        serial: querySerial,
        active: activeChoice,
      }).unwrap();
      toast.success(`Status updated: ${res.membershipStatus}`);
      await refetchSerial();
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to update status");
    }
  };

  const serialStatusClasses = useMemo(() => {
    const s = serialData?.membershipStatus;
    return s === "Valid Member"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-gray-100 text-gray-700 border-gray-200";
  }, [serialData?.membershipStatus]);

  const hasPendingSerialChange =
    serialData && activeChoice !== null
      ? (serialData.membershipStatus === "Valid Member") !== activeChoice
      : false;

  const copy = async (text?: string, label?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success(label ?? "Copied!");
    } catch {
      toast.error("Copy failed");
    }
  };

  /* ========== B) MEMBERS DIRECTORY (LIST + SEARCH + PAGINATION) ========== */
  const [inputQ, setInputQ] = useState("");
  const [q, setQ] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<number>(LIMIT_OPTIONS[0]);

  useEffect(() => {
    // reset to page 1 when limit changes
    setPage(1);
  }, [limit]);

  const {
    data: listData,
    isFetching: isListFetching,
    isError: isListError,
    error: listError,
    refetch: refetchList,
  } = usePagedMembersQuery({ q, page, limit });

  const [setRowStatus, { isLoading: isRowUpdating }] =
    useSetMemberStatusBySerialMutation();

  const listNotAuth =
    isListError &&
    (typeof listError === "object" &&
      listError &&
      "status" in (listError as any) &&
      (listError as any).status === 401);

  const onListSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setQ(inputQ.trim() ? inputQ.trim() : undefined);
  };

  const onListClear = () => {
    setInputQ("");
    setQ(undefined);
    setPage(1);
  };

  const onToggleRow = async (serialNumber: string, nextActive: boolean) => {
    try {
      await setRowStatus({ serial: serialNumber, active: nextActive }).unwrap();
      toast.success(`Member ${nextActive ? "activated" : "deactivated"}`);
      await refetchList();
      // If the toggled serial is the one in the quick card, refresh that too.
      if (serialNumber === querySerial) await refetchSerial();
    } catch (e: any) {
      toast.error(e?.data?.message || e?.message || "Failed to update");
    }
  };

  const totalPages = useMemo(() => {
    if (!listData) return 1;
    return Math.max(1, Math.ceil(listData.total / listData.limit));
  }, [listData]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-10">
      {/* ====== Section A: Quick Serial Lookup & Status ====== */}
      <section>
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">Member Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Quickly look up a member by <span className="font-medium">Serial ID</span> and change status,
            or scroll down for the full directory with pagination & search.
          </p>
        </div>

        {/* Search by Serial */}
        <form
          onSubmit={onSerialSearch}
          className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500" />
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <input
                value={inputSerial}
                onChange={(e) => setInputSerial(e.target.value)}
                placeholder="Enter Serial ID (e.g., DT-2025-000123)"
                className="w-full rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none px-4 py-3 pr-11 text-sm"
                aria-label="Member Serial Number"
              />
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={!inputSerial.trim() || isSerialFetching}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 text-white px-4 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {isSerialFetching ? (
                  <span className="inline-flex items-center gap-2">
                    <FiRefreshCw className="animate-spin" /> Searching…
                  </span>
                ) : (
                  "Search"
                )}
              </button>
              <button
                type="button"
                onClick={onSerialReset}
                className="inline-flex items-center justify-center rounded-xl bg-gray-100 text-gray-800 px-4 py-3 text-sm font-medium hover:bg-gray-200"
                title="Reset"
              >
                <FiRotateCcw className="mr-2" /> Reset
              </button>
            </div>
          </div>
        </form>

        {/* Serial card states */}
        {serialUninit && (
          <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-600">
            Start by typing a Serial ID above. You can copy it from the membership card or QR page.
          </div>
        )}

        {serialNotFound && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <div className="font-semibold">No member found</div>
              <div className="text-sm">
                We couldn’t find a member with serial{" "}
                <span className="font-mono font-semibold">{querySerial}</span>.
              </div>
            </div>
          </div>
        )}

        {isSerialError && !serialNotFound && querySerial && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <FiAlertCircle className="mt-0.5" />
            <div>
              <div className="font-semibold">Something went wrong</div>
              <div className="text-sm">Please try again.</div>
            </div>
          </div>
        )}

        {/* Serial Loading skeleton */}
        {isSerialFetching && querySerial && (
          <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-24 w-24 rounded-full bg-gray-200 mb-4" />
              <div className="h-5 w-1/3 bg-gray-200 mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 mb-1" />
              <div className="h-4 w-2/5 bg-gray-200" />
            </div>
          </div>
        )}

        {/* Serial Result + status form */}
        {serialData && (
          <div className="relative mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="shrink-0">
                  <div className="h-24 w-24 rounded-full bg-gray-100 border flex items-center justify-center text-2xl text-gray-500">
                    <FiUser />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">{serialData.name}</h2>
                    <span className={`text-xs px-2 py-1 rounded-md border ${serialStatusClasses}`}>
                      {serialData.membershipStatus}
                    </span>

                    {/* Serial with copy */}
                    <button
                      type="button"
                      onClick={() => copy(serialData.serialNumber, "Serial copied")}
                      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                      title="Copy serial"
                    >
                      <span className="font-mono">{serialData.serialNumber}</span>
                      <FiCopy />
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-gray-800">
                    <FiPhone />
                    {serialData.phone ? (
                      <>
                        <a className="text-blue-600 hover:underline" href={`tel:${serialData.phone}`}>
                          {serialData.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => copy(serialData.phone, "Phone copied")}
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] text-gray-700 hover:bg-gray-50"
                          title="Copy phone"
                        >
                          <FiCopy /> Copy
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">No phone on file</span>
                    )}
                  </div>

                  {/* Toggle */}
                  <div className="mt-6">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FiShield /> Change Membership Status
                    </div>

                    {/* Pretty switch */}
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={activeChoice === true}
                        onClick={() => setActiveChoice((v) => (v === true ? false : true))}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${activeChoice ? "bg-emerald-500" : "bg-gray-300"
                          }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${activeChoice ? "translate-x-7" : "translate-x-1"
                            }`}
                        />
                      </button>
                      <div className="text-sm text-gray-800">
                        {activeChoice ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <FiCheckCircle /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-700">
                            <FiAlertCircle /> Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={onSerialSubmitStatus}
                        disabled={activeChoice === null || isUpdatingSerial || !hasPendingSerialChange}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
                      >
                        {isUpdatingSerial ? (
                          <span className="inline-flex items-center gap-2">
                            <FiRefreshCw className="animate-spin" /> Updating…
                          </span>
                        ) : (
                          "Save Changes"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (!serialData) return;
                          setActiveChoice(serialData.membershipStatus === "Valid Member");
                        }}
                        disabled={isUpdatingSerial || !hasPendingSerialChange}
                        className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                        title="Revert to current status"
                      >
                        Revert
                      </button>

                      <button
                        type="button"
                        onClick={() => refetchSerial()}
                        disabled={isUpdatingSerial}
                        className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                        title="Refresh member"
                      >
                        <FiRefreshCw className="mr-2" /> Refresh
                      </button>
                    </div>

                    {hasPendingSerialChange && (
                      <div className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-flex items-center gap-2">
                        <FiAlertCircle />
                        Unsaved change — click <span className="font-semibold">Save Changes</span> to apply.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* decorative bottom border */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600" />
          </div>
        )}
      </section>

      {/* ====== Section B: Members Directory (List + Pagination + Search) ====== */}
      <section>
        <div className="mb-3">
          <h2 className="text-xl font-semibold text-gray-900">Members Directory</h2>
          <p className="text-sm text-gray-600 mt-1">
            Browse all members. Search by Serial, Name, or Phone. Change status inline.
          </p>
        </div>

        {/* Controls */}
        <form
          onSubmit={onListSearchSubmit}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center"
        >
          <div className="relative flex-1">
            <input
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Search by Serial / Name / Phone"
              className="w-full rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none px-4 py-3 pr-11 text-sm"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Per page:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              disabled={isListFetching}
            >
              {isListFetching ? (
                <span className="inline-flex items-center gap-2">
                  <FiRefreshCw className="animate-spin" /> Searching…
                </span>
              ) : (
                "Search"
              )}
            </button>
            <button
              type="button"
              onClick={onListClear}
              className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-800 px-4 py-3 text-sm font-medium hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </form>

        {/* Errors */}
        {listNotAuth && (
          <div className="mt-4 bg-white border border-amber-200 rounded-xl p-4 shadow-sm text-amber-700">
            Unauthorized. Add your admin API key to the request headers.
          </div>
        )}
        {isListError && !listNotAuth && (
          <div className="mt-4 bg-white border border-rose-200 rounded-xl p-4 shadow-sm text-rose-700">
            Something went wrong.
          </div>
        )}

        {/* Table */}
        <div className="mt-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Serial</th>
                  <th className="px-4 py-3 text-left font-semibold">Member</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {!listData && isListFetching && (
                  <tr>
                    <td className="px-4 py-4" colSpan={5}>
                      Loading…
                    </td>
                  </tr>
                )}

                {listData?.items?.length ? (
                  listData.items.map((m) => (
                    <tr key={m.serialNumber} className="border-t">
                      <td className="px-4 py-3 font-mono">{m.serialNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.profileImageUrl || "https://via.placeholder.com/64x64?text=👤"}
                            alt={m.name}
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                          <div className="text-gray-900">{m.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.phone ? (
                          <a className="text-blue-600 hover:underline" href={`tel:${m.phone}`}>
                            {m.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs border ${m.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                        >
                          {m.membershipStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          disabled={isRowUpdating}
                          onClick={() => onToggleRow(m.serialNumber, !m.active)}
                          className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium border ${m.active
                              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            } disabled:opacity-60`}
                        >
                          {isRowUpdating ? "Please wait…" : m.active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  !isListFetching && (
                    <tr>
                      <td className="px-4 py-6 text-center text-gray-500" colSpan={5}>
                        No members found.
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex items-center justify-between gap-4 px-4 py-3 bg-gray-50 border-t">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{listData?.page ?? page}</span> of{" "}
              <span className="font-semibold">{totalPages}</span> •{" "}
              <span className="font-semibold">{listData?.total ?? 0}</span> result(s)
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={isListFetching || !(listData?.hasPrev ?? page > 1)}
              >
                Prev
              </button>
              <button
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={isListFetching || !(listData?.hasNext ?? false)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MemberManager;
