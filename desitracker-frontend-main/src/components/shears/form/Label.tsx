import React from "react";

const Label = ({ label, require }: { label: string, require?: boolean }) => {
  return (
    <label
      className="block mb- pb-2 text-xs md:text-sm xl:text-[15px] font-normal  font-poppins text-black"
      htmlFor={label}
    >
      {label}
      {require && <span className="text-red-500 ">*</span>}
    </label>
  );
};

export default Label;
