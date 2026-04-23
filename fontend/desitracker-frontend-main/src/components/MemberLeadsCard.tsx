/* src/components/members/MemberLeadsCard.tsx */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useAppSelector } from "@/app/redux/hoook";
import {
  useListMyLeadsQuery,
  useRemoveLeadMutation,
} from "@/app/redux/services/member.service";
import { FiSearch, FiTrash2, FiRefreshCw, FiUser } from "react-icons/fi";
import LeadPromotionSender from "@/app/redux/services/LeadPromotionSender";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";

const MemberLeadsCard: React.FC = () => {
  const { user } = useAppSelector((s) => s.auth) as { user?: { id: string } };
  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isFetching, isError, error, refetch } = useListMyLeadsQuery(
    { q: query || undefined, page, limit: 12, ownerId: user?.id },
    { skip: !user?.id }
  );

  const [removeLead, { isLoading: isRemoving }] = useRemoveLeadMutation();
  const [msg, setMsg] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const hasPrev = data?.hasPrev ?? false;
  const hasNext = data?.hasNext ?? false;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setPage(1);
    setQuery(q.trim());
  };

  const onClear = () => {
    setQ("");
    setQuery("");
    setPage(1);
    setMsg(null);
  };

  const handleRemove = async (memberId: string) => {
    setMsg(null);
    setRemovingId(memberId);
    try {
      await removeLead({ memberId, ownerId: user?.id }).unwrap();
      setMsg("✅ Lead removed");
      // refresh list
      refetch();
    } catch (e: any) {
      const m = e?.data?.message || e?.error || "Failed to remove lead";
      setMsg(`⚠️ ${m}`);
    } finally {
      setRemovingId(null);
    }
  };

  const prettyError = useMemo(() => {
    if (!isError) return null;
    return (
      (error as any)?.data?.message ||
      (error as any)?.error ||
      "Something went wrong"
    );
  }, [isError, error]);

  if (!user?.id) {
    return (
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-gray-600">
          Please login to view your leads.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <LeadPromotionSender userId={user?.id} businessId={businessData?.data?.[0]?._id}/>
      {/* Header + search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mt-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Leads</h2>
            <p className="text-sm text-gray-500">
              Saved members you can contact later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-200"
            disabled={isFetching}
            title="Refresh"
          >
            <span className="inline-flex items-center gap-2">
              <FiRefreshCw className={isFetching ? "animate-spin" : ""} />
              Refresh
            </span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search leads by name / phone / serial"
              className="w-full rounded-lg border-2 border-gray-200 focus:border-blue-500 outline-none px-4 py-3 pr-11 text-sm"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-4 py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
              disabled={isFetching}
            >
              Search
            </button>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-800 px-4 py-3 text-sm font-medium hover:bg-gray-200"
            >
              Clear
            </button>
          </div>
        </form>

        {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}
        {prettyError && (
          <div className="mt-3 text-sm text-amber-700">
            ⚠️ {prettyError}
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6">
        {isFetching && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-gray-600">
            Loading leads...
          </div>
        )}

        {!isFetching && items.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-gray-600">
            No leads found.
          </div>
        )}

        {!isFetching && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((x) => (
              <div
                key={x.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex gap-4">
                  {/* avatar */}
                  <div className="shrink-0">
                    {x.lead.profileImageUrl ? (
                      <img
                        src={x.lead.profileImageUrl}
                        alt={x.lead.name}
                        className="h-14 w-14 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-gray-100 border flex items-center justify-center text-gray-500">
                        <FiUser />
                      </div>
                    )}
                  </div>

                  {/* info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {x.lead.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Serial:{" "}
                          <span className="font-medium text-gray-700">
                            {x.lead.serialNumber}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2 py-1 rounded-md border ${x.lead.active
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-gray-100 text-gray-700 border-gray-200"
                          }`}
                      >
                        {x.lead.membershipStatus}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-700">
                      {x.lead.phone ? (
                        <a
                          href={`tel:${x.lead.phone}`}
                          className="text-blue-600 hover:underline"
                          title="Call"
                        >
                          {x.lead.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">No phone</span>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemove(x.lead.id)}
                        disabled={isRemoving && removingId === x.lead.id}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 text-white px-3 py-2 text-sm font-medium hover:bg-rose-700 disabled:opacity-60"
                      >
                        <FiTrash2 />
                        {isRemoving && removingId === x.lead.id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Added: {new Date(x.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isFetching && items.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!hasPrev || isFetching}
              className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              Prev
            </button>

            <div className="text-sm text-gray-500">
              Page <span className="font-medium text-gray-700">{data?.page ?? page}</span>
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext || isFetching}
              className="rounded-lg bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-60"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberLeadsCard;