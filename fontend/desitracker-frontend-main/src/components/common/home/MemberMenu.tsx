/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React from "react";
import {
  LogOut,
  CreditCard,
  ChevronDown,
  Crown,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useGetMemberMeQuery } from "@/app/redux/services/member.service";

/** read a cookie on the client */
function getCookie(name: string) {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match?.[2];
}

export default function EnhancedMemberMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const hasToken = !!getCookie("desiTrackerToken");

  React.useEffect(() => {
    if (hasToken) {
      router.refresh();
    }
  }, [hasToken]);

  const { data: me } = useGetMemberMeQuery(undefined, { skip: !hasToken });

  // logged-out button styled for a dark navbar
  if (!hasToken || !me) {
    return (
      <div className="group relative">
        <Link
          href="/become-a-member"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                     bg-white/10 hover:bg-white/20 border border-white/15 text-white
                     transition-all duration-200"
        >
          <Crown className="w-3.5 h-3.5" />
          <span>Become a Member Get 10% Off</span>
        </Link>
      </div>
    );
  }

  return <UserDropdown member={me} />;
}

function UserDropdown({ member }: { member: any }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const initial =
    (member?.name || "U").trim().charAt(0).toUpperCase() || "U";

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onLogout = () => {
    document.cookie = `desiTrackerToken=; path=/; max-age=0`;
    // force a page-level refresh and go home
    router.replace("/");
    window.location.pathname = "/";
    setOpen(false);
  };

  const onDashboard = () => {
    router.push("/members/dashboard");
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger — dark, glassy to match navbar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm shadow
                    bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all
                    ${open ? "bg-white/20" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
      >
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-xs font-semibold flex items-center justify-center">
            {initial}
          </div>
          {member.active && (
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-black/60 rounded-full" />
          )}
        </div>

        <div className="hidden sm:flex flex-col items-start min-w-0">
          <span className="text-xs font-semibold text-white/95 truncate max-w-[110px]">
            {member.name || "Member"}
          </span>
          <span className="text-[10px] text-white/70 flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Premium
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-white/70 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown — dark panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 mt-2 w-56 z-50 overflow-hidden
                       rounded-2xl border border-white/10 shadow-xl
                       bg-neutral-900/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-sm font-semibold flex items-center justify-center">
                    {initial}
                  </div>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {member.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium
                        ${member.active ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/70"}`}
                    >
                      <Shield className="w-3 h-3" />
                      {member.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <button
              onClick={onDashboard}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm
                         text-white/90 hover:bg-white/5"
              role="menuitem"
            >
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-300" />
              </div>
              <span className="flex-1">Dashboard</span>
            </button>

            <div className="border-t border-white/10 mx-4" />

            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm
                         text-rose-300 hover:bg-rose-500/10"
              role="menuitem"
            >
              <div className="w-7 h-7 bg-rose-500/15 rounded-lg flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="flex-1">Sign Out</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
