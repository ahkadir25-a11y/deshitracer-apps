/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useState, useEffect } from "react";
import Label from "./Label";
import FormTitle from "./FormTitle";
import CityDropDown from "../drop-Down/CityDropDown"; // City dropdown component
import CountryDropDown from "../drop-Down/CountryDropDown";
import DivisionDropdown from "../drop-Down/DivisionDropDown";
import DistrictDropdown from "../drop-Down/DistrictDropdown";
import ThanaDropdown from "../drop-Down/ThanaDropdown";
import { countries } from "../utils/countries";

type Branch = {
  branchName: string;
  address: string;
  postCode: string;
  city: string;
  state: string;
  country: string;
};


interface LocationFormProps {
  location: any;
  setLocation: any;
  hideMultiple: boolean;
  data?: {
    data: {
      locations: any;
    };
  };
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  setLocation,
  hideMultiple,
  data,
}) => {
  const [countryData, setCountryData] = useState<any>(null);
  const [bangladeshDivisionsData, setBangladeshDivisionsData] = useState<any>(null);
  console.log(countryData)
  // Fetch the updated JSON file for country data
  useEffect(() => {
    const fetchCountryData = async () => {
      try {
        const response = await fetch("/country.json");
        const data = await response.json();
        setCountryData(data);  // Assuming the JSON has all country data
      } catch (error) {
        console.error("Error loading country data:", error);
      }
    };
    fetchCountryData();
  }, []);

  // Fetch Bangladesh-specific divisions data
  useEffect(() => {
    if (location.country === "Bangladesh") {
      const fetchBangladeshDivisionsData = async () => {
        try {
          const response = await fetch("/bangladeshDivisions.json");
          const data = await response.json();
          setBangladeshDivisionsData(data); // Set Bangladesh divisions data
        } catch (error) {
          console.error("Error loading Bangladesh divisions data:", error);
        }
      };
      fetchBangladeshDivisionsData();
    }
  }, [location.country]);  // Runs only when the country changes to Bangladesh

  // Handle division change
  const handleDivisionChange = (selectedDivision: string) => {
    setLocation((prevLocation: any) => ({
      ...prevLocation,
      division: selectedDivision,
      district: "",  // Reset district and thana when division changes
      thana: "",
    }));
  };

  // Handle district change
  const handleDistrictChange = (selectedDistrict: string) => {
    setLocation((prevLocation: any) => ({
      ...prevLocation,
      district: selectedDistrict,
      thana: "",  // Reset thana when district changes
    }));
  };

  // Handle thana change
  const handleThanaChange = (selectedThana: string) => {
    setLocation((prevLocation: any) => ({
      ...prevLocation,
      thana: selectedThana,
    }));
  };

  // Handle city change (for non-Bangladesh countries)
  const handleCityChange = (selectedCity: string) => {
    setLocation((prevLocation: any) => ({
      ...prevLocation,
      city: selectedCity,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    branchIndex: number | null = null
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    const updatedLocation = { ...location };

    if (branchIndex !== null) {
      if (!updatedLocation.branches) updatedLocation.branches = [];
      updatedLocation.branches[branchIndex] = {
        ...updatedLocation.branches[branchIndex],
        [name]: value,
      };
    } else {
      if (type === "checkbox") {
        updatedLocation[name] = checked;
      } else {
        updatedLocation[name] = value;
      }
    }

    setLocation(updatedLocation);
  };
  // Add a new branch safely
  const handleAddBranch = () => {
    const updatedLocation = { ...location };

    if (!Array.isArray(updatedLocation.branches)) {
      updatedLocation.branches = [];
    }

    updatedLocation.branches.push({
      branchName: "",
      address: "",
      postCode: "",
      city: "",
      state: "",
      country: "United Kingdom",
    });

    setLocation(updatedLocation); // This must cause a re-render
  };


  const handleRemoveBranch = (branchIndex: number) => {
    const updatedLocation = { ...location };

    // Deep clone branches safely
    updatedLocation.branches = [...(updatedLocation.branches || [])];

    updatedLocation.branches.splice(branchIndex, 1);
    setLocation(updatedLocation);
  };


  useEffect(() => {
    if (data?.data?.locations) {
      const incoming = data.data.locations;
      if (!incoming.branches) incoming.branches = [];
      if (typeof incoming.isMultipleLocation !== "boolean") {
        incoming.isMultipleLocation = false;
      }
      setLocation(structuredClone(incoming));
    }
  }, [data?.data?.locations]);

  return (
    <div>
      <FormTitle formTitle="Location Details" />
      <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
        {/* Address Input */}
        <div>
          <Label label="Address" require />
          <input
            type="text"
            name="address"
            placeholder="Enter address"
            value={location.address || ""}
            onChange={(e) => setLocation({ ...location, address: e.target.value })}
            className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
          />
        </div>

        {/* Country dropdown */}
        <div>
          <Label label="Country" require />
          <CountryDropDown
            selectedCountry={location.country}
            setSelectedCountry={(country: any) => setLocation({ ...location, country })}
          />
        </div>

        {/* Post Code field for non-Bangladesh countries */}
        {location.country !== "Bangladesh" && (
          <div>
            <Label label="Post Code" require />
            <input
              type="text"
              name="postCode"
              placeholder="Enter post code"
              value={location.postCode || ""}
              onChange={(e) => setLocation({ ...location, postCode: e.target.value })}
              className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
            />
          </div>
        )}

        {/* Bangladesh-specific fields */}
        {location.country === "Bangladesh" && bangladeshDivisionsData && (
          <>
            <div>
              <Label label="Division" require />
              <DivisionDropdown
                countryData={bangladeshDivisionsData}
                selectedDivision={location.division}
                setSelectedDivision={handleDivisionChange}
              />
            </div>

            <div>
              <Label label="District" require />
              <DistrictDropdown
                countryData={bangladeshDivisionsData}
                selectedDivision={location.division}
                selectedDistrict={location.district}
                setSelectedDistrict={handleDistrictChange}
              />
            </div>

            <div>
              <Label label="Thana" require />
              <ThanaDropdown
                countryData={bangladeshDivisionsData}
                selectedDivision={location.division}
                selectedDistrict={location.district}
                selectedThana={location.thana}
                setSelectedThana={handleThanaChange}
              />
            </div>

            <div>
              <Label label="Home Town Address" require />
              <input
                type="text"
                name="homeTown"
                placeholder="Enter home town address"
                value={location.homeTown || ""}
                onChange={(e) => setLocation({ ...location, homeTown: e.target.value })}
                className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
              />
            </div>
            <div>
              <Label label="Exact Business Location" require />
              <input
                type="text"
                name="exactBusinessLocation"
                placeholder="Enter exact business location"
                value={location.exactBusinessLocation || ""}
                onChange={(e) => setLocation({ ...location, exactBusinessLocation: e.target.value })}
                className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
              />
            </div>

          </>
        )}

        {/* City Dropdown for non-Bangladesh countries */}
        {location.country !== "Bangladesh" && (
          <div>
            <Label label="City" require />
            <CityDropDown
              selectedCity={location.city}
              setSelectedCity={handleCityChange}
              countryName={location.country}
              setFilters={setLocation}
            />
          </div>

        )}
        {
          location.country !== "Bangladesh" &&
          <div className="flex items-center mt-1">
            <input
              type="checkbox"
              name="isMultipleLocation"
              checked={!!location.isMultipleLocation}
              onChange={handleChange}
              className="mr-2"
            />
            <label className="text-sm text-gray-700 cursor-pointer">Multiple Locations?</label>
          </div>
        }


        {location.country !== "Bangladesh" && location.isMultipleLocation && (
          <button
            type="button"
            onClick={handleAddBranch}
            className="text-[#222] border p-2 text-sm font-medium hover:underline"
          >
            + Add Sub Branch
          </button>
        )}
      </div>
      {location.country !== "Bangladesh" && location.isMultipleLocation && location.branches.length > 0 && !hideMultiple && (
        <div className="mt-8 space-y-6">
          <h4 className="text-lg font-semibold text-gray-800">Branches</h4>
          {location.branches.map((branch: Branch, index: number) => (
            <div key={index} className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 border-t pt-6">
              {[
                { name: "branchName", label: "Sub Branch Name", placeholder: "Enter branch name" },
                { name: "address", label: "Address", placeholder: "Enter address" },
                { name: "postCode", label: "Post Code", placeholder: "Enter post code" },
                { name: "city", label: "City", placeholder: "Enter city" },
                { name: "state", label: "State", placeholder: "Enter state" },
                { name: "country", label: "Country", placeholder: "Enter country" },
              ].map((field) =>
                field.name === "country" ? (
                  <div key={field.name}>
                    <Label label={field.label} />
                    <select
                      name="country"
                      value={branch.country}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div key={field.name}>
                    <Label label={field.label} />
                    <input
                      type="text"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={branch[field.name as keyof Branch] || ""}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full bg-white border border-gray-200 px-3 py-2 focus:border- focus:ring-1 focus:ring-blue-300 text-sm font-poppins rounded-md"
                    />
                  </div>
                )
              )}

              <div className="col-span-full">
                <button
                  type="button"
                  className="text-red-500 border p-2 text-sm hover:underline"
                  onClick={() => handleRemoveBranch(index)}
                >
                  Remove Branch
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationForm;
