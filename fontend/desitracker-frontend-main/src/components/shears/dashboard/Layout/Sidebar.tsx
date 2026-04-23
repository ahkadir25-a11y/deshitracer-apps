"use client";
import { useLogOut } from "@/app/utils/logOut";
import { MenuItem } from "../types/commonTypes";
import SidebarMenuItemWrapper from "../wrapper/SidebarMenuItemWrapper";
import SidebarSection from "../wrapper/SidebarSection";
import { RiArrowRightUpBoxLine } from "react-icons/ri";
import Link from "next/link";
import { CiLogout } from "react-icons/ci";
import { useAppSelector } from "@/app/redux/hoook";

const Sidebar = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const { logOut } = useLogOut();
  const isOpenSidebar =
    useAppSelector((state) => state.header.isOpenSidebar) || false;
  const isMobileOpenSidebar =
    useAppSelector((state) => state.header.isMobileOpenSidebar) || false;
  return (
    <SidebarMenuItemWrapper>
      <div className={`md:block !hidden ${!isOpenSidebar ? "hidden" : ""}`}>
        <Link
          href="/"
          target="_blank"
          className="text-gray-300 border-b border-gray-600 flex items-center justify-start gap-4 hover:opacity-40 transition-all duration-500 px-3 py-2"
        >
          <p>Visit site</p>
          <RiArrowRightUpBoxLine className="text-orange-400" size={30} />
        </Link>
        {menuItems?.map((item, index) => (
          <SidebarSection key={index} item={item} />
        ))}
        <button
          className="text-red-500 bg-red-300 flex items-center gap-4 max-w-48 absolute bottom-6 mx-auto left-0 right-0 cursor-pointer border rounded-lg px-3 py-2 text-left"
          onClick={() => {
            logOut();
          }}
        >
          <CiLogout size={30} />
          Logout
        </button>
      </div>
      <div className={`md:hidden !block ${!isMobileOpenSidebar ? "hidden" : ""}`}>
        <Link
          href="/"
          target="_blank"
          className="text-gray-300 border-b border-gray-600 flex items-center justify-start gap-4 hover:opacity-40 transition-all duration-500 px-3 py-2"
        >
          <p>Visit site</p>
          <RiArrowRightUpBoxLine className="text-orange-400" size={30} />
        </Link>
        {menuItems?.map((item, index) => (
          <SidebarSection key={index} item={item} />
        ))}
        <button
          className="text-red-500 bg-red-300 flex items-center gap-4 max-w-48 mx-auto left-0 right-0 cursor-pointer border rounded-lg w-full px-3 py-2 text-left"
          onClick={() => {
            logOut();
          }}
        >
          <CiLogout size={30} />
          Logout
        </button>
      </div>
    </SidebarMenuItemWrapper>
  );
};

export default Sidebar;
