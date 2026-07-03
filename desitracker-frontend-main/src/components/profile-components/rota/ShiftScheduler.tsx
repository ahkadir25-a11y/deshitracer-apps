"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCreateRotaEmployeeMutation,
  useCreateRotaShiftMutation,
  useDeleteRotaShiftMutation,
  useGetRotaEmployeesQuery,
  useGetRotaRolesQuery,
  useGetRotaShiftsQuery,
  useUpdateRotaShiftMutation,
  type RotaEmployee,
  type RotaRole,
  type RotaShift,
} from "@/app/redux/services/rota.services";
import { useAppSelector } from "@/app/redux/hoook";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import RotaModal from "./RotaModal";

/* ------------------------- date helpers (LOCAL safe) ------------------------- */
function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toLocalYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function dayKey(d: Date) {
  return toLocalYYYYMMDD(d);
}

function timeLabel(iso: string) {
  const dt = new Date(iso);
  return dt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDayHeader(d: Date) {
  const day = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
  const wk = d.toLocaleDateString(undefined, { weekday: "short" });
  return { day, wk };
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function minutesBetween(aIso: string, bIso: string) {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}

function asId(x: any) {
  if (!x) return "";
  return typeof x === "string" ? x : x?._id ?? "";
}

function clampNote(s?: string, n = 28) {
  const t = String(s ?? "").trim();
  if (!t) return "";
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function roleNameFromEmployee(emp?: RotaEmployee | null) {
  const raw: any = emp?.role;
  if (!raw) return "No role";
  return typeof raw === "string" ? raw : raw?.name || "No role";
}

function avatarPalette(seed: string) {
  const palettes = [
    "from-pink-500 to-rose-500",
    "from-orange-500 to-amber-500",
    "from-emerald-500 to-green-500",
    "from-sky-500 to-blue-500",
    "from-indigo-500 to-violet-500",
    "from-fuchsia-500 to-purple-500",
    "from-cyan-500 to-teal-500",
    "from-lime-500 to-green-600",
  ];

  const index =
    (seed || "")
      .split("")
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % palettes.length;

  return palettes[index];
}

function storageKeyForBusiness(businessId: string) {
  return `rota-week-extra-employees:${businessId}`;
}

function hoursFromMinutes(mins: number) {
  return Math.round((mins / 60) * 10) / 10;
}

/* ------------------------- main component ------------------------- */

export default function ShiftSchedulerTableClean() {
  const { user } = useAppSelector((state) => state.auth) as {
    user: { id: string; role?: string } | null;
  };

  const { data: businessData } = useGetAllBusinessQuery({
    owner: user?.id || "",
  });
  const businessId = businessData?.data?.[0]?._id;

  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const weekStart = useMemo(() => startOfWeekMonday(anchor), [anchor]);
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );
  const weekKey = useMemo(() => toLocalYYYYMMDD(weekStart), [weekStart]);

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RotaShift | null>(null);

  const [employeeManagerOpen, setEmployeeManagerOpen] = useState(false);

  const [prefillEmployeeId, setPrefillEmployeeId] = useState("");
  const [prefillDate, setPrefillDate] = useState("");

  // weekKey => employeeIds manually added into that week's visible calendar
  const [weekExtraEmployees, setWeekExtraEmployees] = useState<
    Record<string, string[]>
  >({});

  const rolesParams = useMemo(
    () =>
      businessId
        ? { business: businessId, page: 1, limit: 200, isActive: true }
        : null,
    [businessId]
  );

  const empsParams = useMemo(
    () =>
      businessId
        ? {
            business: businessId,
            page: 1,
            limit: 500,
            status: "ACTIVE" as const,
          }
        : null,
    [businessId]
  );

  const { data: rolesRes } = useGetRotaRolesQuery(rolesParams as any, {
    skip: !rolesParams,
  });
  const { data: empsRes, refetch: refetchEmployees } = useGetRotaEmployeesQuery(
    empsParams as any,
    {
      skip: !empsParams,
    }
  );

  const roles = (rolesRes?.data ?? []) as RotaRole[];
  const employeesAll = (empsRes?.data ?? []) as RotaEmployee[];

  const shiftParams = useMemo(() => {
    if (!businessId) return null;
    return {
      business: businessId,
      from: weekStart.toISOString(),
      to: weekEnd.toISOString(),
      page: 1,
      limit: 2000,
      sortBy: "startAt",
      sortOrder: "asc" as const,
    };
  }, [businessId, weekStart, weekEnd]);

  const {
    data: shiftsRes,
    isLoading,
    isError,
    error,
  } = useGetRotaShiftsQuery(shiftParams as any, {
    skip: !shiftParams,
  });

  const shifts = (shiftsRes?.data ?? []) as RotaShift[];

  const [createShift, { isLoading: creating }] = useCreateRotaShiftMutation();
  const [updateShift, { isLoading: updating }] = useUpdateRotaShiftMutation();
  const [deleteShift, { isLoading: deleting }] = useDeleteRotaShiftMutation();
  const [createEmployee, { isLoading: creatingEmployee }] =
    useCreateRotaEmployeeMutation();

  /* ------------------------- localStorage persistence ------------------------- */
  useEffect(() => {
    if (!businessId || typeof window === "undefined") return;

    try {
      const raw = window.localStorage.getItem(
        storageKeyForBusiness(businessId)
      );
      if (!raw) {
        setWeekExtraEmployees({});
        return;
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setWeekExtraEmployees(parsed);
      } else {
        setWeekExtraEmployees({});
      }
    } catch {
      setWeekExtraEmployees({});
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        storageKeyForBusiness(businessId),
        JSON.stringify(weekExtraEmployees)
      );
    } catch {
      // ignore storage errors
    }
  }, [businessId, weekExtraEmployees]);

  function netMinutes(s: any) {
    const mins = minutesBetween(s.startAt, s.endAt);
    const br = Number(s.breakMinutes ?? 0);
    return Math.max(0, mins - br);
  }

  const resolveRoleIdForEmployee = useCallback(
    (empId?: string) => {
      const fallback = roles?.[0]?._id || "";
      if (!empId) return fallback;
      const emp = employeesAll.find((e) => e._id === empId);
      const raw: any = (emp as any)?.role;
      const id = typeof raw === "string" ? raw : raw?._id;
      return id || fallback;
    },
    [employeesAll, roles]
  );

  // Employees who already have shifts in current week
  const scheduledEmployeeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const s of shifts as any[]) {
      const id = asId(s.employee);
      if (id) ids.add(id);
    }
    return ids;
  }, [shifts]);

  // Employees manually added into this week's table
  const extraEmployeeIdsForWeek = weekExtraEmployees[weekKey] ?? [];

  // Final rows to show in this week view
  const visibleEmployees = useMemo(() => {
    const visibleIds = new Set<string>([
      ...Array.from(scheduledEmployeeIds),
      ...extraEmployeeIdsForWeek,
    ]);

    let result = employeesAll.filter((emp) => visibleIds.has(emp._id));

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((e) => {
        const full = `${e.firstName ?? ""} ${e.lastName ?? ""}`.toLowerCase();
        const email = `${e.email ?? ""}`.toLowerCase();
        const phone = `${e.phone ?? ""}`.toLowerCase();
        return full.includes(q) || email.includes(q) || phone.includes(q);
      });
    }

    return result;
  }, [employeesAll, scheduledEmployeeIds, extraEmployeeIdsForWeek, search]);

  // Employees available to add to current week's schedule view
  const addableEmployees = useMemo(() => {
    const visibleIds = new Set(
      employeesAll
        .filter((emp) => {
          const inSchedule = scheduledEmployeeIds.has(emp._id);
          const inExtras = extraEmployeeIdsForWeek.includes(emp._id);
          return inSchedule || inExtras;
        })
        .map((emp) => emp._id)
    );

    return employeesAll.filter((emp) => !visibleIds.has(emp._id));
  }, [employeesAll, scheduledEmployeeIds, extraEmployeeIdsForWeek]);

  function addEmployeeToCurrentWeek(employeeId: string) {
    setWeekExtraEmployees((prev) => {
      const current = prev[weekKey] ?? [];
      if (current.includes(employeeId)) return prev;
      return {
        ...prev,
        [weekKey]: [...current, employeeId],
      };
    });
  }

  async function onSubmit(payload: any) {
    try {
      if (editing) {
        await updateShift({
          id: editing._id,
          business: businessId,
          body: payload,
        }).unwrap();
      } else {
        await createShift({ business: businessId, ...payload }).unwrap();
      }

      addEmployeeToCurrentWeek(payload.employee);

      setOpen(false);
      setEditing(null);
      setPrefillEmployeeId("");
      setPrefillDate("");
    } catch (e: any) {
      alert(e?.data?.message || "Failed to save shift");
    }
  }

  async function onDeleteShift(id: string) {
    const ok = confirm("Remove this shift?");
    if (!ok) return;

    try {
      await deleteShift({ id, business: businessId }).unwrap();
    } catch (e: any) {
      alert(e?.data?.message || "Failed to delete shift");
    }
  }

  async function onCreateEmployee(payload: any) {
    try {
      const res: any = await createEmployee({
        business: businessId,
        ...payload,
      }).unwrap();
      await refetchEmployees();

      const createdId = res?.data?._id || res?._id || "";
      if (createdId) {
        addEmployeeToCurrentWeek(createdId);
      }

      setEmployeeManagerOpen(false);
    } catch (e: any) {
      alert(e?.data?.message || "Failed to create employee");
    }
  }

  const dailyTotals = useMemo(() => {
    return days.map((day) => {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);

      const end = new Date(day);
      end.setHours(23, 59, 59, 999);

      const mins = shifts
        .filter((s: any) => {
          const st = new Date(s.startAt);
          return st >= start && st <= end;
        })
        .reduce((sum: number, s: any) => sum + netMinutes(s), 0);

      return {
        key: dayKey(day),
        mins,
        hrs: hoursFromMinutes(mins),
      };
    });
  }, [days, shifts]);

  const grandTotalHours = useMemo(() => {
    return hoursFromMinutes(
      shifts.reduce((sum: number, s: any) => sum + netMinutes(s), 0)
    );
  }, [shifts]);

  if (!businessId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Business not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
              Rota & Shifts
            </h2>
            <p className="text-sm text-slate-600">
              {weekStart.toLocaleDateString()} →{" "}
              {addDays(weekEnd, -1).toLocaleDateString()}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Tap a day to create a shift. Tap a shift card to edit it.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 xl:w-auto">
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
              onClick={() => setAnchor(addDays(anchor, -7))}
            >
              ← Prev week
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
              onClick={() => setAnchor(new Date())}
            >
              This week
            </button>
            <button
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
              onClick={() => setAnchor(addDays(anchor, 7))}
            >
              Next week →
            </button>
          </div>
        </div>

        <div className="mt-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search visible weekly employees"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      {/* Mobile / Tablet friendly layout */}
      <div className="space-y-4 lg:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setEmployeeManagerOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white"
          >
            + Add employee
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
            Loading…
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 shadow-sm">
            {(error as any)?.data?.message || "Error"}
          </div>
        ) : visibleEmployees.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="text-sm font-semibold text-slate-800">
              No employees in this week
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Add an employee to this week schedule or create a new one.
            </div>
            <button
              type="button"
              onClick={() => setEmployeeManagerOpen(true)}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
            >
              Add employee
            </button>
          </div>
        ) : (
          visibleEmployees.map((emp) => {
            const empId = emp._id;
            const empShifts = shifts.filter(
              (s: any) => asId(s.employee) === empId
            );
            const totalMinutes = empShifts.reduce(
              (sum: number, s: any) => sum + netMinutes(s),
              0
            );
            const totalHours = hoursFromMinutes(totalMinutes);

            return (
              <div
                key={empId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={[
                        "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                        avatarPalette(emp._id || `${emp.firstName}-${emp.lastName}`),
                      ].join(" ")}
                    >
                      {(emp.firstName?.[0] ?? "E").toUpperCase()}
                      {(emp.lastName?.[0] ?? "").toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900">
                        {emp.firstName} {emp.lastName || ""}
                      </div>
                      <div className="mt-1 truncate text-sm font-medium text-slate-600">
                        {emp?.email || emp?.phone || roleNameFromEmployee(emp)}
                      </div>
                    </div>

                    <div className="rounded-xl bg-sky-50 px-3 py-2 text-right">
                      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Total
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {totalHours} hrs
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                  {days.map((day) => {
                    const start = new Date(day);
                    start.setHours(0, 0, 0, 0);

                    const end = new Date(day);
                    end.setHours(23, 59, 59, 999);

                    const dayList = empShifts
                      .filter((s: any) => {
                        const st = new Date(s.startAt);
                        return st >= start && st <= end;
                      })
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.startAt).getTime() -
                          new Date(b.startAt).getTime()
                      );

                    const localDate = toLocalYYYYMMDD(day);
                    const { day: labelDay, wk } = fmtDayHeader(day);
                    const isToday = sameDay(day, new Date());

                    return (
                      <motion.button
                        key={dayKey(day)}
                        type="button"
                        whileTap={{ scale: 0.995 }}
                        onClick={() => {
                          setEditing(null);
                          setPrefillEmployeeId(empId);
                          setPrefillDate(localDate);
                          setOpen(true);
                        }}
                        className={[
                          "rounded-2xl border p-3 text-left transition",
                          isToday
                            ? "border-sky-200 bg-sky-50"
                            : "border-slate-200 bg-slate-50 hover:bg-slate-100",
                        ].join(" ")}
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {labelDay}
                            </div>
                            <div className="text-xs text-slate-500">{wk}</div>
                          </div>

                          <div className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-slate-500">
                            {dayList.length} shift{dayList.length === 1 ? "" : "s"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <AnimatePresence initial={false}>
                            {dayList.length > 0 ? (
                              dayList.map((s: any) => (
                                <motion.div
                                  key={s._id}
                                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                  transition={{ duration: 0.15 }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setEditing(s);
                                    setOpen(true);
                                  }}
                                  className="cursor-pointer rounded-xl border border-sky-200 bg-white px-3 py-2 shadow-sm"
                                  title="Click to edit"
                                >
                                  <div className="text-xs font-semibold text-slate-900">
                                    {timeLabel(s.startAt)} – {timeLabel(s.endAt)}
                                  </div>

                                  {String((s as any)?.notes ?? "").trim() ? (
                                    <div className="mt-1 text-[11px] text-slate-600">
                                      {clampNote((s as any)?.notes, 38)}
                                    </div>
                                  ) : (
                                    <div className="mt-1 text-[11px] text-slate-400">
                                      No notes
                                    </div>
                                  )}
                                </motion.div>
                              ))
                            ) : (
                              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-[12px] text-slate-400">
                                Tap to add shift
                              </div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}

        {/* Mobile Daily Totals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900">
              Daily totals
            </div>
            <div className="rounded-xl bg-sky-100 px-3 py-2 text-sm font-semibold text-slate-900">
              {grandTotalHours} hrs
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {days.map((day, index) => {
              const { day: labelDay, wk } = fmtDayHeader(day);
              return (
                <div
                  key={dayKey(day)}
                  className="rounded-xl border border-slate-200 bg-sky-50 p-3"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {labelDay}
                  </div>
                  <div className="text-xs text-slate-500">{wk}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">
                    {dailyTotals[index]?.hrs ?? 0} hrs
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
        <div className="max-h-[calc(100vh-260px)] overflow-auto">
          <div className="min-w-[1320px] xl:min-w-[1500px]">
            {/* Header row */}
            <div className="sticky top-0 z-30 flex border-b border-slate-200 bg-white">
              <div className="sticky left-0 z-40 w-[320px] shrink-0 border-r border-slate-200 bg-white xl:w-[340px]">
                <div className="flex w-full items-center justify-between gap-3 p-3">
                  <button
                    type="button"
                    onClick={() => setEmployeeManagerOpen(true)}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-blue-500 px-3 py-3 text-sm font-semibold text-white"
                  >
                    + Add employee
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-7">
                  {days.map((d) => {
                    const { day, wk } = fmtDayHeader(d);
                    const isToday = sameDay(d, new Date());

                    return (
                      <div
                        key={dayKey(d)}
                        className={[
                          "border-r border-slate-200 p-3",
                          isToday ? "bg-sky-50" : "bg-white",
                        ].join(" ")}
                      >
                        <div className="text-sm font-semibold text-slate-900">
                          {day}
                        </div>
                        <div className="text-xs text-slate-500">{wk}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="sticky right-0 z-40 w-[140px] shrink-0 border-l border-slate-200 bg-sky-50 xl:w-[160px]">
                <div className="p-3">
                  <div className="text-sm font-semibold text-slate-900">
                    Total hours
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            {isLoading ? (
              <div className="p-4 text-sm text-slate-600">Loading…</div>
            ) : isError ? (
              <div className="p-4 text-sm text-rose-600">
                {(error as any)?.data?.message || "Error"}
              </div>
            ) : visibleEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-sm font-semibold text-slate-800">
                  No employees in this week
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Add an employee to this week schedule or create a new one.
                </div>
                <button
                  type="button"
                  onClick={() => setEmployeeManagerOpen(true)}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                >
                  Add employee
                </button>
              </div>
            ) : (
              visibleEmployees.map((emp) => {
                const empId = emp._id;
                const empShifts = shifts.filter((s: any) => asId(s.employee) === empId);

                const totalMinutes = empShifts.reduce(
                  (sum: number, s: any) => sum + netMinutes(s),
                  0
                );
                const totalHours = hoursFromMinutes(totalMinutes);

                return (
                  <div key={empId} className="flex border-b border-slate-200">
                    {/* Employee cell */}
                    <div className="sticky left-0 z-10 w-[320px] shrink-0 border-r border-slate-200 bg-white xl:w-[340px]">
                      <div className="flex items-center gap-3 p-3">
                        <div
                          className={[
                            "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                            avatarPalette(emp._id || `${emp.firstName}-${emp.lastName}`),
                          ].join(" ")}
                        >
                          {(emp.firstName?.[0] ?? "E").toUpperCase()}
                          {(emp.lastName?.[0] ?? "").toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-900">
                            {emp.firstName} {emp.lastName || ""}
                          </div>

                          <div className="mt-1 truncate text-sm font-semibold text-slate-600">
                            {emp?.email || emp?.phone}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Day cells */}
                    <div className="flex-1">
                      <div className="grid grid-cols-7">
                        {days.map((day) => {
                          const start = new Date(day);
                          start.setHours(0, 0, 0, 0);

                          const end = new Date(day);
                          end.setHours(23, 59, 59, 999);

                          const dayList = empShifts
                            .filter((s: any) => {
                              const st = new Date(s.startAt);
                              return st >= start && st <= end;
                            })
                            .sort(
                              (a: any, b: any) =>
                                new Date(a.startAt).getTime() -
                                new Date(b.startAt).getTime()
                            );

                          const localDate = toLocalYYYYMMDD(day);

                          return (
                            <motion.button
                              key={dayKey(day)}
                              type="button"
                              whileHover={{
                                backgroundColor: "rgba(15, 23, 42, 0.03)",
                              }}
                              transition={{ duration: 0.12 }}
                              onClick={() => {
                                setEditing(null);
                                setPrefillEmployeeId(empId);
                                setPrefillDate(localDate);
                                setOpen(true);
                              }}
                              className="relative min-h-[88px] border-r border-slate-200 p-2 text-left"
                            >
                              <div className="space-y-1">
                                <AnimatePresence initial={false}>
                                  {dayList.map((s: any) => (
                                    <motion.div
                                      key={s._id}
                                      initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                      transition={{ duration: 0.15 }}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setEditing(s);
                                        setOpen(true);
                                      }}
                                      className="cursor-pointer rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-2 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                                      title="Click to edit"
                                    >
                                      <div className="text-xs font-semibold text-slate-900">
                                        {timeLabel(s.startAt)} – {timeLabel(s.endAt)}
                                      </div>

                                      {String((s as any)?.notes ?? "").trim() ? (
                                        <div className="mt-1 text-[11px] text-slate-600">
                                          {clampNote((s as any)?.notes, 30)}
                                        </div>
                                      ) : (
                                        <div className="mt-1 text-[11px] text-slate-400">
                                          No notes
                                        </div>
                                      )}
                                    </motion.div>
                                  ))}
                                </AnimatePresence>

                                {dayList.length === 0 && (
                                  <div className="select-none text-[11px] text-slate-400">
                                    Click to add
                                  </div>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="sticky right-0 z-10 w-[140px] shrink-0 border-l border-slate-200 bg-sky-50 xl:w-[160px]">
                      <div className="flex h-full items-center justify-center p-3">
                        <div className="text-sm font-semibold text-slate-900">
                          {totalHours} hrs
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Footer daily totals */}
            <div className="sticky bottom-0 z-20 flex border-t border-slate-200 bg-white">
              <div className="sticky left-0 z-30 w-[320px] shrink-0 border-r border-slate-200 bg-white xl:w-[340px]">
                <div className="p-3 text-sm font-semibold text-slate-900">
                  Daily total
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-7">
                  {dailyTotals.map((item) => (
                    <div
                      key={item.key}
                      className="border-r border-slate-200 bg-sky-50 p-3"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {item.hrs} hrs
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky right-0 z-30 w-[140px] shrink-0 border-l border-slate-200 bg-sky-100 xl:w-[160px]">
                <div className="p-3 text-sm font-semibold text-slate-900">
                  {grandTotalHours} hrs
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shift Modal */}
      <RotaModal
        open={open}
        title={editing ? "Edit Shift" : "Add Shift"}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setPrefillEmployeeId("");
          setPrefillDate("");
        }}
      >
        <BigShiftForm
          employees={employeesAll}
          roles={roles}
          initial={editing}
          loading={creating || updating}
          deleting={deleting}
          onSubmit={onSubmit}
          onDelete={editing ? () => onDeleteShift(editing._id) : undefined}
          defaultEmployeeId={prefillEmployeeId}
          defaultDate={prefillDate}
          resolveRoleIdForEmployee={resolveRoleIdForEmployee}
        />
      </RotaModal>

      {/* Employee Manager Modal */}
      <RotaModal
        open={employeeManagerOpen}
        title="Add Employee"
        onClose={() => setEmployeeManagerOpen(false)}
      >
        <EmployeeSelectorManager
          employees={addableEmployees}
          roles={roles}
          loading={creatingEmployee}
          onCreate={onCreateEmployee}
          onAddToSchedule={(emp) => {
            addEmployeeToCurrentWeek(emp._id);
            setEmployeeManagerOpen(false);
          }}
        />
      </RotaModal>
    </div>
  );
}

/* ------------------------- Shift Form ------------------------- */

function BigShiftForm({
  employees,
  roles,
  initial,
  loading,
  deleting,
  onSubmit,
  onDelete,
  defaultEmployeeId,
  defaultDate,
  resolveRoleIdForEmployee,
}: {
  employees: RotaEmployee[];
  roles: RotaRole[];
  initial: RotaShift | null;
  loading: boolean;
  deleting: boolean;
  onSubmit: (payload: any) => void;
  onDelete?: () => void;
  defaultEmployeeId?: string;
  defaultDate?: string;
  resolveRoleIdForEmployee: (empId?: string) => string;
}) {
  const initStart = initial?.startAt ? new Date(initial.startAt) : null;
  const initEnd = initial?.endAt ? new Date(initial.endAt) : null;

  const date = useMemo(() => {
    if (initStart) return toLocalYYYYMMDD(initStart);
    if (defaultDate) return defaultDate;
    return toLocalYYYYMMDD(new Date());
  }, [initStart, defaultDate]);

  const [startTime, setStartTime] = useState(() => {
    const d = initStart ?? new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  });

  const [endTime, setEndTime] = useState(() => {
    const d = initEnd ?? new Date(Date.now() + 60 * 60 * 1000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  });

  const initEmployeeId =
    initial?.employee && typeof initial.employee !== "string"
      ? (initial.employee as any)?._id
      : typeof initial?.employee === "string"
        ? initial.employee
        : "";

  const [employeeId] = useState(
    initEmployeeId || defaultEmployeeId || employees?.[0]?._id || ""
  );

  const selectedEmployee = useMemo(() => {
    return employees.find((emp) => emp._id === employeeId) || null;
  }, [employees, employeeId]);

  const [breakMinutes, setBreakMinutes] = useState<number>(
    (initial as any)?.breakMinutes ?? 0
  );
  const [notes, setNotes] = useState<string>((initial as any)?.notes ?? "");
  const [roleId, setRoleId] = useState<string>(() =>
    resolveRoleIdForEmployee(employeeId)
  );

  useEffect(() => {
    setRoleId(resolveRoleIdForEmployee(employeeId));
  }, [employeeId, resolveRoleIdForEmployee]);

  function toISO(localDate: string, t: string) {
    return new Date(`${localDate}T${t}:00`).toISOString();
  }

  const prettyDate = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }, [date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className="max-w-full"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            {initial ? "Edit shift" : "Add shift"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            For <span className="font-semibold text-slate-800">{prettyDate}</span>
          </p>
        </div>

        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
          >
            Delete
          </button>
        ) : null}
      </div>

      <div className="mt-6 grid gap-5">
        <div className="rounded-2xl p-1">
          <p className="text-sm font-semibold text-slate-800">Employee</p>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className={[
                  "grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                  avatarPalette(selectedEmployee?._id || "emp"),
                ].join(" ")}
              >
                {(selectedEmployee?.firstName?.[0] ?? "E").toUpperCase()}
                {(selectedEmployee?.lastName?.[0] ?? "").toUpperCase()}
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">
                  {selectedEmployee
                    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName || ""}`
                    : "Employee not found"}
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-slate-600">
                  {selectedEmployee ? roleNameFromEmployee(selectedEmployee) : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-1">
          <p className="text-sm font-semibold text-slate-800">Time</p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">
                Start
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">End</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-600">
              Break (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>
        </div>

        <div className="rounded-2xl p-1">
          <p className="text-sm font-semibold text-slate-800">Notes</p>
          <p className="mt-1 text-xs text-slate-500">
            These will show in the rota cell.
          </p>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Add a note (e.g., training / cover / cashier / delivery)"
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new Event("rota-modal-close"));
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={loading || !employeeId || !roleId}
          onClick={() => {
            onSubmit({
              employee: employeeId,
              role: roleId,
              startAt: toISO(date, startTime),
              endAt: toISO(date, endTime),
              breakMinutes,
              notes,
              status: "PUBLISHED",
            });
          }}
          className="w-full rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Saving..." : "Save shift"}
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------- Employee Manager Modal ------------------------- */

function EmployeeSelectorManager({
  employees,
  roles,
  loading,
  onCreate,
  onAddToSchedule,
}: {
  employees: RotaEmployee[];
  roles: RotaRole[];
  loading: boolean;
  onCreate: (payload: any) => void;
  onAddToSchedule: (employee: RotaEmployee) => void;
}) {
  const [mode, setMode] = useState<"list" | "create">("list");
  const [query, setQuery] = useState("");

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((emp) => {
      const full = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.toLowerCase();
      const email = `${emp.email ?? ""}`.toLowerCase();
      const phone = `${emp.phone ?? ""}`.toLowerCase();
      return full.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [employees, query]);

  return (
    <div className="max-w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Add employee to this week
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Only employees not already shown in this calendar appear here.
          </p>
        </div>

        <div className="inline-flex w-full rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:w-auto">
          <button
            type="button"
            onClick={() => setMode("list")}
            className={[
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none",
              mode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
            ].join(" ")}
          >
            Existing employees
          </button>
          <button
            type="button"
            onClick={() => setMode("create")}
            className={[
              "flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition sm:flex-none",
              mode === "create"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600",
            ].join(" ")}
          >
            Create new
          </button>
        </div>
      </div>

      {mode === "list" ? (
        <div className="mt-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search employee name, email, phone"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />

          <div className="mt-4 max-h-[420px] space-y-3 overflow-auto pr-1">
            {filteredEmployees.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="text-sm font-semibold text-slate-800">
                  No employees available
                </div>
                <div className="mt-1 text-sm text-slate-500">
                  Everyone is already in this week calendar, or create a new
                  employee.
                </div>
              </div>
            ) : (
              filteredEmployees.map((emp) => (
                <div
                  key={emp._id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        className={[
                          "grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                          avatarPalette(emp._id || `${emp.firstName}-${emp.lastName}`),
                        ].join(" ")}
                      >
                        {(emp.firstName?.[0] ?? "E").toUpperCase()}
                        {(emp.lastName?.[0] ?? "").toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {emp.firstName} {emp.lastName || ""}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-600">
                          {roleNameFromEmployee(emp)}
                        </div>
                        <div className="mt-1 truncate text-xs text-slate-500">
                          {emp.email || "No email"} • {emp.phone || "No phone"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToSchedule(emp)}
                      className="w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-black sm:w-auto"
                    >
                      Add to schedule
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <EmployeeQuickForm roles={roles} loading={loading} onSubmit={onCreate} />
        </div>
      )}
    </div>
  );
}

/* ------------------------- Employee Quick Form ------------------------- */

function EmployeeQuickForm({
  roles,
  loading,
  onSubmit,
}: {
  roles: RotaRole[];
  loading: boolean;
  onSubmit: (payload: any) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [role, setRole] = useState<string>(roles?.[0]?._id || "cheif");

  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    if (!role && roles?.[0]?._id) {
      setRole(roles[0]._id);
    }
  }, [roles, role]);

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
      className="space-y-5"
    >
      <div>
        <h4 className="text-lg font-semibold text-slate-900">
          Create employee
        </h4>
        <p className="mt-1 text-sm text-slate-500">
          Add a team member and instantly include them in this week schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700">
            First name
          </label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="John"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">
            Last name
          </label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Doe"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Phone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="+8801..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="hidden">
          <label className="text-sm font-semibold text-slate-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          >
            {roles.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-semibold text-slate-900">Address</div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <input
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            placeholder="Line 1"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Postcode"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || !firstName.trim() || !role}
          className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 sm:w-auto"
        >
          {loading ? "Saving..." : "Create employee"}
        </button>
      </div>
    </form>
  );
}