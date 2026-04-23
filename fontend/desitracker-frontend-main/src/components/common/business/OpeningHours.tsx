/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { motion } from "framer-motion";
import { FaClock } from "react-icons/fa6";
import { useListDayOffersQuery } from "@/app/redux/services/products.services";

type OpeningHour = { day: string; start?: string; end?: string };

type Props = {
  openingHours: OpeningHour[];
  userId?: string;
  businessId?: string;
  busId?: string;         // legacy alias; we'll accept either
  className?: string;
};

const FULL_DAYS = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
] as const;

function normalizeDayName(input: string): typeof FULL_DAYS[number] | null {
  const s = (input || "").toLowerCase().trim();
  // supports "Mon", "monday", etc.
  for (const d of FULL_DAYS) {
    if (d.toLowerCase() === s) return d;
    if (d.slice(0,3).toLowerCase() === s) return d;
  }
  // try capitalizing first letter (e.g., 'monday' -> 'Monday')
  const cap = s.charAt(0).toUpperCase() + s.slice(1);
  return (FULL_DAYS as readonly string[]).includes(cap) ? (cap as any) : null;
}

function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isActiveInRange(startISO?: string | null, endISO?: string | null) {
  const now = new Date();
  const start = startISO ? new Date(startISO) : null;
  const end = endISO ? new Date(endISO) : null;
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23,59,59);
  return (!start || start <= now) && (!end || end >= endOfToday);
}

function chooseOfferForDay(day: string, offers: Array<{ day: string; discount_percent: number; start_date?: string | null; end_date?: string | null }>) {
  const dayOffers = offers.filter(o => normalizeDayName(o.day) === normalizeDayName(day));
  if (dayOffers.length === 0) return null;

  const now = new Date();

  const active = dayOffers
    .filter(o => isActiveInRange(o.start_date || undefined, o.end_date || undefined))
    .sort((a,b) => {
      const as = a.start_date ? +new Date(a.start_date) : 0;
      const bs = b.start_date ? +new Date(b.start_date) : 0;
      return bs - as; // newest first
    });

  if (active.length > 0) {
    return { kind: "active" as const, offer: active[0] };
  }

  const scheduled = dayOffers
    .filter(o => {
      const s = o.start_date ? new Date(o.start_date) : null;
      return s && s > now;
    })
    .sort((a,b) => +new Date(a.start_date!) - +new Date(b.start_date!)); // earliest upcoming

  if (scheduled.length > 0) {
    return { kind: "scheduled" as const, offer: scheduled[0] };
  }

  // otherwise, consider latest expired (useful context)
  const expired = dayOffers
    .filter(o => {
      const e = o.end_date ? new Date(o.end_date) : null;
      return e && e < now;
    })
    .sort((a,b) => +new Date(b.end_date!) - +new Date(a.end_date!)); // most recent past
  if (expired.length > 0) {
    return { kind: "expired" as const, offer: expired[0] };
  }

  return null;
}

function Chip({
  tone = "gray",
  children,
}: {
  tone?: "green" | "amber" | "gray";
  children: React.ReactNode;
}) {
  const map = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    amber: "bg-amber-50 text-amber-800 ring-amber-600/20",
    gray:  "bg-gray-100 text-gray-700 ring-gray-500/20",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${map[tone]}`}>
      {children}
    </span>
  );
}

const OpeningHours: React.FC<Props> = ({ openingHours, userId, businessId, busId, className = "" }) => {
  const bizId = businessId ?? busId;
  const shouldFetch = Boolean(userId && bizId);

  // If your RTK Query hook supports "skip", use the 2nd arg:
  const { data: offers, isLoading } = useListDayOffersQuery(
    shouldFetch ? { user_id: userId!, business_id: bizId! } : ({} as any),
    { skip: !shouldFetch }
  );

  const todayIdx = new Date().getDay();
  const todayName = FULL_DAYS[todayIdx];

  return (
    <div id="products-offers" className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto ${className}`}>
      <div className="flex items-center mb-4 gap-2">
        <FaClock className="text-gray-700 h-4 w-4" />
        <h2 className="text-xl font-semibold text-gray-800">Business Opening Hours</h2>
      </div>

      <motion.ul
        className="divide-y divide-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {openingHours.map(({ day, start, end }, index) => {
          const normalized = normalizeDayName(day) ?? day;
          const isTodayRow = normalizeDayName(day) === todayName;

          const picked = offers ? chooseOfferForDay(day, offers) : null;
          let badge: React.ReactNode = null;

          if (isLoading && shouldFetch) {
            badge = <span className="inline-block h-4 w-14 bg-gray-200 rounded animate-pulse" />;
          } else if (picked) {
            const pct = picked.offer.discount_percent;
            if (picked.kind === "active") {
              badge = <Chip tone="green">{pct}% off</Chip>;
            } else if (picked.kind === "scheduled") {
              badge = <Chip tone="amber">{pct}% from {prettyDate(picked.offer.start_date || "")}</Chip>;
            } else {
              // expired (most recent)
              badge = <Chip tone="gray">{pct}% (expired)</Chip>;
            }
          }

          return (
            <motion.li
              key={`${day}-${index}`}
              className={`flex items-center justify-between py-3 ${isTodayRow ? "bg-amber-50/40 rounded-md px-2 -mx-2" : ""}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">{normalized}</span>
                {isTodayRow && <span className="text-amber-700 text-xs">• today</span>}
              </div>

              <div className="flex items-center gap-3">
                {badge && <div>{badge}</div>}
                {start && end ? (
                  <span className="text-gray-600 tabular-nums">{start} – {end}</span>
                ) : (
                  <span className="text-gray-400 italic">Closed</span>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
};

export default OpeningHours;
