"use client";

import React, { ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { FaUserEdit, FaHeart, FaPowerOff } from "react-icons/fa";
import { MdLeaderboard, MdLockReset, MdSchedule } from "react-icons/md";
import { TbDeviceAnalytics, TbFridge } from "react-icons/tb";
import { CgSearch } from "react-icons/cg";
import { RiDashboard3Fill } from "react-icons/ri";
import { BiSolidOffer } from "react-icons/bi";
import { IoFastFoodOutline } from "react-icons/io5";

import ProfilePhoto from "../../ProfilePhoto";
import { useAppSelector } from "@/app/redux/hoook";
import { RootState } from "@/app/redux/store";
import { useLogOut } from "@/app/utils/logOut";

import { useGetUserByIdQuery } from "@/app/redux/services/users.services";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import { skipToken } from "@reduxjs/toolkit/query";

type Access = "allUser" | "business_owner" | string;

type SidebarCtx = {
  role?: string;
  isRestaurant: boolean;
  takeOrderUrl?: string;
};

interface NavItem {
  id: string;
  label: string;
  location?: string;
  icon: ReactNode;
  access?: Access;
  when?: (ctx: SidebarCtx) => boolean;
}

const navItems: NavItem[] = [
  {
    id: "edit-profile",
    label: "Edit Profile",
    icon: <FaUserEdit />,
    location: "/profile/edit",
    access: "allUser",
  },
  {
    id: "my-business",
    label: "My Business",
    icon: <FaHeart />,
    location: "/profile/my-busniess",
    access: "business_owner",
  },
  {
    id: "my-products",
    label: "My Products",
    icon: <RiDashboard3Fill />,
    location: "/profile/my-products",
    access: "business_owner",
  },

  // Restaurant-only
  {
    id: "fridge",
    label: "Fridge",
    icon: <TbFridge />,
    location: "/profile/fridge",
    access: "business_owner",
    when: (ctx) => ctx.isRestaurant,
  },
  {
    id: "offers",
    label: "Offers & Discount",
    icon: <BiSolidOffer />,
    location: "/profile/day-offers",
    access: "business_owner",
    when: (ctx) => ctx.isRestaurant,
  },
  {
    id: "orders",
    label: "Orders",
    icon: <BiSolidOffer />,
    location: "/profile/orders",
    access: "business_owner",
    when: (ctx) => ctx.isRestaurant,
  },

  // NEW MENU AFTER ORDERS
  {
    id: "take-order",
    label: "Take Order",
    icon: <IoFastFoodOutline />,
    access: "business_owner",
    when: (ctx) => ctx.isRestaurant && !!ctx.takeOrderUrl,
  },

  {
    id: "rota",
    label: "Rota",
    icon: <MdSchedule />,
    location: "/profile/rota",
    access: "business_owner",
  },
  {
    id: "members",
    label: "Search Members",
    icon: <CgSearch />,
    location: "/profile/members",
    access: "business_owner",
  },
  {
    id: "leads",
    label: "My Leads",
    icon: <MdLeaderboard />,
    location: "/profile/leads",
    access: "business_owner",
  },
  {
    id: "overview",
    label: "Overview",
    icon: <TbDeviceAnalytics />,
    location: "/profile/overview",
    access: "business_owner",
  },
  {
    id: "reset-password",
    label: "Reset Password",
    icon: <MdLockReset />,
    location: "/profile/reset-password",
    access: "allUser",
  },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { logOut } = useLogOut();

  const { user } = useAppSelector((state: RootState) => state.auth);

  const { data: userData } = useGetUserByIdQuery(user?.id ?? skipToken);
  const { data: businessData } = useGetAllBusinessQuery(
    user?.id ? { owner: user.id } : skipToken
  );

  const businessList = businessData?.data ?? [];
  const firstBusiness = businessList[0];
  const businessSlug = firstBusiness?.slug?.trim();
  const takeOrderUrl = businessSlug ? `/take-order/${businessSlug}` : undefined;

  const hasAccess = (itemAccess?: Access) => {
    if (!itemAccess || itemAccess === "allUser") return true;
    return user?.role === itemAccess;
  };

  const isRestaurant = useMemo(() => {
    return businessList.some((b: any) => {
      const raw = b?.selectedType ?? "";
      const t = String(raw).toLowerCase().trim();
      return /(restaura?nt|resturent)/i.test(t);
    });
  }, [businessList]);

  const ctx: SidebarCtx = useMemo(
    () => ({
      role: user?.role,
      isRestaurant,
      takeOrderUrl,
    }),
    [user?.role, isRestaurant, takeOrderUrl]
  );

  const visibleItems = useMemo(() => {
    return navItems.filter((item) => {
      if (!hasAccess(item.access)) return false;
      if (item.when && !item.when(ctx)) return false;
      return true;
    });
  }, [ctx, user?.role]);

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="sticky top-3 h-[calc(100vh-24px)] overflow-hidden border border-slate-800 bg-slate-900 text-slate-200 shadow-sm">
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ProfilePhoto className="h-12 w-12" url={userData?.data?.profilePic} />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-100">
              {userData?.data?.name ?? "—"}
            </p>
            <p className="truncate text-xs text-slate-400">{user?.role ?? ""}</p>
          </div>

          <span className="ml-auto inline-flex items-center rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200">
            Dashboard
          </span>
        </div>
      </div>

      <nav className="p-3">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400">
          MENU
        </p>

        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const location =
              item.id === "take-order" ? takeOrderUrl : item.location;

            const active = isActive(location);

            return (
              <li key={item.id}>
                {location ? (
                  <Link
                    href={location}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                      active
                        ? "border border-sky-500/20 bg-sky-600/15 text-sky-200"
                        : "text-slate-200 hover:bg-slate-800/70",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "grid h-10 w-10 place-items-center rounded-xl border",
                        active
                          ? "border-sky-500/20 bg-sky-500/15 text-sky-200"
                          : "border-slate-700 bg-slate-800 text-slate-200",
                      ].join(" ")}
                    >
                      <span className="text-lg">{item.icon}</span>
                    </span>

                    <span className="flex-1 text-sm font-medium">
                      {item.label}
                    </span>

                    <span
                      className={[
                        "h-2 w-2 rounded-full transition",
                        active ? "bg-sky-400" : "bg-transparent",
                      ].join(" ")}
                    />
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={logOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-800">
            <FaPowerOff />
          </span>
          <span className="flex-1 text-left text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}