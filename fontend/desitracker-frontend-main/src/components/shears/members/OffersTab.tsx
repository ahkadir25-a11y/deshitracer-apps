/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Filter,
  Search,
  Globe2,
  Building2,
  MapPinned,
  MapPin,
  ChevronDown,
  X,
  Loader2,
} from "lucide-react";
import clsx from "clsx";

// ⭐ Day offers API (server supports ?country= & ?city=)
import {
  useListDayOffersQuery,
  type IDayOffer,
  type Weekday,
} from "@/app/redux/services/products.services";
import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* Types for country.json                                                     */
/* -------------------------------------------------------------------------- */

type CityOption = { label: string; value: string };
type CountryFromJson = {
  label: string; // country name
  value: string; // country name
  city?: string[]; // raw list (from your JSON)
  cities?: CityOption[]; // normalized
};

/* -------------------------------------------------------------------------- */
/* Small helpers                                                              */
/* -------------------------------------------------------------------------- */

const COUNTRY_JSON_PATH = "/country.json"; // keep in /public/country.json

const WEEKDAYS: Weekday[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function prettyDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function isToday(weekday: Weekday) {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long" }) as Weekday;
  return weekday === today;
}

function statusOf(offer: IDayOffer) {
  const now = new Date();
  const start = offer.start_date ? new Date(offer.start_date) : null;
  const end = offer.end_date ? new Date(offer.end_date) : null;
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const inRange = (!start || start <= now) && (!end || end >= endOfToday);

  if (end && end < now) return { label: "Expired", tone: "red" as const };
  if (!inRange) return { label: "Scheduled", tone: "amber" as const };
  if (inRange && isToday(offer.day)) return { label: "Active today", tone: "green" as const };
  return { label: "In range", tone: "gray" as const };
}

function Chip({
  tone = "gray",
  children,
}: {
  tone?: "green" | "red" | "amber" | "gray";
  children: React.ReactNode;
}) {
  const map = {
    green: "bg-emerald-500/10 text-emerald-200 border-emerald-600/30",
    red: "bg-red-500/10 text-red-200 border-red-600/30",
    amber: "bg-amber-500/10 text-amber-200 border-amber-600/30",
    gray: "bg-white/5 text-slate-300 border-white/10",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${map[tone]}`}>
      {children}
    </span>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={clsx("text-left p-3 font-medium text-gray-300", className)}>{children}</th>;
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
    <td className={clsx("p-3 align-middle", mono && "font-mono", right && "text-right")}>
      {children}
    </td>
  );
}



function getBiz(o: IDayOffer) {
  return (o as any).business_id; // populated business
}

/* -------------------------------------------------------------------------- */
/* Reusable searchable dropdown (same UX you had)                             */
/* -------------------------------------------------------------------------- */

type BaseDropdownProps = {
  labelIcon?: React.ReactNode;
  placeholder: string;
  value?: string;
  disabled?: boolean;
  loading?: boolean;
  items: string[];
  onPick: (v: string) => void;
  onClear?: () => void;
  searchPlaceholder?: string;
};

function classNames(...xs: Array<string | false | null | undefined>): string {
  return xs.filter(Boolean).join(" ");
}

function BaseDropdown({
  labelIcon,
  placeholder,
  value,
  disabled,
  loading,
  items,
  onPick,
  onClear,
  searchPlaceholder = "Search…",
}: BaseDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((x) => x.toLowerCase().includes(q)) : items;
  }, [items, query]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setHighlight(-1);
      }
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setHighlight(-1);
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function scrollItemIntoView(index: number) {
    const container = listRef.current;
    if (!container) return;
    const btns = container.querySelectorAll<HTMLButtonElement>("[data-opt]");
    const el = btns[index];
    if (!el) return;
    const cTop = container.scrollTop;
    const cBot = cTop + container.clientHeight;
    const iTop = el.offsetTop;
    const iBot = iTop + el.offsetHeight;
    if (iTop < cTop) container.scrollTop = iTop - 8;
    if (iBot > cBot) container.scrollTop = iBot - container.clientHeight + 8;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    const max = filtered.length - 1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => {
        const n = Math.min(max, h + 1);
        scrollItemIntoView(n);
        return n;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => {
        const n = Math.max(-1, h - 1);
        if (n >= 0) scrollItemIntoView(n);
        return n;
      });
    } else if (e.key === "Enter") {
      if (highlight >= 0) {
        onPick(filtered[highlight]);
        setOpen(false);
        setHighlight(-1);
        setQuery("");
      } else if (filtered.length > 0) {
        onPick(filtered[0]);
        setOpen(false);
        setHighlight(-1);
        setQuery("");
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={classNames(
          "w-full pl-9 pr-9 py-2 bg-[#182227] border border-[#243A41] rounded-md text-left relative",
          "text-[13px] placeholder:text-slate-500 hover:border-[#2B434A] focus:outline-none focus:border-[#35B0A6]",
          disabled ? "opacity-60 cursor-not-allowed" : ""
        )}
      >
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          {labelIcon ?? <MapPin className="w-4 h-4 text-slate-400" />}
        </span>
        <span className={classNames("truncate", value ? "text-slate-200" : "text-slate-500")}>
          {value || placeholder}
        </span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && onClear && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="inline-flex items-center justify-center rounded hover:bg-[#1F2A2F] p-1"
              aria-label="Clear"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
          <ChevronDown className={classNames("w-4 h-4 text-slate-400 transition", open ? "rotate-180" : "")} />
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full bg-[#0F1518] border border-[#243A41] rounded-md shadow-lg">
          <div className="p-2 border-b border-[#243A41]">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                className="w-full pl-3 pr-7 py-2 bg-[#151C20] border border-[#243A41] rounded-md outline-none focus:border-[#35B0A6] text-[13px] placeholder:text-slate-500"
              />
              {query && (
                <button
                  aria-label="Clear search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#1F2A2F]"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="h-72">
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-[12px] text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-3 text-[12px] text-slate-400">No results</div>
            ) : (
              <div ref={listRef} className="overflow-y-auto max-h-full">
                {filtered.map((item, idx) => {
                  const focused = idx === highlight;
                  const active = value === item;
                  return (
                    <button
                      key={item}
                      data-opt
                      onClick={() => {
                        onPick(item);
                        setOpen(false);
                        setHighlight(-1);
                        setQuery("");
                      }}
                      className={classNames(
                        "w-full text-left px-3 py-2 text-[13px] border-b border-[#152126]",
                        active ? "bg-[#20333A] text-emerald-300" : "hover:bg-[#121A1E] text-slate-300",
                        focused && !active ? "outline outline-[#2B434A]" : ""
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* OFFERS TAB (uses country.json for dropdowns + day-offers API for results)  */
/* -------------------------------------------------------------------------- */

export default function OffersTab() {
  // text + weekday filters
  const [q, setQ] = useState("");
  const [weekday, setWeekday] = useState<Weekday | "All">("All");
  const router = useRouter();
  // country/city selections (from country.json)
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // load all countries/cities from /public/country.json
  const [countries, setCountries] = useState<CountryFromJson[]>([]);
  const [loadingCountries, setLoadingCountries] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingCountries(true);
        const res = await fetch(COUNTRY_JSON_PATH);
        const raw: any[] = await res.json();
        if (!mounted) return;
        const normalized: CountryFromJson[] = raw.map((c) => ({
          label: c.name,
          value: c.name,
          cities: (c.city || []).map((x: string) => ({ label: x, value: x })),
        }));
        setCountries(normalized);
      } catch (e) {
        console.error("Failed to load country.json", e);
        setCountries([]);
      } finally {
        if (mounted) setLoadingCountries(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // arrays for dropdowns
  const countryNames = useMemo(() => countries.map((c) => c.value), [countries]);
  const citiesByCountry = useMemo<Record<string, string[]>>(
    () =>
      countries.reduce((acc, c) => {
        acc[c.value] = (c.cities || []).map((cc) => cc.value);
        return acc;
      }, {} as Record<string, string[]>),
    [countries]
  );
  const cityNames = selectedCountry ? citiesByCountry[selectedCountry] || [] : [];

  // fetch offers with server filters
  const { data: offers, isFetching, isLoading } = useListDayOffersQuery(
    {
      country: selectedCountry || undefined,
      city: selectedCity || undefined,
    } as any
  );

  const todayName = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  // local text + weekday filter on the fetched list
  const filtered: IDayOffer[] = (offers ?? [])
    .filter((o) => (weekday === "All" ? true : o.day === weekday))
    .filter((o) => {
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      const biz = getBiz(o);
      return (
        o.day.toLowerCase().includes(s) ||
        String(o.discount_percent).includes(s) ||
        prettyDate(o.start_date).toLowerCase().includes(s) ||
        prettyDate(o.end_date || "").toLowerCase().includes(s) ||
        (biz?.businessName?.toLowerCase().includes(s) ?? false)
      );
    })
    .sort((a, b) => {
      const at = isToday(a.day) ? 1 : 0;
      const bt = isToday(b.day) ? 1 : 0;
      if (at !== bt) return bt - at;
      const ad = a.start_date ? +new Date(a.start_date) : 0;
      const bd = b.start_date ? +new Date(b.start_date) : 0;
      return bd - ad;
    });

  return (
    <section className="space-y-4">
      <div className="bg-[#151C20] rounded-xl border border-[#243A41] p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#35B0A6]" />
            <h2 className="text-[16px] font-semibold">Weekly Day Offers</h2>
          </div>
          <div className="text-[12px] text-slate-400">
            Today: <span className="text-slate-200">{todayName}</span>
          </div>
        </div>

        {/* Toolbar: search + weekday + country.json dropdowns */}
        <div className="flex flex-wrap items-center gap-2 -mx-5 px-5 py-3 bg-[#151C20]/90 border-y border-[#243A41]">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by business, day, % or date…"
              className="pl-8 pr-3 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px] w-72"
            />
          </div>

          {/* Weekday */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={weekday}
              onChange={(e) => setWeekday(e.target.value as Weekday | "All")}
              className="px-2 py-2 bg-[#182227] border border-[#243A41] rounded-md text-[13px]"
            >
              <option value="All">All days</option>
              {WEEKDAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Country (from country.json) */}
          <div className="w-56">
            <BaseDropdown
              labelIcon={<Globe2 className="w-4 h-4 text-slate-400" />}
              placeholder={loadingCountries ? "Loading countries…" : "All countries"}
              value={selectedCountry}
              disabled={loadingCountries}
              loading={loadingCountries}
              items={countryNames}
              onPick={(c) => {
                setSelectedCountry(c);
                setSelectedCity("");
              }}
              onClear={() => {
                setSelectedCountry("");
                setSelectedCity("");
              }}
              searchPlaceholder="Search country"
            />
          </div>

          {/* City (depends on selected country) */}
          <div className="w-64">
            <BaseDropdown
              labelIcon={<Building2 className="w-4 h-4 text-slate-400" />}
              placeholder={!selectedCountry ? "Pick a country first" : "All cities/divisions/districts"}
              value={selectedCity}
              disabled={!selectedCountry}
              loading={false}
              items={cityNames}
              onPick={(city) => setSelectedCity(city)}
              onClear={() => setSelectedCity("")}
              searchPlaceholder="Search city"
            />
          </div>

          {(isFetching || isLoading) && (
            <span className="text-[12px] text-slate-400">Loading…</span>
          )}
        </div>


        {/* Table */}
        <div className="mt-4 overflow-x-auto rounded-lg border border-[#243A41]">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <Th>Weekday</Th>
                <Th>% Discount</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Status</Th>
                <Th>Business</Th>
                <Th>Location</Th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              )}

              {!isLoading &&
                filtered.map((o) => {
                  const { label, tone } = statusOf(o);
                  const biz = getBiz(o);
                  const loc = biz?.locations ?? {};
                  const locationText = loc?.country + ',' + (loc.city || loc.division || loc.district || loc.country || "—");
 
                  return (
                    <tr
                      key={o._id}
                      onClick={() => router.push(`/business-details/${biz?.slug}?redirect=true`)}
                      className={clsx(
                        "border-t cursor-pointer border-[#243A41] hover:bg-white/5 transition",
                        label === "Expired" && "opacity-70"
                      )}
                    >
                      <Td>
                        <div className="flex items-center">
                          <span className="mr-2 inline-block h-4 w-1.5 rounded-full bg-gradient-to-b from-amber-400 via-fuchsia-400 to-sky-400" />
                          <span className="font-medium">{o.day}</span>
                          {isToday(o.day) && <span className="ml-2 text-xs text-amber-300">• today</span>}
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center rounded-md border border-white/10 px-2 py-0.5 text-xs">
                          {o.discount_percent}% off
                        </span>
                      </Td>
                      <Td>{prettyDate(o.start_date)}</Td>
                      <Td>{prettyDate(o.end_date)}</Td>
                      <Td><Chip tone={tone}>{label}</Chip></Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          {biz?.logo ? (
                            <img src={biz.logo} alt="" className="w-7 h-7 rounded-md object-cover border border-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10" />
                          )}
                          <div className="leading-tight">
                            <div className="font-medium text-[13px]">{biz?.businessName || "—"}</div>
                            <div className="text-[11px] text-slate-400">{biz?.slug || ""}</div>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <div className="text-[12px] text-slate-300 flex items-center gap-2">
                          <MapPinned className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </Td>
                    </tr>
                  );
                })}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-sm text-slate-400">
                    No day offers found for your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-slate-400 mt-3">
          These are time-bounded, weekday-based discounts. Availability depends on each offer’s start/end dates.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------- Skeleton row ------------------------------ */

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-3"><div className="h-4 w-28 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-16 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-24 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-20 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-44 bg-white/10 rounded" /></td>
      <td className="p-3"><div className="h-4 w-36 bg-white/10 rounded" /></td>
    </tr>
  );
}
