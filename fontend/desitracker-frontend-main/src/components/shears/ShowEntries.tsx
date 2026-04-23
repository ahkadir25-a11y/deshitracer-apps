"use client";
import { useState } from "react";
import OutsideClick from "./OutsideClick";

interface ShowEntriesProps {
  limit: number;
  onLimitChange: (limit: number) => void;
}

function ShowEntries({ limit, onLimitChange }: ShowEntriesProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleLimitChange = (newLimit: number) => {
    onLimitChange(newLimit);
    setIsVisible(false);
  };

  const handleCustomSubmit = () => {
    const value = parseInt(customValue);
    if (!isNaN(value) && value > 0) {
      handleLimitChange(value);
      setCustomValue("");
    }
  };

  return (
    <p className="flex gap-x-1 items-center text-sm font-poppins font-normal relative">
      Show
      <button
        type="button"
        className="border cursor-pointer border-gray-300 px-4 rounded font-poppins"
        onClick={() => setIsVisible(!isVisible)}
      >
        {limit}
      </button>
      entries
      {isVisible && (
        <OutsideClick
          onOutsideClick={() => setIsVisible(false)}
          className="absolute bottom-0 left-0 h-fit w-32 p-1 bg-white rounded shadow z-50"
        >
          <span className="">
            {[10, 20, 30, 50, 100].map((item) => (
              <button
                key={item}
                type="button"
                className={`text-left cursor-pointer font-poppins text-sm w-full hover:bg-base/5 py-1 px-2 rounded ${
                  limit === item ? "bg-base/5" : ""
                }`}
                onClick={() => handleLimitChange(item)}
              >
                {item}
              </button>
            ))}
            <div className="flex items-center justify-between gap-x-1 p-1">
              <input
                type="number"
                min="1"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="form-input w-16 !py-1"
                placeholder="0"
              />
              <button
                type="button"
                className="text-sm cursor-pointer px-2 py-1 bg-primary text-white rounded w-full"
                onClick={handleCustomSubmit}
              >
                Go
              </button>
            </div>
          </span>
        </OutsideClick>
      )}
    </p>
  );
}

export default ShowEntries;
