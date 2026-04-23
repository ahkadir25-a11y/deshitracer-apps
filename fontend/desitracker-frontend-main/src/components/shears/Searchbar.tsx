import { useState } from "react";
// import OutsideClick from "./OutsideClick";

const Searchbar = ({ onChange }: { onChange: (e: string) => void }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative space-y-2">
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Search Here..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Search"
        aria-describedby="search"
        aria-controls="search"
        aria-autocomplete="list"
        aria-live="polite"
        aria-activedescendant="search"
        aria-owns="search"
        aria-busy="false"
        aria-disabled="false"
        className={`flex gap-x-2 items-center font-poppins text-sm border ring-0 focus:outline-none border-gray-300 bg-white px-4 py-2 rounded whitespace-nowrap ${
          isVisible ? "border-[#017BFE]" : ""
        }`}
        onFocus={() => setIsVisible(true)}
        onChange={(e) => {
          onChange(e.target.value);
          // setIsVisible(true);
        }}
      />

      {/* {isVisible && (
        <OutsideClick
          onOutsideClick={() => setIsVisible(false)}
          className="absolute w-full bg-white rounded shadow p-4  border border-[#FFFFFF] overflow-auto max-h-96"
        >
          <p className="overflow-y-auto h-full w-full font-poppins">
            No search found 🐸
          </p>
        </OutsideClick>
      )} */}
    </div>
  );
};

export default Searchbar;
