/* src/components/members/MemberSearchCard.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppSelector } from "@/app/redux/hoook";
import {
  useSearchMemberBySerialQuery,
  useAddLeadMutation,
} from "@/app/redux/services/member.service";
import React, { useState } from "react";
import { FiSearch, FiUser, FiPhone, FiRefreshCw } from "react-icons/fi";

const MemberSearchCard: React.FC = () => {
  const [inputSerial, setInputSerial] = useState("");
  const [querySerial, setQuerySerial] = useState("");
  const { user } = useAppSelector((s) => s.auth) as { user?: { id: string } };

  const {
    data,
    isFetching,
    isError,
    error,
  } = useSearchMemberBySerialQuery(querySerial, {
    skip: !querySerial,
  });

  const [addLead, { isLoading: isAddingLead }] = useAddLeadMutation();
  const [leadMsg, setLeadMsg] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serial = inputSerial.trim();
    if (!serial) return;
    setLeadMsg(null);
    setQuerySerial(serial);
  };

  const onClear = () => {
    setInputSerial("");
    setQuerySerial("");
    setLeadMsg(null);
  };

  const notFound =
    isError &&
    (typeof error === "object" &&
      error &&
      "status" in (error as any) &&
      (error as any).status === 404);

  const statusText = data?.membershipStatus || "";
  const statusClasses =
    statusText === "Valid Member"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : "bg-gray-100 text-gray-700 border-gray-200";

  const handleAddLead = async () => {
    if (!data?.id) return;

    setLeadMsg(null);
    try {
      await addLead({ memberId: data.id, ownerId: user?.id }).unwrap();
      setLeadMsg("✅ Added as lead");
    } catch (e: any) {
      const msg =
        e?.data?.message ||
        e?.error ||
        "Failed to add lead";
      setLeadMsg(`⚠️ ${msg}`);
    }
  };
  console.log(user?.id)
  const canAddLead = !!user?.id && !!data?.id;

  return (
    <div className="p-6">
      {/* Search box */}
      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <input
            value={inputSerial}
            onChange={(e) => setInputSerial(e.target.value)}
            placeholder="Enter Serial ID (e.g., DT-2025-000123)"
            className="w-full rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none px-4 py-3 pr-11 text-sm"
            aria-label="Member Serial Number"
          />
          <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!inputSerial.trim() || isFetching}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isFetching ? (
              <span className="inline-flex items-center gap-2">
                <FiRefreshCw className="animate-spin" /> Searching…
              </span>
            ) : (
              "Search"
            )}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-800 px-4 py-3 text-sm font-medium hover:bg-gray-200"
            title="Clear"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Results */}
      <div className="mt-6">
        {!querySerial && (
          <div className="text-center text-gray-500 text-sm">
            Enter a serial number above to search.
          </div>
        )}

        {isFetching && querySerial && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="animate-pulse">
              <div className="h-24 w-24 rounded-full bg-gray-200 mb-4" />
              <div className="h-5 w-1/3 bg-gray-200 mb-2" />
              <div className="h-4 w-1/2 bg-gray-200 mb-1" />
              <div className="h-4 w-2/5 bg-gray-200" />
            </div>
          </div>
        )}

        {notFound && (
          <div className="mt-4 bg-white border border-rose-200 rounded-xl p-6 shadow-sm text-rose-700">
            No member found for serial{" "}
            <span className="font-semibold">{querySerial}</span>.
          </div>
        )}

        {data && (
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {data.profileImageUrl ? (
                  <img
                    src={data.profileImageUrl}
                    alt={data.name}
                    className="h-24 w-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-100 border flex items-center justify-center text-2xl text-gray-500">
                    <FiUser />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {data.name}
                  </h2>
                  <span className={`text-xs px-2 py-1 rounded-md border ${statusClasses}`}>
                    {data.membershipStatus}
                  </span>
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  Serial:{" "}
                  <span className="font-medium text-gray-700">
                    {data.serialNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-gray-800">
                  <FiPhone />
                  {data.phone ? (
                    <a
                      href={`tel:${data.phone}`}
                      className="text-blue-600 hover:underline"
                      title="Call"
                    >
                      {data.phone}
                    </a>
                  ) : (
                    <span className="text-gray-500">No phone on file</span>
                  )}
                </div>

                {/* Lead actions */}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAddLead}
                    disabled={!canAddLead || isAddingLead}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isAddingLead ? "Adding..." : "Add as Lead"}
                  </button>

                  {leadMsg && (
                    <div className="text-sm text-gray-700">{leadMsg}</div>
                  )}
                </div>

                {!user?.id && (
                  <div className="mt-2 text-xs text-gray-500">
                    Please login to add leads.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generic error (non-404) */}
        {isError && !notFound && querySerial && (
          <div className="mt-4 bg-white border border-amber-200 rounded-xl p-6 shadow-sm text-amber-700">
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberSearchCard;