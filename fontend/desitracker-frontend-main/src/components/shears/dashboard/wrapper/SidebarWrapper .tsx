// components/common/layout/SidebarWrapper.tsx
"use client";
import { useAppSelector } from "@/app/redux/hoook";
import Sidebar from "../Layout/Sidebar";
import { MenuItem } from "../types/commonTypes";

const SidebarWrapper = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const isOpenSidebar =
    useAppSelector((state) => state.header.isOpenSidebar) || false;
  const isMobileOpenSidebar =
    useAppSelector((state) => state.header.isMobileOpenSidebar) || false;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block absolute z-50 lg:relative h-full bg-white shadow-md transition-all duration-700 ease-in-out ${
          isOpenSidebar ? "w-[18%] translate-x-0" : "w-0 -translate-x-full"
        }`}
      >
        <Sidebar menuItems={menuItems} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-1/2 md:w-[40%] bg-white z-50 shadow-lg transition-transform duration-500 ease-in-out lg:hidden ${
          isMobileOpenSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar menuItems={menuItems} />
      </aside>
    </>
  );
};

export default SidebarWrapper;
