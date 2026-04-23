/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
// If your hook actually lives at redux/api/memberApi, update the import path accordingly:
import { useVerifyMemberBySlugQuery } from "@/app/redux/services/member.service";
import {
  FiCheckCircle,
  FiXCircle,
  FiPhone,
  FiRefreshCw,
  FiAlertTriangle,
  FiShare2,
  FiPrinter,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";

const VerifyMemberClient: React.FC<{ slug: string }> = ({ slug }) => {
  const { data, isFetching, isError, refetch } = useVerifyMemberBySlugQuery(slug);

  const onShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Member verification",
          text: "Check this member’s verification status",
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch {
      /* ignore */
    }
  };

  const onPrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // ---- layout wrapper: full viewport height (100vh) ----
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Loading */}
      {isFetching && (
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <div className="animate-pulse space-y-5">
            <div className="h-5 w-1/3 bg-gray-200 rounded" />
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-1/3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
        </div>
      )}

      {/* Error (network/server) */}
      {!isFetching && isError && (
        <div className="w-full max-w-xl bg-white border border-amber-200 rounded-2xl shadow-sm p-6 text-amber-800">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="mt-0.5" />
            <div>
              <div className="font-semibold">Something went wrong</div>
              <div className="text-sm">Please try again.</div>
              <button
                onClick={() => refetch()}
                className="mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-amber-50"
              >
                <FiRefreshCw /> Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No data */}
      {!isFetching && !isError && !data && (
        <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          No verification info found.
        </div>
      )}

      {/* Result */}
      {!isFetching && !isError && data && (
        <VerifyCard data={data} onShare={onShare} onPrint={onPrint} onRefresh={refetch} />
      )}
    </div>
  );
};

function VerifyCard({
  data,
  onShare,
  onPrint,
  onRefresh,
}: {
  data: any;
  onShare: () => void;
  onPrint: () => void;
  onRefresh: () => void;
}) {
  const isValid = !!data.valid;
  const profileImageUrl = (data as any)?.profileImageUrl as string | undefined;

  return (
    <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* accent bar */}
      <div className={`h-1 w-full ${isValid ? "bg-emerald-500" : "bg-rose-500"}`} />

      <div className="p-6">
        {/* heading row */}
        <div className="flex items-start gap-3">
          {isValid ? (
            <FiCheckCircle className="text-emerald-600 mt-0.5" size={24} />
          ) : (
            <FiXCircle className="text-rose-600 mt-0.5" size={24} />
          )}
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isValid ? "Valid Member" : "Invalid / Inactive Member"}
            </h1>
            {data.verification && (
              <p className="text-sm text-gray-600 mt-1">{data.verification}</p>
            )}
          </div>
        </div>

        {/* profile + info */}
        <div className="mt-5 flex items-start gap-4">
          <div className="shrink-0">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={data.name ?? "Member"}
                className="h-16 w-16 rounded-full object-cover border"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
                <FiUser size={22} />
              </div>
            )}
          </div>

          <div className="flex-1">
            {data.name && (
              <div className="text-sm">
                <div className="text-gray-500">Name</div>
                <div className="font-medium text-gray-900">{data.name}</div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mt-3">
              {data.serialNumber && (
                <div>
                  <div className="text-gray-500">Serial</div>
                  <div className="font-mono font-medium text-gray-900">
                    {data.serialNumber}
                  </div>
                </div>
              )}
              {data.phone && (
                <div>
                  <div className="text-gray-500">Phone</div>
                  <a
                    href={`tel:${data.phone}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:underline font-medium"
                  >
                    <FiPhone /> {data.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* actions */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={onShare}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <FiShare2 /> Share
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <FiRefreshCw /> Refresh
          </button>
          <button
            onClick={onPrint}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
          >
            <FiPrinter /> Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyMemberClient;
