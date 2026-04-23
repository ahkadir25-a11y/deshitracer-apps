// components/common/layout/SidebarSection.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TbPoint, TbPointFilled } from "react-icons/tb";
import React from "react";

export interface MenuElement {
  path: string;
  label: string;
  icon?: React.ReactNode;
}

export interface MenuItem {
  label: string;
  elements: MenuElement[];
}

const SidebarSection = ({ item }: { item: MenuItem }) => {
  const pathname = usePathname();

  const isActiveGroup = item?.elements?.some(
    (element) => element.path === pathname
  );

  return (
    <div className="cursor-pointer py-2">
      <div className="flex items-center gap-2">
        {isActiveGroup ? (
          <TbPointFilled size={20} className="text-lime-500" />
        ) : (
          <TbPoint size={20} className="text-lime-500" />
        )}
        <p className="text-lime-500">{item.label}</p>
      </div>
      <div className="py-3  flex flex-col gap-2">
        {item?.elements?.map((element, index) => {
          const isActive = pathname === element.path;
          return (
            <Link
              key={index}
              href={element.path}
              className={`${isActive
                  ? "bg-primary/30 text-white translate-x-5"
                  : "text-white/70 hover:text-white hover:bg-primary/30"
                } gap-2 rounded-secondary p-2 relative transition-all duration-400`}
            >
              <div className="flex items-center gap-2 justify-between pl-3">
                {isActive && (
                  <span className="w-1 h-5 absolute -left-1 rounded-lg bg-lime-600" />
                )}
                <div className="flex items-center gap-2">
                  <span className="bg-primary rounded-md p-1.5">
                    {element.icon}
                  </span>
                  <p className="text-sm font-semibold">{element.label}</p>
                </div>
              </div>
            </Link>
          );
        })}
       
      </div>
      
    </div>
  );
};

export default SidebarSection;
