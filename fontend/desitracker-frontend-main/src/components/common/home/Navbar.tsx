"use client";

import { useAppSelector } from "@/app/redux/hoook";
import Profile from "@/components/shears/user/Profile";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiSignInLight } from "react-icons/pi";
import { usePathname } from "next/navigation";
import { useGetSettingsQuery } from "@/app/redux/services/settings";
import Sidebar from "./Sidebar";
import { useGetMemberMeQuery } from "@/app/redux/services/member.service";
import MemberMenu from "./MemberMenu";
{
  /* <Profile /> */
}
export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: me } = useGetMemberMeQuery();

  const [bgColor, setBgColor] = useState("");
  const pathname = usePathname();
  const { data: currentSettings } = useGetSettingsQuery({});

  // const userData = useAppSelector((state) => state.user);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setBgColor("#222");
      } else {
        setBgColor("");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <div
      className={`bg-black w-full z-50 transition-all duration-500 `}
      style={{ backgroundColor: pathname === "/" ? bgColor : "#222" }}
    >
      <nav className="  py-1 md:px-6 px-2 flex md:justify-evenly justify-between items-center lg:max-w-[1450px] mx-auto">
        {/* Logo */}
        <div>
          <Link href="/">
            <Image
              src={currentSettings?.data?.logo || "/logo.png"}
              alt="logo"
              width={400}
              height={400}
              className="rounded-full md:w-20 w-16 md:h-20 h-16 "
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="md:gap-3 gap-1 !text-xs justify-end text-center hidden md:flex">
          <Link
            href="/"
            className="text-white hover:text-gray-200 underline-animate rounded px-2 font-normal text-sm py-0.5 transition-all duration-600"
          >
            Home
          </Link>
          <Link
            href="/business"
            className="text-white hover:text-gray-200 underline-animate rounded px-2 font-normal text-sm py-0.5 transition-all duration-600"
          >
            Find Business
          </Link>
          <Link
            href="/contact"
            className="text-white hover:text-gray-200 underline-animate rounded px-2 font-normal text-sm py-0.5 transition-all duration-600"
          >
            Contact Us
          </Link>
          <Link
            href="/about-us"
            className="text-white hover:text-gray-200 underline-animate rounded px-2 font-normal text-sm py-0.5 transition-all duration-600"
          >
            About Us
          </Link>
          <Link
            href="/how-it-works"
            className="text-white hover:text-gray-200 underline-animate rounded px-2 font-normal text-sm py-0.5 transition-all duration-600"
          >
            How It works
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          {
            !user?.email && (
              <MemberMenu />
            )
          }
          {/* Auth Buttons */}
          {me?.serialNumber ?
            ""
            : user ? (
              <Profile />
            ) : (
              <div className="flex items-center gap-2">

                <Link
                  href="/auth/signin"
                  className="px-6 py-2  md:flex hidden flex-wrap relative transition-all duration-300 group items-center pr-12 gap-2 bg-[#222] text-white rounded-full md:text-md text-sm font-normal hover:bg-[#222]"
                >
                  <span className="md:block hidden">List your business</span>{" "}
                  <span className="md:block hidden">/ Sign Up</span>
                  <div className="rounded-full group-hover:bg-[#222] transition-all duration-300 !text-white bg-[#222] absolute group-hover:right-3 p-1.5 right-0">
                    <PiSignInLight strokeWidth={10} size={24} />
                  </div>
                </Link>
              </div>
            )}
          <Sidebar />

        </div>
      </nav>
    </div>
  );
}
