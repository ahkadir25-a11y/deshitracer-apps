/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { IoCaretDownOutline } from "react-icons/io5";
import { BiSolidError } from "react-icons/bi";
interface Country {
  name: string;
  city: string[];
}

const CountryAndCityDropDown = ({
  selectedCountry,
  setSelectedCountry,
  setSelectedCity,
  selectedCity,
  className,
  countryName,
}: any) => {
  const [countries, setCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCity, setIsOpenCity] = useState(false);
  const [isSelectedCountry, setIsSelectedCountry] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermCity, setSearchTermCity] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownRefCity = useRef<HTMLDivElement>(null);

  const filteredCountry = countries?.filter((countrie: Country) =>
    countrie?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCity = selectedCountry?.city?.filter((city: string) =>
    city?.toLowerCase().includes(searchTermCity.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRefCity.current &&
        !dropdownRefCity.current.contains(event.target as Node)
      ) {
        setIsOpenCity(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetch("/country.json")
      .then((response) => response.json())
      .then((data) => {
        setCountries(data);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    if (countryName && countries.length > 0) {
      const findCountry = countries.find(
        (item: Country) => item?.name === countryName
      );
      setSelectedCountry(findCountry || null);
    }
  }, [countryName, countries]);
  return (
    <div className={`${className}`}>
      {/* Country */}
      <div className={`relative space-y-2  `} ref={dropdownRef}>
        <label className="block text-xs md:text-sm xl:text-[15px] font-normal font-poppins text-black">
          Country
        </label>
        <button
          type="button"
          className={`w-full border cursor-pointer shadow flex justify-between items-center bg-white px-3 py-2 focus:bg-white focus:outline-none  focus:ring-2 focus:ring-[#52A5FE] hover:ring-[#52A5FE] rounded text-xs md:text-sm xl:text-sm font-normal font-poppins border-[#DEE4E8] outline-none transition-colors duration-300 focus!ring-2  ring-[#52A5FE]${
            isOpen && " "
          } cursor-pointer duration-200`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <p
            className={`text-sm  font-poppins px-1 ${
              !selectedCountry?.name ? "text-[#8198A8]" : ""
            }`}
          >
            {selectedCountry?.name || "Select a Country"}
          </p>
          <IoCaretDownOutline
            className={`  font-poppins px-1 text-2xl ${
              !selectedCountry?.name ? "text-[#8198A8]" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
            <div className="p-2">
              <input
                type="search"
                className="w-full !bg-white focus:bg-white focus:!outline-none focus:ring-0 !rounded text-xs md:text-sm xl:text-sm font-normal font-poppins !border-[#DEE4E8] outline-none transition-colors duration-300"
                placeholder="Search your country"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ul className=" max-h-52 overflow-y-auto px-2 space-y-1 pb-2">
              {filteredCountry?.map((country: Country, idx) => {
                return (
                  <li
                    key={idx}
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsOpen(false);
                      setSelectedCity("");
                      setSearchTerm("");
                    }}
                    className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer 
                      ${
                        selectedCountry?.name === country?.name
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                  >
                    <span className="text-sm font-poppins text-gray-500">
                      {country?.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      {/* --------------city */}
      <div className={`relative space-y-2  `} ref={dropdownRefCity}>
        {" "}
        <label className="block text-xs md:text-sm xl:text-[15px] font-normal font-poppins text-black">
          City
        </label>
        <button
          type="button"
          className={`w-full border cursor-pointer shadow flex justify-between items-center bg-white px-3 py-2.5 focus:bg-white focus:outline-none  focus:ring-2 focus:ring-[#52A5FE] hover:ring-[#52A5FE] rounded text-xs md:text-sm xl:text-sm font-normal font-poppins border-[#DEE4E8] outline-none transition-colors duration-300 focus!ring-2  ring-[#52A5FE]${
            isOpen && " y"
          } cursor-pointer duration-200`}
          onClick={() => {
            setIsOpenCity(!isOpenCity);
            if (!selectedCountry?.city) {
              setIsSelectedCountry(true);
            } else {
              setIsSelectedCountry(false);
            }
          }}
        >
          <p
            className={`text-sm  font-poppins px-1 ${
              !selectedCity ? "text-[#8198A8]" : ""
            }`}
          >
            {selectedCity ? selectedCity : "Select a city"}
          </p>
          <IoCaretDownOutline
            className={`  font-poppins px-1l ${
              !selectedCity ? "text-[#8198A8]" : ""
            }`}
          />
        </button>
        <label htmlFor="">
          {isSelectedCountry && (
            <div className="flex items-center !text-red-500 text-sm">
              <BiSolidError className="mr-2" />
              <span>Please select you country</span>
            </div>
          )}
        </label>
        {selectedCountry && selectedCountry?.city && isOpenCity && (
          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
            <div className="p-2">
              <input
                type="search"
                className="w-full !bg-white focus:bg-white focus:!outline-none focus:ring-0 !rounded text-xs md:text-sm xl:text-sm font-normal font-poppins !border-[#DEE4E8] outline-none transition-colors duration-300"
                placeholder="Search your country"
                value={searchTermCity}
                onChange={(e) => setSearchTermCity(e.target.value)}
              />
            </div>
            <ul className=" max-h-52 overflow-y-auto px-2 space-y-1 pb-2">
              {filteredCity?.map((city: string, idx: number) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSelectedCity(city);
                    setIsOpenCity(false);
                  }}
                  className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer hover:bg-gray-100
             ${selectedCity === city ? "bg-blue-100" : "hover:bg-gray-100"}
                    `}
                >
                  <span className="text-sm font-poppins text-gray-500">
                    {city}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryAndCityDropDown;
