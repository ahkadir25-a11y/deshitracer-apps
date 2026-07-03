// components/Spinner.js
import React from "react";
import { CgSpinnerTwo } from "react-icons/cg";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <CgSpinnerTwo className="text-black text-6xl animate-spin" />
    </div>
  );
};

export default Spinner;
