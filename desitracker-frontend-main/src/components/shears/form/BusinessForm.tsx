// eslint-disable-next-line @typescript-eslint/no-explicit-any
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form"; // Assuming you're using react-hook-form
import { ImSpinner8 } from "react-icons/im";
import InputField from "./InputField";
import { Dropdown } from "../drop-Down/Dropdown";
import FormTitle from "./FormTitle";
import FormToggleButton from "./FormToggleButton";
import FilesUpload from "../file-upload/FilesUpload";
import { useUploadImagesMutation } from "@/app/redux/services/upload-images.service";
import axios from "axios";
import { useCreateBusinessMutation } from "@/app/redux/services/business.services";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import SingleFileUpload from "../file-upload/SingleFileUpload";
import { TCategory } from "@/components/admin-components/categories/category.types";
import { getCookie, getCurrentUser } from "@/app/utils/cookie";
import { TSubCategory } from "@/components/admin-components/sub-categories/sub-categories.typers";
import { DropdownItem } from "../shears-typers";
import { languagesArray } from "../languages";
import { AnimatePresence, motion } from 'framer-motion';
import TermsAndConditions from "./TermsAndConditions";
import LocationForm from "./LocationForm";
import CategorySubCategoryDropDown from "../drop-Down/Category&SubCategoryDropDown";
import { useAppSelector } from "@/app/redux/hoook";
import { businessCategory, businessSubTypes, businessTypes } from "../utils/allowedBooking";
import PhoneInput from "react-phone-number-input"; // Import react-phone-number-input
import "react-phone-number-input/style.css";  // Import styles for the phone input component

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface OpeningHour {
  day: string;
  isOpen: boolean;
  start: string;
  end: string;
  showStartDropdown?: boolean;
  showEndDropdown?: boolean;
}
const paymentOptions = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Google Pay',
  'Apple Pay',
  'Samsung Pay',
  'Cash',
  'Bank Transfer',
  'Stripe',
];

const BusinessForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [hours, setHours] = useState<OpeningHour[]>(daysOfWeek.map((day) => ({
    day,
    isOpen: false,
    start: "",
    end: "",
  }))
  );



  const handleToggle = (day: string) => {
    setHours((prev) =>
      prev.map((entry) =>
        entry.day === day ? { ...entry, isOpen: !entry.isOpen } : entry
      )
    );
  };

  const handleTimeChange = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setHours((prev) =>
      prev.map((entry) => {
        if (entry.day === day) {
          const updatedEntry = { ...entry, [field]: value };
          updatedEntry.showStartDropdown = false;
          updatedEntry.showEndDropdown = false;

          if (updatedEntry.isOpen && updatedEntry.start && updatedEntry.end) {
            if (updatedEntry.start === updatedEntry.end) {
              // toast.error(`${day}: Start and End time cannot be the same.`);
              setHasInvalidHours(true);
            } else {
              setHasInvalidHours(false);
            }
          }

          return updatedEntry;
        }
        return entry;
      })
    );
  };

  const timeOptions = Array.from({ length: 49 }, (_, i) => {  // Update the length to 49 to include "24:00"
    const hours = String(Math.floor(i / 2)).padStart(2, "0");
    const minutes = i % 2 === 0 ? "00" : "30";
    // Include "24:00" as a valid time
    if (hours === "24") {
      return "24:00"; // This will represent midnight as "24:00"
    }
    return `${hours}:${minutes}`;
  });



  const [categorieId, setcategorieId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<TCategory | undefined>(undefined);
  const [SubCategorieId, setSubCategorieId] = useState<string | undefined>();
  const [languages, setLanguages] = useState<DropdownItem | null>();
  const [secondLanguage, setsecondLanguage] = useState<DropdownItem | null>();
  const [offerSpecialDiscount, setOfferSpecialDiscount] = useState<boolean>(false);
  const [isWheelChairAccessible, setIsWheelChairAccessible] = useState<boolean>(false);
  const [agreeToTermsConditions, setAgreeToTermsConditions] = useState<boolean>(false);
  const router = useRouter();
  const [isHalal, setIsHalal] = useState<boolean>(false);
  const [provideHomeDelivery, setProvideHomeDelivery] = useState<boolean>(false);
  const [provideOnlineService, setProvideHomeService] = useState<boolean>(false);
  const [offerInStorePickup, setOfferInStorePickup] = useState<boolean>(false);
  const [isParkingAvailable, setIsParkingAvailable] = useState<boolean>(false);
  const [offerOnlineBooking, setOfferOnlineBooking] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<TSubCategory | null>(null);
  const [selectedType, setSelectedType] = useState("");  // New state for type selection
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(''); // Handle phone number

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [media, setMedia] = useState<{
    images: { url: string; description: string }[];
    thumbnail: { url: string; description: string }[]; // ✅ new
    videos: { url: string; description: string }[];
  }>({
    images: [],
    thumbnail: [], // ✅ new
    videos: [],
  });
  const [logoUrl, setLogoUrl] = useState("");
  const [user, setUser] = useState<{ email?: string; phone?: string; _id: string, id: string } | null>(null);
  const [hasInvalidHours, setHasInvalidHours] = useState(false);

  const [logoUploadLoading, setLogoUploadLoading] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [location, setLocation] = useState<{
    // branchName: string;
    address: string;
    postCode: string;
    exactBusinessLocation?: string;
    city: string;
    state: string;
    homeTown?: string;
    country: string;
    isMultipleLocation: boolean;
    branches: {
      branchName: string;
      address: string;
      postCode: string;
      city: string;
      state: string;
      country: string;
    }[];
  }>({
    // branchName: "",
    address: "",
    postCode: "",
    city: "",
    homeTown: "",
    exactBusinessLocation: "",
    state: "",
    country: "",
    isMultipleLocation: false,
    branches: [],
  });
  const [uploadImages] = useUploadImagesMutation();
  const [createBusiness, { isSuccess }] = useCreateBusinessMutation();
  const { user: userData } = useAppSelector(
    (state: { auth: { user: { id: string } | null } }) => state.auth
  );


  const handleUpload = async (id: string, files: File[]) => {
    const formData = new FormData();
    const maxSize = 15 * 1024 * 1024;
    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} exceeds the maximum size of 15MB.`);
        return;
      }
      formData.append("file", file);
    });
    try {
      if (id === "logo") setLogoUploadLoading(true);
      else if (id === "images") setImageUploadLoading(true);
      else if (id === "videos") setVideoUploadLoading(true);

      const response = await uploadImages({ formData, name: id }).unwrap();
      type UploadedFile = { url: string; description: string };

      const uploadedFiles: UploadedFile[] = response?.data?.map((file: any) => ({
        url: file,
        description: id === "images" ? "imageDescription" : "videoDescription",
      }));

      setMedia((prevMedia) => {
        let nextMedia = { ...prevMedia };
        if (id === "images") {
          nextMedia = { ...nextMedia, images: [...nextMedia.images, ...uploadedFiles] };
          nextMedia = applyThumbnailRules(nextMedia); // ✅ enforce thumbnail
        } else if (id === "videos") {
          nextMedia = { ...nextMedia, videos: [...nextMedia.videos, ...uploadedFiles] };
        }
        return nextMedia;
      });

      if (id === "logo") setLogoUrl(response?.data[0]);

      if (id === "logo") setLogoUploadLoading(false);
      else if (id === "images") setImageUploadLoading(false);
      else if (id === "videos") setVideoUploadLoading(false);
    } catch (error) {
      console.log(error)
      if (id === "logo") setLogoUploadLoading(false);
      else if (id === "images") setImageUploadLoading(false);
      else if (id === "videos") setVideoUploadLoading(false);
    }
  };

  // Keeps thumbnail valid and auto-selects the first image if needed
  const applyThumbnailRules = (nextMedia: typeof media) => {
    const firstImage = nextMedia.images?.[0];
    const currentThumbUrl = nextMedia.thumbnail?.[0]?.url;

    // No images → clear thumbnail
    if (!nextMedia.images || nextMedia.images.length === 0) {
      return { ...nextMedia, thumbnail: [] };
    }

    // If there is a thumbnail, ensure it still exists
    const thumbStillExists = currentThumbUrl
      ? nextMedia.images.some(img => img.url === currentThumbUrl)
      : false;

    if (currentThumbUrl && !thumbStillExists) {
      return { ...nextMedia, thumbnail: firstImage ? [firstImage] : [] };
    }

    // If no thumbnail yet, set first
    if (!currentThumbUrl && firstImage) {
      return { ...nextMedia, thumbnail: [firstImage] };
    }

    return nextMedia;
  };
  // Use this wrapper when FilesUpload replaces/removes media
  const handleMediaReplace = (nextMedia: typeof media) => {
    setMedia(applyThumbnailRules(nextMedia));
  };
  const onSubmit = async (data: any) => {
    setIsSubmitting(true); // Start loading
    try {
      if (!data.businessName?.trim()) {
        toast.error("Business name is required.");
        setIsSubmitting(false);
        return;
      }

      if (!categorieId) {
        toast.error("Category is required.");
        setIsSubmitting(false);
        return;
      }

      if (!SubCategorieId) {
        toast.error("Subcategory is required.");
        setIsSubmitting(false);
        return;
      }

      if (!selectedOptions || selectedOptions.length === 0) {
        toast.error("At least one payment method must be selected.");
        setIsSubmitting(false);
        return;
      }


      // Validate location fields
      if (!location?.address?.trim()) {
        toast.error("Address is required.");
        setIsSubmitting(false);
        return;
      }



      if (!location?.country?.trim()) {
        toast.error("Country is required.");
        setIsSubmitting(false);
        return;
      }

      // Validate official language
      if (!languages?.label?.trim()) {
        toast.error("Official language is required.");
        setIsSubmitting(false);
        return;
      }

      // Validate opening hours (if isOpen is true, start and end are required)
      for (const hour of hours) {
        if (hour.isOpen) {
          if (!hour.start || !hour.end) {
            toast.error(`Please provide both start and end time for ${hour.day}.`);
            setIsSubmitting(false);
            return;
          }
          if (hour.start === hour.end) {
            toast.error(`${hour.day}: Start and End time cannot be the same.`);
            setIsSubmitting(false);
            return;
          }
        }
      }


      // Prepare the business object
      const business = {
        businessName: data.businessName,
        owner: user?._id || user?.id || userData?.id,
        category: categorieId,
        subCategory: SubCategorieId,
        selectedType: selectedType,
        description: data?.description,
        established: data?.established,
        about: data?.about,
        logo: logoUrl,
        openingHours: hours,
        contactDetails: {
          phoneNumber: user?.phone,
          email: user?.email,
          websiteUrl: data?.contactDetails?.websiteUrl,
          facebook: data?.contactDetails?.facebook,
          instagram: data?.contactDetails?.instagram,
          linkedin: data?.contactDetails?.linkedin,
          twitter: data?.contactDetails?.twitter,
        },
        locations: location,
        operationDetails: {
          businessHours: {
            start: data?.operationDetails?.businessHours?.start,
            end: data?.operationDetails?.businessHours?.end,
          },
          provideHomeDelivery: provideHomeDelivery,
          provideOnlineService: provideOnlineService,
          offerInStorePickup: offerInStorePickup,
          isParkingAvailable: isParkingAvailable,
          offerOnlineBooking: offerOnlineBooking,
          ...(offerOnlineBooking ? { whatsappNumber: phoneNumber } : {}),
          ...(data?.operationDetails ? { onlineBookingLink: data?.operationDetails.onlineBookingLink } : {}),
        },
        features: {
          officialLanguage: languages?.label,
          secondLanguage: secondLanguage?.label,
          offerSpecialDiscount: offerSpecialDiscount,
          isWheelChairAccessible: isWheelChairAccessible,
        },
        media: media,
        howToHearAboutDesiTracker: data.howToHearAboutDesiTracker,
        agreeToTermsConditions: agreeToTermsConditions,
        hasCustomerTestimonials: true,
        paymentMethods: selectedOptions,
        isHalal
      };

      // Call the API mutation
      await createBusiness(business).unwrap();
      router.push("/profile/my-busniess");
      toast.success("Business registered successfully!");
      setIsSubmitting(false);
    } catch (error: any) {
      console.log(error)
      toast.error(error?.data?.errorSources[0]?.message || "Failed to register business. Please try again.");
      setIsSubmitting(false); // Stop loading
    }
  };

  const accessToken = getCookie("desiTrackerToken");

  useEffect(() => {
    const fetchUser = async () => {
      if (!accessToken) return; // No access token, no need to continue

      try {
        const user = await getCurrentUser({ accessToken });
        if (user?.id) {
          try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_API}/users/${user.id}`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            const fetchedUser = response.data?.data ?? user;
            setUser(fetchedUser);
          } catch (err) {
            console.error("Error fetching user details:", err);
            setUser(user); // Fallback to user from getCurrentUser
          }
        } else {
          setUser(user); // Even if id is missing, set what we got
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // Optionally you could do something here, but we're not setting a fallback user
      }
    };

    fetchUser();
  }, [accessToken]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])


  const handleSelect = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option))
    } else {
      setSelectedOptions([...selectedOptions, option])
    }
    // **Do not close dropdown on selection!** (Leave it open)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="container mx-auto space-y-7 p-2 max-h-[60vh] overflow-y-auto"
    >
      <div >
        <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Business Information</h2>

        <div className="grid md:grid-cols-1 sm:grid-cols-1 gap-5">
          {[
            {
              name: "businessName",
              label: "Business Name",
              placeholder: "Your Business Name",
              type: "text",
              required: true,
            },
          ].map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.placeholder}
              control={control}
              required={field.required}
              type={
                field?.type as
                | "text"
                | "email"
                | "password"
                | "textarea"
                | "select"
                | "date"
                | undefined
              }
            />
          ))}

          <CategorySubCategoryDropDown
            label="Select Category & Subcategory"
            selectedCategory={selectedCategory}
            selectedSubCategory={selectedSubCategory}
            setSelectedCategory={setSelectedCategory}
            setSelectedId={setcategorieId} // ✅ correct
            setSelectedSubCategory={setSelectedSubCategory}
            setSubSelectedId={setSubCategorieId} // ✅ correct
            parentCategory={selectedCategory}
            required={true}
            className="block text-sm font-medium text-gray-800 mb-1"
            setSelectedType={setSelectedType} // New prop for type selection
            selectedType={selectedType} // New prop for type selection
          />


          {[
            {
              name: "description",
              label: "Description (Optional)",
              placeholder: "Enter a brief description",
              type: "textarea",
            },
          ].map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.placeholder}
              control={control}
              type={
                field?.type as
                | "text"
                | "email"
                | "password"
                | "textarea"
                | "select"
                | "date"
                | undefined
              }
            />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Social Media And Website</h2>
        <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-6">
          {[

            {
              name: "contactDetails.websiteUrl",
              label: "Website URL (Optional)",
              placeholder: "Enter your website URL",
              type: "text",
            },
            {
              name: "contactDetails.facebook",
              label: "Facebook (Optional)",
              placeholder: "Enter your Facebook profile URL",
              type: "text",
            },
            {
              name: "contactDetails.instagram",
              label: "Instagram (Optional)",
              placeholder: "Enter your Instagram profile URL",
              type: "text",
            },
            {
              name: "contactDetails.linkedin",
              label: "LinkedIn (Optional)",
              placeholder: "Enter your LinkedIn profile URL",
              type: "text",
            },
            {
              name: "contactDetails.twitter",
              label: "Twitter (Optional)",
              placeholder: "Enter your Twitter profile URL",
              type: "text",
            },
          ].map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              placeholder={field.placeholder}
              control={control}
              type={
                field?.type as
                | "text"
                | "email"
                | "password"
                | "textarea"
                | "select"
                | "date"
                | undefined
              }
              className="w-full bg-white border border-gray-200 px-3 py-2 text-sm font-poppins rounded-md focus:outline-none focus:border- focus:ring-1 focus:ring-blue-300 placeholder:text-gray-400 transition duration-200"
            />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Opening Hours</h2>
        {hours.map((entry) => (
          <div
            key={entry.day}
            className="flex flex-col !cursor-pointer md:flex-row items-start md:items-center gap-4 border border-gray-200 p-3 rounded-md"
          >
            <div className="flex-1 cursor-pointer font-medium">{entry.day}</div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggle(entry.day)}
                className={`relative  inline-flex !cursor-pointer h-6 w-11 items-center rounded-full transition-colors duration-300 ${entry.isOpen ? "bg-" : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block cursor-pointer h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${entry.isOpen ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
              <span>{entry.isOpen ? "Open" : "Closed"}</span>
            </div>

            {/* Time Inputs */}
            {entry.isOpen && (
              <div className="flex items-center gap-2">
                {/* Start Time Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="w-24 border cursor-pointer border-gray-300 px-2 py-1 rounded bg-white text-left"
                    onClick={() =>
                      setHours((prev) =>
                        prev.map((e) =>
                          e.day === entry.day
                            ? { ...e, showStartDropdown: !e.showStartDropdown }
                            : { ...e, showStartDropdown: false }
                        )
                      )
                    }
                  >
                    {entry.start || "Start"}
                  </button>
                  {entry.showStartDropdown && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded max-h-48 overflow-y-auto mt-1 w-24">
                      {timeOptions.map((time) => (
                        <li
                          key={time}
                          onClick={() =>
                            handleTimeChange(entry.day, "start", time)
                          }
                          className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                        >
                          {time}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <span>to</span>

                {/* End Time Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    className="w-24 border cursor-pointer border-gray-300 px-2 py-1 rounded bg-white text-left"
                    onClick={() =>
                      setHours((prev) =>
                        prev.map((e) =>
                          e.day === entry.day
                            ? { ...e, showEndDropdown: !e.showEndDropdown }
                            : { ...e, showEndDropdown: false }
                        )
                      )
                    }
                  >
                    {entry.end || "End"}
                  </button>
                  {entry.showEndDropdown && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded max-h-48 overflow-y-auto mt-1 w-24">
                      {timeOptions.map((time) => (
                        <li
                          key={time}
                          onClick={() =>
                            handleTimeChange(entry.day, "end", time)
                          }
                          className="px-2 py-1 hover:bg-blue-100 cursor-pointer text-sm"
                        >
                          {time}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}



          </div>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Operational Period</h2>

        <div className="grid sm:grid-cols-1 gap-5">
          {
            (selectedCategory?.name === "Food & Dining" || selectedCategory?.name === "Retail & Wholesale") && (
              <FormToggleButton
                booleanState={setIsHalal}
                label="Provide Halal Service"
              />
            )}
          {/* provideHomeDelivery */}
          <FormToggleButton
            booleanState={setProvideHomeDelivery}
            label="Provide Home Delivery"
          />
          {/* hasCustomerTestimonials */}
          <FormToggleButton
            booleanState={setProvideHomeService}
            label="Provide Online Service"
          />
          {
            provideOnlineService &&
            [
              {
                name: "operationDetails.onlineBookingLink",
                label: "Online Service",
                placeholder: "Online Service Link",
                type: "text",
              },
            ].map((field) => (
              <InputField
                key={field.name}
                label={field.label}
                name={field.name}
                placeholder={field.placeholder}
                control={control}
                type={
                  field?.type as
                  | "text"
                  | "email"
                  | "password"
                  | "textarea"
                  | "select"
                  | "date"
                  | undefined
                }
              />
            ))
          }
          {/* offerInStorePickup */}
          <FormToggleButton
            booleanState={setOfferInStorePickup}
            label="Offer In Store Pic-kup"
          />
          {/* isParkingAvailable */}
          <FormToggleButton
            booleanState={setIsParkingAvailable}
            label="Is Parking Available"
          />
          {/* offerOnlineBooking */}
          {
            // Only show the toggle if the selected subcategory is in businessTypes
            (businessTypes.includes(selectedSubCategory?.name || "") || businessCategory.includes(selectedCategory?.name || "") || businessSubTypes.includes(selectedType || "")) && (
              <FormToggleButton
                booleanState={setOfferOnlineBooking}
                label={selectedType === "Restaurant" ? "Enable Table Reservation" : "Enable Appoinment Book"}
              />
            )
          }

          {
            offerOnlineBooking && ((businessTypes.includes(selectedSubCategory?.name || "") || businessCategory.includes(selectedCategory?.name || "") || businessSubTypes.includes(selectedType || ""))) && (
              <>
                {
                  // If the selected subcategory is "Hospital" and the country is not Bangladesh, show an error or hide the booking form
                  selectedSubCategory?.name === "Hospital" && location.country !== "Bangladesh" ? (
                    <div className="text-red-500 mt-2"></div>
                  ) : (
                    // Proceed with the booking form fields for other categories or when Hospital is in Bangladesh
                    [
                      {
                        name: "operationDetails.whatsappNumber",
                        label: "Whatsapp number",
                        placeholder: "Enter number",
                        type: "text",
                      },
                    ].map((field) => (
                      <div key={field.name} className="mb-4">
                        <label className="block text-lg text-gray-700 mb-2">{field.label}</label>
                        {/* Phone Input */}
                        <PhoneInput
                          international
                          defaultCountry="US"  // Set the default country (US here, change based on your need)
                          value={phoneNumber}
                          onChange={setPhoneNumber}  // Update the phone number when user selects one
                          className="px-4 py-2 w-full border border-gray-300 rounded-md"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))
                  )
                }
              </>
            )
          }

          <FormToggleButton
            booleanState={setOfferSpecialDiscount}
            label="Offer Special Discount"
          />
          {/* isWheelChairAccessible */}

          <FormToggleButton
            booleanState={setIsWheelChairAccessible}
            label="Is Wheel Chair Accessible"
          />
        </div>
      </div>
      <div ref={dropdownRef} className="relative w-full">
        <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">
          Payment Methods
        </h2>

        <label className="block text-gray-600 mb-2 text-sm font-medium">
          Select Payment Methods:
        </label>

        <button
          type="button"
          onClick={() => setIsOpen(prev => !prev)}
          className="cursor-pointer w-full flex justify-between items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring- focus:border-transparent transition-all"
        >
          {selectedOptions.length > 0
            ? selectedOptions.join(', ')
            : '-- Select Payment Methods --'}
          <span className="ml-2">&#9662;</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg"
            >
              {paymentOptions.map(option => (
                <li
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`cursor-pointer px-4 py-2 hover:bg-blue-100 hover:text-blue-800 transition-colors ${selectedOptions.includes(option) ? 'bg-blue-100 text-blue-800' : ''
                    }`}
                >
                  {option}
                  {selectedOptions.includes(option) && (
                    <span className="ml-2 text-sm">&#10003;</span> // Checkmark
                  )}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>

        {selectedOptions.length > 0 && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Selected Payment Methods:
            </h3>
            <ul className="grid grid-cols-3 gap-2">
              {selectedOptions.map((opt, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between cursor-pointer px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800"
                >
                  <span>{opt}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOptions(selectedOptions.filter(item => item !== opt))
                    }
                    className="text-sm text-red-500 cursor-pointer hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
      <LocationForm setLocation={setLocation} location={location} hideMultiple={false} />
      <div>
        <FormTitle formTitle="Language" />
        <div className="grid md:grid-cols-1 sm:grid-cols-1 gap-5">
          <Dropdown
            items={languagesArray}
            placeholder="Select Language"
            label="Select First Language"
            required={true}
            onSelect={setLanguages}
            selectedItem={languages}
          />
          {
            location.country !== "Bangladesh" &&
            <Dropdown
              items={languagesArray}
              placeholder="Select Second Language"
              label="Second Languages Option  (Optional)"
              required={false}
              onSelect={setsecondLanguage}
              selectedItem={secondLanguage}
            />
          }

        </div>
      </div>
      <div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 sm:grid-cols-1 gap-10">
          <div className="xl:col-span-3 md:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Business Logo</h2>
            <Controller
              name="logo"
              control={control}
              render={() => (
                <SingleFileUpload
                  onChange={(file: File | undefined) =>
                    file && handleUpload("logo", [file])
                  }
                  imageUrl={logoUrl}
                  setImageUrl={setLogoUrl}
                  fileUploadLoading={logoUploadLoading}
                  name="logo"
                />
              )}
            />
            {errors.file && (
              <p className="text-sm text-red-500">Logo file is required.</p>
            )}
          </div>

          <div className="xl:col-span-3 md:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Gallery Images</h2>
            <Controller
              name="media.images"
              control={control}
              render={() => (
                <FilesUpload
                  id="image"
                  onChange={(files: File[]) => handleUpload("images", files)}
                  accept="image"
                  media={media}
                  setRemove={handleMediaReplace}
                  fileUploadLoading={imageUploadLoading}
                />
              )}
            />
            {errors.file && (
              <p className="text-sm text-red-500">
                At least one image is required.
              </p>
            )}
          </div>
          {media.images?.length > 0 && (
            <div className="mt-3 xl:col-span-3 md:col-span-2 space-y-5">
              <h3 className="text-sm font-medium text-gray-800 mb-2">Select Thumbnail</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {media.images.map((img) => {
                  const isSelected = media.thumbnail?.[0]?.url === img.url;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() =>
                        setMedia((prev) =>
                          applyThumbnailRules({
                            ...prev,
                            thumbnail: [img], // ✅ single selected thumbnail
                          })
                        )
                      }
                      className={`relative border rounded overflow-hidden focus:outline-none focus:ring-2 transition
              ${isSelected ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"}`}
                      title={img.description || "Thumbnail"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.description || "thumbnail candidate"}
                        className="w-full h-24 object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="xl:col-span-3 md:col-span-2 space-y-5">
            <h2 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">Video Upload</h2>

            {/* <Label label="Video Files" /> */}
            <Controller
              name="media.videos"
              control={control}
              render={() => (
                <FilesUpload
                  id="video"
                  onChange={(files: File[]) => handleUpload("videos", files)}
                  accept="video"
                  media={media}
                  setRemove={setMedia}
                  fileUploadLoading={videoUploadLoading}
                />
              )}
            />
            {errors.file && (
              <p className="text-sm text-red-500">
                At least one video is required.
              </p>
            )}
          </div>
        </div>
      </div>
      <TermsAndConditions accepted={agreeToTermsConditions} setAgreeToTermsConditions={setAgreeToTermsConditions} />
      <div className="mt-6 max-w-64 ml-auto">
        <button
          type="submit"
          disabled={isSubmitting || isSuccess || hasInvalidHours}
          className={`w-full flex cursor-pointer justify-center items-center gap-2 bg-[#222] rounded hover:bg-black text-white font-semibold py-2.5 transition ${isSubmitting || hasInvalidHours ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          {isSubmitting && <ImSpinner8 className="animate-spin" />}
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default BusinessForm;
