"use client";

import MainContentWrapper from "@/components/shears/dashboard/wrapper/MainContentWrapper ";
import SidebarWrapper from "@/components/shears/dashboard/wrapper/SidebarWrapper ";
import { adMenuItems } from "../utils/router";
import LoginAdminRep from "@/components/admin-components/LoginAdminRep";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoginAdminRep>
      <section className="flex relative h-screen overflow-hidden">
        <SidebarWrapper menuItems={adMenuItems} />
        <MainContentWrapper>{children}</MainContentWrapper>
      </section>
    </LoginAdminRep>
  );
};

export default DashboardLayout;
