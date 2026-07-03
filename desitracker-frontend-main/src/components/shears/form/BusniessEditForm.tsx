/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import FormToggleButton from "./FormToggleButton";
import FormTitle from "./FormTitle";
import FilesUpload from "../file-upload/FilesUpload";
import { Controller, useForm } from "react-hook-form";
import Label from "./Label";
import InputField from "./InputField";
import { Dropdown } from "../drop-Down/Dropdown";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/app/redux/hoook";
import { useUploadImagesMutation } from "@/app/redux/services/upload-images.service";
import {
  useGetBusinessQuery,
  useUpdateBusinessMutation,
} from "@/app/redux/services/business.services";
import toast from "react-hot-toast";
import CategoryDropdown from "../drop-Down/CategoryDropdown";
import SingleSubCategoryDropdown from "../drop-Down/SingleSubCategoryDropdown";
import LocationForm from "./LocationForm";
import ProfileHeader from "../dashboard/profile-layout/ProfileHeader";
import Spinner from "../spiner/Spiner";
import { IoArrowBackSharp } from "react-icons/io5";
import SingleFileUpload from "../file-upload/SingleFileUpload";
import { TCategory } from "@/components/admin-components/categories/category.types";
import { TSubCategory } from "@/components/admin-components/sub-categories/sub-categories.typers";
import { languagesArray } from "../languages";
import { AnimatePresence, motion } from 'framer-motion';
import { businessCategory, businessSubTypes, businessTypes } from "../utils/allowedBooking";
import PhoneInput from "react-phone-number-input"; // Import react-phone-number-input
import "react-phone-number-input/style.css";  // Import styles for the phone input component

export interface DropdownItem {
  id: string | number;
  label: string;
}

const foodOptions: DropdownItem[] = [
  { id: 1, label: "Halal" },
  { id: 2, label: "Kosher" },
  { id: 3, label: "Vegan" },
];
const acceptedPaymentMethod: DropdownItem[] = [
  { id: 1, label: "Cash" },
  { id: 2, label: "Card" },
  { id: 3, label: "PayPal" },
  { id: 3, label: "Apple Pay" },
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
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

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hours = String(Math.floor(i / 2)).padStart(2, "0");
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});

interface OpeningHour {
  day: string;
  isOpen: boolean;
  start: string;
  end: string;
  showStartDropdown?: boolean;
  showEndDropdown?: boolean;
}
const BusniessEditForm = ({ slug }: { slug: string }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [location, setLocation] = useState<{
    address: string;
    division: string;
    district: string;
    thana: string;
    homeTown?: string;
    exactBusinessLocation?: string;
    postCode: string;
    city: string;
    state: string;
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
    lat: number;
    long: number;
  }>({
    address: "",
    division: "",
    district: "",
    thana: "",
    exactBusinessLocation: '',
    homeTown: "",
    postCode: "",
    city: "",
    state: "",
    country: "",
    isMultipleLocation: false,
    branches: [],
    lat: 0,
    long: 0,
  });
  const [categorieId, setcategorieId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] =
    useState<TSubCategory | null>(null);
  const [secondLanguage, setsecondLanguage] = useState<DropdownItem | null>();
  const [hasInvalidHours, setHasInvalidHours] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [menuLink, setMenuLink] = useState<string | undefined>(''); // Handle phone number
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(''); // Handle phone number

  const [languages, setLanguages] = useState<DropdownItem | null>();
  const [SubCategorieId, setSubCategorieId] = useState<string | undefined>();
  const [foodOption, setFoodOption] = useState<DropdownItem | null>();
  const [paymentMethod, setPaymentMethod] = useState<DropdownItem | null>();
  const [offerSpecialDiscount, setOfferSpecialDiscount] =
    useState<boolean>(false);
  const [isWheelChairAccessible, setIsWheelChairAccessible] =
    useState<boolean>(false);
  const [agreeToTermsConditions, setAgreeToTermsConditions] =
    useState<boolean>(false);
  const [hasCustomerTestimonials, setHasCustomerTestimonials] =
    useState<boolean>(false);
  const router = useRouter();
  // operationDetails
  const [provideHomeDelivery, setProvideHomeDelivery] =
    useState<boolean>(false);
  const [isHalal, setIsHalal] = useState<boolean>(false);
  const [provideOnlineService, setProvideHomeService] =
    useState<boolean>(false);
  const [offerInStorePickup, setOfferInStorePickup] = useState<boolean>(false);
  const [isParkingAvailable, setIsParkingAvailable] = useState<boolean>(false);
  const [offerOnlineBooking, setOfferOnlineBooking] = useState<boolean>(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");  // New state for type selection

  // State to hold media data
  const [media, setMedia] = useState<{
    images: { url: string; description: string }[];
    thumbnail: { url: string; description: string }[];
    videos: { url: string; description: string }[];
  }>({
    images: [],
    thumbnail: [],
    videos: [],
  });
  const [logoDescription, setLogoDescription] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [hours, setHours] = useState<OpeningHour[]>(daysOfWeek.map((day) => ({
    day,
    isOpen: false,
    start: "",
    end: "",
  }))
  );
  // console.log(logoDescription)
  const handleToggle = (day: string) => {
    setHours((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? {
            ...entry,
            isOpen: !entry.isOpen,
            start: entry.isOpen ? '' : entry.start, // Clear when turning off
            end: entry.isOpen ? '' : entry.end,
            showStartDropdown: false,
            showEndDropdown: false,
          }
          : entry
      )
    );
  };

  const applyThumbnailRules = (nextMedia: typeof media) => {
    const firstImage = nextMedia.images?.[0];
    const currentThumbUrl = nextMedia.thumbnail?.[0]?.url;

    // If there are no images, clear thumbnail
    if (!nextMedia.images || nextMedia.images.length === 0) {
      return { ...nextMedia, thumbnail: [] };
    }

    // If there is a thumbnail but it no longer exists in images, reset to first
    const thumbStillExists = currentThumbUrl
      ? nextMedia.images.some(img => img.url === currentThumbUrl)
      : false;

    if (currentThumbUrl && !thumbStillExists) {
      return { ...nextMedia, thumbnail: firstImage ? [firstImage] : [] };
    }

    // If there is no thumbnail yet, auto-select the first image
    if (!currentThumbUrl && firstImage) {
      return { ...nextMedia, thumbnail: [firstImage] };
    }

    return nextMedia;
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


  // Get the mutation hook from the API
  const { user } = useAppSelector(
    (state: { auth: { user: { id: string } | null } }) => state.auth
  );
  const { data, isLoading } = useGetBusinessQuery(slug);
  const [uploadImages, { isLoading: fileUploadLoading }] =
    useUploadImagesMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const handleChange = (name: string) => {
    if (name === "logo") {
      setLogoDescription("");
    } else if (name === "media.video.description") {
      setVideoDescription("");
    } else {
      setImageDescription("");
    }
  };
  const handleUpload = async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });
    try {
      const response = await uploadImages({ formData, name: id }).unwrap();
      const uploadedFiles = response?.data?.map((file: any) => ({
        url: file,
        description: id === "images" ? imageDescription : videoDescription,
      }));

      setMedia((prevMedia) => {
        let nextMedia = { ...prevMedia };
        if (id === "images") {
          nextMedia = { ...nextMedia, images: [...nextMedia.images, ...uploadedFiles] };
          nextMedia = applyThumbnailRules(nextMedia); // 🔸 ensure thumbnail
        } else if (id === "videos") {
          nextMedia = { ...nextMedia, videos: [...nextMedia.videos, ...uploadedFiles] };
        }
        return nextMedia;
      });

      if (id === "logo") {
        setLogoUrl(response?.data[0]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    }
  };
  const handleMediaReplace = (nextMedia: typeof media) => {
    setMedia(applyThumbnailRules(nextMedia));
  };
  const onSubmit = async (data: any) => {
    try {
      // Prepare the business object
      const business = {
        businessName: data.businessName,
        owner: user?.id as string,
        category: categorieId,
        subCategory: SubCategorieId,
        selectedType, // Include selectedType only if it's set
        description: data?.description,
        established: data?.established,
        about: data?.about,
        logo: logoUrl,
        contactDetails: {
          phoneNumber: data?.contactDetails?.phoneNumber,
          email: data?.contactDetails?.email,
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
          onlineBookingLink: data?.operationDetails.onlineBookingLink,
          whatsappNumber: phoneNumber,
          menuLink,
        },
        features: {
          officialLanguage: languages?.label,
          secondLanguage: secondLanguage?.label,
          acceptedPaymentMethod: paymentMethod?.label,
          offerSpecialDiscount: offerSpecialDiscount,
          isWheelChairAccessible: isWheelChairAccessible,
          foodOptions: foodOption?.label,
        },
        media: media,
        howToHearAboutDesiTracker: data.howToHearAboutDesiTracker,
        agreeToTermsConditions: agreeToTermsConditions,
        hasCustomerTestimonials: hasCustomerTestimonials,
        paymentMethods: selectedOptions,
        openingHours: hours,
        isHalal,

      };

      // Call the API mutation
      const response = await updateBusiness({
        slug,
        updatedBusinessData: business,
      }).unwrap();
      console.log("Business created successfully:", response);
      router.push("/profile/my-busniess");
      // Show success toast
      toast.success("Business registered successfully!");
    } catch (error: any) {
      console.error("Error creating business:", error);
      // Show error toast
      toast.error(
        error.data.errorSources
          ? error.data.errorSources[0].message
          : "Error creating business. Please try again."
      );
    }
  };
  const handleSelect = (option: string) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter(item => item !== option))
    } else {
      setSelectedOptions([...selectedOptions, option])
    }
    // **Do not close dropdown on selection!** (Leave it open)
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type); // Handle type selection (Takeway or Restaurant)
  };
  useEffect(() => {
    if (data) {
      reset({
        businessName: data?.data?.businessName,
        category: data?.data?.category,
        subCategory: data?.data?.subCategory,
        description: data?.data?.description,
        established: data?.data?.established,
        about: data?.data?.about,
        contactDetails: data?.data?.contactDetails,
        locations: data?.data?.locations,
        operationDetails: data?.data?.operationDetails,
        features: data?.data?.features,
        media: media,
        howToHearAboutDesiTracker: data?.data?.howToHearAboutDesiTracker,
        agreeToTermsConditions: data?.data?.agreeToTermsConditions,
        hasCustomerTestimonials: data?.data?.hasCustomerTestimonials,
      });
      setMedia((prev) => applyThumbnailRules(data?.data?.media || prev));
      setMenuLink(data?.data?.operationDetails?.menuLink)
      // Set the state for form fields that aren't directly bound to the form
      setSubCategorieId(data?.data?.subCategory);
      setFoodOption({
        id:
          foodOptions.find(
            (option) => option.label === data?.data?.features?.foodOptions
          )?.id ?? "",
        label: data?.data?.features?.foodOptions,
      });
      setPaymentMethod({
        id:
          acceptedPaymentMethod.find(
            (option) =>
              option.label === data?.data?.features?.acceptedPaymentMethod
          )?.id ?? "", // Default to an empty string if not found
        label: data?.data?.features?.acceptedPaymentMethod,
      });
      setLanguages({
        id:
          languagesArray.find(
            (option) => option.label == data?.data?.features?.officialLanguage
          )?.id ?? "",
        label: data?.data?.features?.officialLanguage,
      });
      setsecondLanguage({
        id:
          languagesArray.find(
            (option) => option.label == data?.data?.features?.secondLanguage
          )?.id ?? "",
        label: data?.data?.features?.secondLanguage,
      });
      setOfferSpecialDiscount(data?.data?.features?.offerSpecialDiscount);
      setIsWheelChairAccessible(data?.data?.features?.isWheelChairAccessible);
      setAgreeToTermsConditions(data.agreeToTermsConditions);
      setHasCustomerTestimonials(data.hasCustomerTestimonials);
      setProvideHomeDelivery(data?.data?.operationDetails?.provideHomeDelivery);
      setProvideHomeService(data?.data?.operationDetails?.provideOnlineService);
      setOfferInStorePickup(data?.data?.operationDetails?.offerInStorePickup);
      setIsParkingAvailable(data?.data?.operationDetails?.isParkingAvailable);
      setOfferOnlineBooking(data?.data?.operationDetails?.offerOnlineBooking);
      setPhoneNumber(data?.data?.operationDetails?.whatsappNumber)
      setLogoUrl(data?.data?.logo);
      setMedia(data?.data?.media);
      setSelectedType(data?.data?.selectedType || ""); // Set the selected type if available
      setHours(
        data?.data?.openingHours?.map((entry: any) => ({
          ...entry,
          isOpen: entry.start && entry.end ? true : false,
        }))
      );

      setSelectedOptions(data?.data?.paymentMethods)
      setcategorieId(data?.data?.category?._id)
    }
  }, [data]);

  useEffect(() => {
    if (data?.data?.category) {
      setSelectedCategory(data?.data?.category);
    }
    if (data?.data?.subCategory) {
      setSelectedSubCategory(data?.data?.subCategory);
    }
  }, [data]);

  useEffect(() => {
    setSelectedType("")
  }, [selectedCategory])
  if (isLoading) {
    return <Spinner />;
  }
  return (
    <div>
      <ProfileHeader>
        <div className="flex items-center gap-4">
          <IoArrowBackSharp
            onClick={() => router.back()}
            size={25}
            className="cursor-pointer"
          />

          <h1 className="text-2xl">{"Update Busniess"}</h1>
        </div>
      </ProfileHeader>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="container mx-auto space-y-7 mt-2 p-4"
      >
        {/* businessName */}
        <div className="">
          <FormTitle formTitle="Business Information" />
          <div className="grid grid-cols-1 gap-5">
            {[
              {
                name: "businessName",
                label: "Business Name",
                placeholder: "Your Business Name",
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
            ))}

            <CategoryDropdown
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setSelectedId={setcategorieId}
              label="Select category"
              className="block mb-2 text-xs md:text-sm xl:text-[15px] font-normal font-poppins text-black"
            />
            {selectedCategory?.name === "Food & Dining" && (
              <div >
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => handleTypeSelect(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-sm mt-2"
                >
                  <option value="">Select Type</option>
                  <option value="Takeway">Takeway</option>
                  <option value="Restaurant">Restaurant</option>
                </select>
              </div>
            )}
            <SingleSubCategoryDropdown
              setSelectedId={setSubCategorieId}
              hideLabel={true}
              setSelectedSubCategory={setSelectedSubCategory}
              selectedSubCategory={selectedSubCategory}
              selectedCategory={selectedCategory}
              className="block mb-2 text-xs md:text-sm xl:text-[15px] font-normal font-poppins text-black"
            />
            {[
              {
                name: "description",
                label: "Description",
                placeholder: "Enter a brief description",
                type: "textarea",
              }
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
        {/* contactDetails */}
        <div className="">
          <FormTitle formTitle="Social Media And Website" />
          <div className="grid md:grid-cols-2 xl:grid-cols-3 sm:grid-cols-1 gap-5">
            {[
              {
                name: "contactDetails.websiteUrl",
                label: "Website URL",
                placeholder: "Enter your website URL",
                type: "text",
              },
              {
                name: "contactDetails.facebook",
                label: "Facebook",
                placeholder: "Enter your Facebook profile URL",
                type: "text",
              },
              {
                name: "contactDetails.instagram",
                label: "Instagram",
                placeholder: "Enter your Instagram profile URL",
                type: "text",
              },
              {
                name: "contactDetails.linkedin",
                label: "LinkedIn",
                placeholder: "Enter your LinkedIn profile URL",
                type: "text",
              },
              {
                name: "contactDetails.twitter",
                label: "Twitter",
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
        {/* Operational Details*/}
        <div>
          <FormTitle formTitle="Operational Period" />

          <div className="grid grid-cols-1 gap-5">
            {
              (selectedCategory?.name === "Food & Dining" || selectedCategory?.name === "Retail & Wholesale") && (
                <FormToggleButton
                  toggleValue={data?.data?.isHalal}
                  booleanState={setIsHalal}
                  label="Provide Halal Service"
                />
              )}
            {/* Provide Online Service */}
            <FormToggleButton
              toggleValue={data?.data?.operationDetails?.provideOnlineService}
              booleanState={setProvideHomeService}
              label="Provide Online Service"
            />
            {
              provideOnlineService &&
              <>
                {[
                  {
                    name: "operationDetails.onlineBookingLink",
                    label: "Online Booking Link",
                    placeholder: "Online Booking Link",
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
                ))}</>
            }
            {/* provideHomeDelivery */}
            <FormToggleButton
              toggleValue={data?.data?.operationDetails?.provideHomeDelivery}
              booleanState={setProvideHomeDelivery}
              label="Provide Home Delivery"
            />

            {/* offerInStorePickup */}
            <FormToggleButton
              toggleValue={data?.data?.operationDetails?.offerInStorePickup}
              booleanState={setOfferInStorePickup}
              label="Offer In Store Pic-kup"
            />
            {/* isParkingAvailable */}
            <FormToggleButton
              toggleValue={data?.data?.operationDetails?.isParkingAvailable}
              booleanState={setIsParkingAvailable}
              label="Is Parking Available"
            />
            {/* offerOnlineBooking */}
            {
              (businessTypes.includes(selectedSubCategory?.name || "") || businessCategory.includes(selectedCategory?.name || "") || businessSubTypes.includes(selectedType || "")) && (
                <FormToggleButton
                  toggleValue={data?.data?.operationDetails?.offerOnlineBooking}
                  booleanState={setOfferOnlineBooking}
                  label={selectedType === "Restaurant" ? "Enable Table Reservation" : "Enable Appoinment Book"}
                />
              )
            }
            {
              offerOnlineBooking &&
              (
                (businessTypes.includes(selectedSubCategory?.name || "") || businessCategory.includes(selectedCategory?.name || "") || businessSubTypes.includes(selectedType || "")) &&
                [
                  {
                    name: "operationDetails.whatsappNumber",
                    label: "Whatsapp number",
                    placeholder: "Enter number",
                    type: "number",
                  },
                  {
                    name: "operationDetails.menuLink",
                    label: "Menu PDF Link",
                    placeholder: "Enter PDF link.",
                    type: "text",
                  },
                ].map((field) => {
                  if (field?.type === "number") {
                    return (
                      <div key={field.name} className="mb-4">
                        <label className="block text-lg text-gray-700 mb-2">{field.label}</label>
                        <PhoneInput
                          international
                          defaultCountry="US"  // Set the default country (US here, change based on your need)
                          value={phoneNumber}
                          onChange={setPhoneNumber}  // Update the phone number when user selects one
                          className="px-4 py-2 w-full border border-gray-300 rounded-md"
                          placeholder={field.placeholder}
                        />
                      </div>
                    );
                  } else if (field?.type === "text") {
                    return (
                      <div key={field.name} className="mb-4">
                        <label className="block text-lg text-gray-700 mb-2">{field.label}</label>
                        <input
                          value={menuLink}
                          onChange={(e) =>
                            setMenuLink(e.target.value)
                          }
                          type="text"
                          name={field.name}
                          className="px-4 py-2 w-full border border-gray-300 rounded-md"
                          placeholder={field.placeholder}
                        />
                      </div>
                    );
                  }
                })
              )
            }

            <FormToggleButton
              toggleValue={data?.data?.features?.offerSpecialDiscount}
              booleanState={setOfferSpecialDiscount}
              label="Offer Special Discount"
            />
            {/* isWheelChairAccessible */}

            <FormToggleButton
              toggleValue={data?.data?.features?.isWheelChairAccessible}
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
        <LocationForm setLocation={setLocation} location={location} hideMultiple={false} data={data} />
        <div>
          <FormTitle formTitle="Language" />
          <div className="grid md:grid-cols-1 sm:grid-cols-1 gap-5">
            <Dropdown
              items={languagesArray}
              placeholder="Select Language"
              label="Languages Options"
              required={true}
              onSelect={setLanguages}
              selectedItem={languages}
            />
            {
              location.country !== "Bangladesh" && (
                <Dropdown
                  items={languagesArray}
                  placeholder="Select Second Language"
                  label="Second Languages Options"
                  required={true}
                  onSelect={setsecondLanguage}
                  selectedItem={secondLanguage}
                />
              )
            }
          </div>
        </div>
        {/* features */}

        {/* media */}
        <div>
          <FormTitle formTitle="Media Option" />
          <div className="grid grid-cols-1 gap-5">
            <div className=" space-y-2 xl:col-span-3 md:col-span-2 col-span-1">
              <Label label="Logo" />
              <Controller
                name="logo"
                control={control}
                render={() => (
                  <SingleFileUpload
                    onChange={(file: File | undefined) =>
                      file && handleUpload("logo", [file])
                    } // Update form value with selected file
                    imageUrl={logoUrl}
                    setImageUrl={setLogoUrl}
                    fileUploadLoading={fileUploadLoading}
                  />
                )}
              />
              {errors.file && (
                <p style={{ color: "red" }}>Media file is required.</p>
              )}
            </div>
            <div className="space-y-2 xl:col-span-3 md:col-span-2 col-span-1">
              <Label label="Images" />
              <Controller
                name="media.images"
                control={control}
                render={() => (
                  <FilesUpload
                    id="image"
                    onChange={(files: File[]) => handleUpload("images", files)} // Update form value with selected files
                    accept="image"
                    media={media}
                    setRemove={handleMediaReplace}
                    fileUploadLoading={fileUploadLoading}
                  />
                )}
              />
              {errors.file && (
                <p style={{ color: "red" }}>Media file is required.</p>
              )}
            </div>
            {/* Place this right under the <FilesUpload /> for images */}
            {media.images?.length > 0 && (
              <div className="mt-3">
                <Label label="Select Thumbnail" />
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
                              thumbnail: [img], // single selected thumbnail
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
            <div className="space-y-2  xl:col-span-3 md:col-span-2 col-span-1">
              <div>
                <Label label="videos description" />
                <input
                  type="text"
                  name="media.video.description"
                  placeholder="videos description"
                  value={videoDescription}
                  onChange={() =>
                    handleChange("media.video.description")
                  }
                  className={`w-full shadow hide  bg-white px-3 py-2.5 focus:bg-white focus:outline-none ring-1  focus:ring-2 focus:ring-[#52A5FE] hover:ring-[#52A5FE] rounded text-xs md:text-sm xl:text-sm font-normal font-poppins border-[#DEE4E8] outline-none transition-colors duration-300 focus!ring-2  ring-[#52A5FE]
             placeholder:text-[#8198A8] placeholder:text-xs md:placeholder:text-sm xl:placeholder:text-sm placeholder:font-poppins`}
                />
              </div>

              <Label label="Videos" />
              <Controller
                name="media.videos"
                control={control}
                render={() => (
                  <FilesUpload
                    id="video"
                    onChange={(files: File[]) => handleUpload("videos", files)} // Update form value with selected files
                    accept="video"
                    media={media}
                    setRemove={setMedia}
                    fileUploadLoading={fileUploadLoading}
                  />
                )}
              />
              {errors.file && (
                <p style={{ color: "red" }}>Media file is required.</p>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 max-w-44 ml-auto">
          <button
            disabled={hasInvalidHours}
            type="submit"
            className={`w-full flex cursor-pointer justify-center items-center gap-2 bg-[#5039fd] rounded hover:bg-[#1c109f] text-white font-semibold py-2.5 transition ${hasInvalidHours ? "opacity-60 cursor-not-allowed" : ""
              }`}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusniessEditForm;
