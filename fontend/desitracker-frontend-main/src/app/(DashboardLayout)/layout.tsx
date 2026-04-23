"use client";

import MainContentWrapper from "@/components/shears/dashboard/wrapper/MainContentWrapper ";
import SidebarWrapper from "@/components/shears/dashboard/wrapper/SidebarWrapper ";
import { adMenuItems, ownerMenuItems } from "../utils/router";
import LoginAdminRep from "@/components/admin-components/LoginAdminRep";
import { useAppSelector } from "../redux/hoook";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useAppSelector((state) => state.auth.user);
  const menuItems = user?.role === "admin" || user?.role === "super_admin" ? adMenuItems : ownerMenuItems;

  return (
    <LoginAdminRep>
      <section className="flex relative h-screen overflow-hidden">
        <SidebarWrapper menuItems={menuItems} />
        <MainContentWrapper>{children}</MainContentWrapper>
      </section>
    </LoginAdminRep>
  );
};

export default DashboardLayout;
