"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useRef, useState } from "react";
import { calculatePosition } from "../utils/calculatePosition";
import { HiDotsVertical } from "react-icons/hi";
import { AnimatePresence, motion } from "framer-motion";
import OutsideClick from "../OutsideClick";
interface ActionItem {
  id: string;
  name: string;
  icon: any;
}

interface TableActionButtonProps {
  actionItems: ActionItem[];
  handleAction: (id: string) => void;
}
const TableActionButton = ({
  actionItems,
  handleAction,
}: TableActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showAbove, setShowAbove] = useState(false);
  const toggleDropdown = () => {
    if (!isOpen) {
      setShowAbove(calculatePosition(buttonRef));
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="relative text-left mx-auto flex justify-end">
      <button
        ref={buttonRef}
        type="button"
        className={`text-base cursor-pointer  py-2 bg-[#CCE4FF] font-semibold rounded border-2 border-transparent
        transition-all duration-100 ease-in-out 
        hover:bg-[#CCE4FF] hover:border-[#017BFE] hover:border-2 
        ${isOpen ? "bg-[#cae2fd] !border-[#4a9cf3] border-2" : ""}`}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <HiDotsVertical className="font-semibold text-xl text-[#017BFE]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <OutsideClick
            onOutsideClick={() => {
              setIsOpen(false);
            }}
            targetedElement={buttonRef}
          >
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute ${
                showAbove ? "bottom-full mb-2" : "top-full mt-2"
              } right-0 w-auto rounded-md shadow-lg bg-white  ring-opacity-5 z-10`}
            >
              <div className="w-full">
                <ul className="cursor-pointer text-start space-y-[2px]">
                  {actionItems.map((item: any) => (
                    <li
                      className="w-full text-nowrap text-sm px-[13px] py-2 hover:bg-[#cce4ff] focus:bg-[#cce4ff] rounded flex justify-start gap-[10px] items-center duration-300"
                      key={item.id}
                      onClick={() => handleAction(item.id)}
                    >
                      {/* <img
                        src={item.icon}
                        alt="icon"
                        className="object-cover size-[14px]"
                      /> */}
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </OutsideClick>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TableActionButton;
