/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import Image from "next/image";
import {
  usePagedMembersQuery,
  useSetMemberStatusBySerialMutation,
  useListDeactivationRequestsQuery,
  useAcceptDeactivationRequestMutation,
} from "@/app/redux/services/member.service";
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  RefreshCcw,
  Key,
  SendHorizonal,
} from "lucide-react";

/** Small utilities */
const cls = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(" ");
const pill =
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border";

/** Top-level Admin Console with tabs */
export default function AdminConsole() {
  const [tab, setTab] = React.useState<"members" | "requests">("members");

  return (
    <div className="min-h-screen bg-[#0D1114] text-[#E6EDF3]">
      {/* pretty backdrop */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(31,107,117,0.18),transparent_60%)]" />

      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0D1114]/80 backdrop-blur border-b border-[#243A41]">
        <div className="mx-auto max-w-7xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <h1 className="text-[15px] font-semibold">Deshi Tracker — Admin</h1>
              <p className="text-[11px] text-slate-400">Backoffice Console</p>
            </div>
          </div>

          {/* Tabs in header for quick switch */}
          <nav className="inline-flex rounded-lg bg-white/5 border border-[#243A41] p-1">
            <Tab
              label="Members"
              active={tab === "members"}
              onClick={() => setTab("members")}
            />
            <Tab
              label="Requests"
              active={tab === "requests"}
              onClick={() => setTab("requests")}
            />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-5 py-6">
        {tab === "members" && <MembersTab />}
        {tab === "requests" && <RequestsTab />}
      </main>
    </div>
  );
}

/* ----------------------------- Members Tab ----------------------------- */

function MembersTab() {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);

  const { data, isFetching, refetch } = usePagedMembersQuery({ q, page, limit });
  const [setBySerial, { isLoading: toggling }] = useSetMemberStatusBySerialMutation();

  return (
    <section className="space-y-4">
      <Card>
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-[#35B0A6]" />
            Members
          </h2>
          <button
            onClick={() => refetch()}
            className="text-[12px] inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {/* Sticky toolbar */}
        <div className="sticky top-[76px] z-10 -mx-5 px-5 py-3 bg-[#151C20]/90 backdrop-blur border-y border-[#243A41] flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, phone or serial…"
              className="pl-8 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px] w-72"
            />
          </div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px]"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
          {isFetching && (
            <span className="text-[12px] text-slate-400">Loading…</span>
          )}
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto rounded-lg border border-[#243A41]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5 ">
              <tr>
                <Th>Serial</Th>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((m) => (
                <tr
                  key={m.serialNumber}
                  className="border-t border-[#243A41] hover:bg-white/5 transition"
                >
                  <Td mono>{m.serialNumber}</Td>
                  <Td>{m.name}</Td>
                  <Td>{m.phone}</Td>
                  <Td>
                    <span
                      className={cls(
                        pill,
                        m.active
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-600/30"
                          : "bg-white/5 text-slate-300 border-white/10"
                      )}
                    >
                      {m.active ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      )}
                      {m.membershipStatus}
                    </span>
                  </Td>
                  <Td right>
                    <button
                      onClick={async () => {
                        await setBySerial({
                          serial: m.serialNumber,
                          active: !m.active,
                        }).unwrap();
                        refetch();
                      }}
                      disabled={toggling}
                      className={cls(
                        "px-3 py-1.5 rounded-md text-[12px] font-semibold border",
                        m.active
                          ? "bg-white/5 hover:bg-white/10 border-white/10"
                          : "bg-emerald-600/20 hover:bg-emerald-600/30 border-emerald-600/30 text-emerald-200"
                      )}
                    >
                      {m.active ? "Deactivate" : "Activate"}
                    </button>
                  </Td>
                </tr>
              ))}

              {/* Empty state */}
              {data && data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-[13px] text-slate-400"
                  >
                    No members found. Try another search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        <div className="mt-4">
          <Pager
            page={data?.page ?? page}
            limit={data?.limit ?? limit}
            total={data?.total ?? 0}
            hasPrev={!!data?.hasPrev}
            hasNext={!!data?.hasNext}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      </Card>
    </section>
  );
}

/* ----------------------- Deactivation Requests Tab ---------------------- */

function RequestsTab() {
  const [apiKey, setApiKey] = React.useState("");
  const [status, setStatus] =
    React.useState<"pending" | "accepted" | "rejected" | "">("");
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);

  const { data, isFetching, refetch } = useListDeactivationRequestsQuery({
    status: status || undefined,
    q: q || undefined,
    page,
    limit,
    apiKey: apiKey || undefined,
  });

  const [accept, { isLoading: accepting }] =
    useAcceptDeactivationRequestMutation();
  const [noteById, setNoteById] = React.useState<Record<string, string>>({});

  return (
    <section className="space-y-4">
      <Card>
        {/* Card header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#F25C49]" />
            Deactivation Requests
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="x-api-key (optional)"
                className="pl-8 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px] w-56"
              />
            </div>
            <button
              onClick={() => refetch()}
              className="text-[12px] inline-flex items-center gap-1 px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Sticky toolbar */}
        <div className="sticky top-[76px] z-10 -mx-5 px-5 py-3 bg-[#151C20]/90 backdrop-blur border-y border-[#243A41] flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name/phone/serial…"
              className="pl-8 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px] w-72"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any);
              setPage(1);
            }}
            className="px-2 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px]"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="px-2 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px]"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
          {isFetching && (
            <span className="text-[12px] text-slate-400">Loading…</span>
          )}
        </div>

        {/* Table */}
        <div className="mt-3 overflow-x-auto rounded-lg border border-[#243A41]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Created</Th>
                <Th>Serial</Th>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map((r) => (
                <tr
                  key={r._id}
                  className="border-t border-[#243A41] hover:bg-white/5 transition align-top"
                >
                  <Td>{new Date(r.createdAt).toLocaleString()}</Td>
                  <Td mono>{r.serialNumber}</Td>
                  <Td>{r.name}</Td>
                  <Td>{r.phone}</Td>
                  <Td>
                    <div className="text-[12px] text-slate-300">
                      {r.reason || <span className="text-slate-500">—</span>}
                      {r.note && (
                        <div className="text-slate-400 mt-1">“{r.note}”</div>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <span
                      className={cls(
                        pill,
                        r.status === "pending" &&
                          "bg-amber-500/10 text-amber-200 border-amber-600/30",
                        r.status === "accepted" &&
                          "bg-emerald-500/10 text-emerald-200 border-emerald-600/30",
                        r.status === "rejected" &&
                          "bg-red-500/10 text-red-200 border-red-600/30"
                      )}
                    >
                      {r.status === "pending" ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : r.status === "accepted" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5" />
                      )}
                      {r.status}
                    </span>
                    {r.processedAt && (
                      <div className="text-[11px] text-slate-500 mt-1">
                        {`at ${new Date(r.processedAt).toLocaleString()}`}
                      </div>
                    )}
                  </Td>
                  <Td right>
                    {r.status === "pending" ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <SendHorizonal className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                          <input
                            placeholder="Optional note to record…"
                            className="pl-8 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px] w-64"
                            value={noteById[r._id] || ""}
                            onChange={(e) =>
                              setNoteById((s) => ({
                                ...s,
                                [r._id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <button
                          disabled={accepting}
                          onClick={async () => {
                            await accept({
                              id: r._id,
                              note: noteById[r._id] || undefined,
                              // apiKey is passed from query header, not needed here
                            }).unwrap();
                            setNoteById((s) => ({ ...s, [r._id]: "" }));
                            refetch();
                          }}
                          className="px-3 py-1.5 rounded-md text-[12px] font-semibold border bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 border-emerald-600/30"
                        >
                          {accepting ? "Accepting…" : "Accept & Deactivate"}
                        </button>
                      </div>
                    ) : (
                      <span className="text-[12px] text-slate-500">No actions</span>
                    )}
                  </Td>
                </tr>
              ))}

              {/* Empty state */}
              {data && data.items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[13px] text-slate-400"
                  >
                    No requests found. Adjust filters to see more.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pager */}
        <div className="mt-4">
          <Pager
            page={data?.page ?? page}
            limit={data?.limit ?? limit}
            total={data?.total ?? 0}
            hasPrev={!!data?.hasPrev}
            hasNext={!!data?.hasNext}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      </Card>
    </section>
  );
}

/* ------------------------------- UI helpers ------------------------------- */

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cls(
        "px-3.5 py-1.5 rounded-md text-[13px] transition border",
        active
          ? "bg-[#1F6B75]/20 text-[#AEE9E1] border-[#35B0A6]/30 shadow-[inset_0_0_0_1px_rgba(53,176,166,0.25)]"
          : "text-slate-300 hover:text-slate-100 border-transparent hover:border-white/10 hover:bg-white/5"
      )}
    >
      {label}
    </button>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cls("text-left p-3 font-medium text-gray-300", className)}>
      {children}
    </th>
  );
}

function Td({
  children,
  mono = false,
  right = false,
}: {
  children: React.ReactNode;
  mono?: boolean;
  right?: boolean;
}) {
  return (
    <td
      className={cls(
        "p-3 align-middle",
        mono && "font-mono",
        right && "text-right"
      )}
    >
      {children}
    </td>
  );
}

function Pager({
  page,
  limit,
  total,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  page: number;
  limit: number;
  total: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const from = Math.min((page - 1) * limit + 1, Math.max(total, 1));
  const to = Math.min(page * limit, total);
  return (
    <div className="flex items-center justify-between text-[12px] text-slate-400">
      <div>
        Showing <span className="text-slate-200">{from}</span>–{" "}
        <span className="text-slate-200">{to}</span> of{" "}
        <span className="text-slate-200">{total}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="px-2 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-40"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {children}
    </div>
  );
}
