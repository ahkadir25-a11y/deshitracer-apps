"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useCreateSettingsMutation,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/app/redux/services/settings";
import SingleFileUploadUrl from "@/components/shears/file-upload/SingleFileUploadUrl";
import toast from "react-hot-toast"; // Import React Hot Toast for notifications

interface SettingsFormData {
  logo: string;
  email: string;
  phoneNumber: string;
  location: string;
  siteName: string;
}

const SettingsForm = () => {
  const { data: currentSettings, isLoading, error } = useGetSettingsQuery({});
  const [createSettings] = useCreateSettingsMutation();
  const [updateSettings] = useUpdateSettingsMutation();

  const [formData, setFormData] = useState<SettingsFormData>({
    logo: "",
    email: "",
    phoneNumber: "",
    location: "",
    siteName: "",
  });

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  // Update formData once currentSettings is available
  useEffect(() => {
    if (currentSettings) {
      setImageUrl(currentSettings?.data?.logo);
      setFormData({
        logo: currentSettings?.data?.logo,
        email: currentSettings?.data?.email,
        phoneNumber: currentSettings?.data?.phoneNumber,
        location: currentSettings?.data?.location,
        siteName: currentSettings?.data?.siteName,
      });
    }
  }, [currentSettings, currentSettings?.data]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedData = { ...formData, logo: imageUrl };

    try {
      if (currentSettings) {
        await updateSettings(updatedData); // Update existing settings
        toast.success("Settings updated successfully!"); // Show success toast
      } else {
        await createSettings(updatedData); // Create new settings
        toast.success("Settings created successfully!"); // Show success toast
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update/create settings."); // Show error toast
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
      className="max-w-lg mr-auto border border-gray-200 bg-white p-6 rounded-lg"
    >
      <h1 className="text-2xl text-center mb-6">
        {currentSettings ? "Edit Settings" : "Create Settings"}
      </h1>

      {isLoading ? (
        <div className="text-center shimmer w-full h-80 bg-gray-200 rounded-lg"></div> // Shimmer Effect for Loading
      ) : error ? (
        <div className="text-center text-red-500">Error loading settings</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm text-gray-600">
              Site name
            </label>
            <input
              type="text"
              id="siteName"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label htmlFor="logo" className="block text-sm text-gray-600">
              Logo
            </label>
            <SingleFileUploadUrl
              setIsLoading={setIsUploading}
              setImageUrl={setImageUrl}
              imageUrl={imageUrl}
              name="logo"
            />
            {isUploading && (
              <div className="text-center text-gray-500">
                Uploading image...
              </div>
            )}{" "}
            {/* Uploading Status */}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm text-gray-600"
            >
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm text-gray-600">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-[#222] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {currentSettings ? "Update Settings" : "Create Settings"}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default SettingsForm;
