"use client";
import React, { useEffect, useRef } from "react";

interface OutsideClickProps {
  children: React.ReactNode;
  onOutsideClick: () => void;
  className?: string;
  targetedElement?: React.RefObject<HTMLElement | null>;
}

const OutsideClick: React.FC<OutsideClickProps> = ({
  children,
  onOutsideClick,
  className = "",
  targetedElement,
}) => {
  const wrapperRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as Node;
      const referredElement = targetedElement?.current;

      // Prevent function execution if clicking inside the dropdown or targetedElement (button + its children)
      if (
        wrapperRef.current?.contains(clickedElement) || // Click inside dropdown
        referredElement?.contains(clickedElement) // Click inside button or its children
      ) {
        return;
      }

      onOutsideClick();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onOutsideClick, targetedElement]);

  return (
    <section
      ref={wrapperRef}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </section>
  );
};

export default OutsideClick;
