import { toggleMobileSidebar, toggleSidebar } from "@/app/redux/features/header.slice";
import { useAppDispatch, useAppSelector } from "@/app/redux/hoook";
import React from "react";
import { FaArrowRight } from "react-icons/fa";
const Hamburger = () => {
  const dispatch = useAppDispatch();
  const isOpenSidebar =
    useAppSelector((state) => state.header.isOpenSidebar) || false;
  const isMobileOpenSidebar =
    useAppSelector((state) => state.header.isMobileOpenSidebar) || false;
  return (
    <button
      type="button"
      onClick={() => {
        dispatch(toggleSidebar())
        dispatch(toggleMobileSidebar())
      }}
      className={`absolute rounded-full z-50 border top-0 p-3
            ${isOpenSidebar || isMobileOpenSidebar ? "bg-white -right-11" : "-right-10 text-white bg-black"
        } !z-50 transition-all  duration-700 delay-500`}
    >
      <p
        className={`transform md:block hidden cursor-pointer transition-transform duration-500  ${isOpenSidebar ? "rotate-180" : "rotate-0"
          }`}
      >
        {" "}
        <FaArrowRight />
      </p>
      <p
        className={`transform md:hidden block cursor-pointer  transition-transform duration-500  ${isMobileOpenSidebar ? "rotate-180" : "rotate-0"
          }`}
      >
        {" "}
        <FaArrowRight />
      </p>
    </button>
  );
};

export default Hamburger;
