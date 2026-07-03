"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/profile/rota/employees", label: "Employees" },
  { href: "/profile/rota/shifts", label: "Weekly Rota" },
];

export default function RotaNavTabs() {
  const pathname = usePathname();

  return (
    <div className="inline-flex flex-wrap gap-2 rounded-sm border border-blue-100 bg-blue-50 p-1">
      {tabs.map((t) => {
        const active = pathname?.startsWith(t.href);

        return (
          <Link
            key={t.href}
            href={t.href}
            className={[
              "rounded-sm px-4 py-2 text-sm font-semibold transition-all duration-200",
              active
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-blue-700 hover:bg-blue-100",
            ].join(" ")}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}