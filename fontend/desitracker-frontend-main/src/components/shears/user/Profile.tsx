"use client";
import { useRef, useState, useEffect } from "react";
import { IoIosLogOut } from "react-icons/io";
import { useAppSelector } from "@/app/redux/hoook";
import Link from "next/link";
import { PiUserLight } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import { MdDashboard } from "react-icons/md";
import { useLogOut } from "@/app/utils/logOut";

const Profile = () => {
  const [isVisible, setIsVisible] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAppSelector((state) => state.auth) as {
    user: { role: string; email: string; id: string } | null;
  };

  const { logOut } = useLogOut();

  const toggleDropdown = () => {
    setIsVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      profileRef.current &&
      !profileRef.current.contains(event.target as Node)
    ) {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible]);

  const items = [
    {
      id: "my-profile",
      to: `/profile/edit`,
      name: "My Profile",
      icon: <CiUser size={18} />,
      role: "all",
    },
    {
      id: "dashboard",
      to: `/admin/dashboard`,
      name: "My Dashboard",
      icon: <MdDashboard size={18} />,
      role: "admin",
    },
    
  ];

  // Remove the stray '2' at the end of the line
  const filteredItems = items.filter(
    (item) => item.role === "all" || item.role === user?.role
  );

  return (
    <div className="relative" ref={profileRef}>
      {/* Profile Icon */}
      <div
        className="bg-white cursor-pointer rounded-full p-2 md:p-2.5 border  border-white transition duration-200 text-black"
        onClick={toggleDropdown}
      >
        <PiUserLight size={24} />
      </div>

      {/* Dropdown */}
      {isVisible && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 flex flex-col space-y-1 bg-white border border-gray-200 rounded-md shadow-xl w-48 px-4 py-3 z-50"
        >
          {filteredItems.map((item) => (
            <Link
              href={item.to}
              key={item.id}
              passHref
              className="flex items-center cursor-pointer gap-2 px-2 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-100 transition-all"
            >
              <span className="text-[#222]">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}

          <hr className="my-1 border-gray-200" />

          <button
            onClick={() => logOut()}
            className="flex items-center cursor-pointer gap-2 px-2 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100 transition-all"
          >
            <IoIosLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
