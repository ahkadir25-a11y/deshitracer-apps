import { AnimatePresence } from "framer-motion";
import { ReactNode, RefObject, useState, useEffect, useRef } from "react";
import OutsideClick from "../OutsideClick";

interface Props {
  open: boolean;
  children: ReactNode;
  onOutsideClick: () => void;
  targetedElement?: RefObject<HTMLDivElement | HTMLButtonElement | null>;
  className?: string;
}

const DropdownWithOutsideClick = ({
  open,
  children,
  onOutsideClick,
  targetedElement,
  className,
}: Props) => {
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && dropdownRef.current && menuRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - dropdownRect.bottom;
      const spaceAbove = dropdownRect.top;

      if (menuHeight > spaceBelow && spaceAbove > spaceBelow) {
        setOpenUpward(true); // Open upwards
      } else {
        setOpenUpward(false); // Open downwards
      }
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <OutsideClick
          onOutsideClick={onOutsideClick}
          targetedElement={targetedElement}
          className={className}
        >
          <div ref={dropdownRef} className="relative">
            <div
              ref={menuRef}
              className={`absolute z-10 w-full bg-white rounded-md shadow-[2px_2px_10px_0px] shadow-gray-300 ${
                openUpward ? "bottom-[75%]" : "top-full"
              }`}
            >
              {children}
            </div>
          </div>
        </OutsideClick>
      )}
    </AnimatePresence>
  );
};

export default DropdownWithOutsideClick;
