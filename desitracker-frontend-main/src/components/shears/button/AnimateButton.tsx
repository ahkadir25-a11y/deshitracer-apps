"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect } from "react";
import OutsideClick from "../OutsideClick";
interface AnimateButtonProps {
  isOpen: boolean;
  targetedElement: React.RefObject<HTMLButtonElement | HTMLDivElement | null>;
  setIsOpen: (isOpen: boolean) => void;
  children: React.ReactNode;
  showAbove?: boolean;
}

const AnimateButton: React.FC<AnimateButtonProps> = ({
  isOpen,
  targetedElement,
  setIsOpen,
  children,
  showAbove,
}) => {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        targetedElement.current &&
        !targetedElement.current.contains(event.target as Node) &&
        !targetedElement.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen, targetedElement]);
  return (
    <div>
      <AnimatePresence>
        {isOpen && (
          <OutsideClick
            onOutsideClick={() => {
              setIsOpen(false);
            }}
            targetedElement={targetedElement}
          >
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`absolute ${
                showAbove ? "bottom-full mb-2" : "top-full mt-2"
              } right-0 w-auto rounded-md shadow-lg bg-white  border-none ring-opacity-5 z-10`}
            >
              {children}
            </motion.div>
          </OutsideClick>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnimateButton;
