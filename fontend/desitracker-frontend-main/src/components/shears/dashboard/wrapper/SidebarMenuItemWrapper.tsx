import React from "react";
import Hamburger from "../Layout/Hamburger";

const SidebarMenuItemWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
 
  return (
    <aside className="border-r bg-[#0E111A]  overflow-auto shadow h-screen ">
      <div>
        <Hamburger />
        <div className="px-1 py-10 w-full">{children}</div>
      </div>
    </aside>
  );
};

export default SidebarMenuItemWrapper;
