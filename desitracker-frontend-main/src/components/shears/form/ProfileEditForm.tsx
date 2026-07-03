/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InputField from "./InputField";
import Label from "./Label";
import ProfileHeader from "../dashboard/profile-layout/ProfileHeader";
import SingleRawFileUpload from "../file-upload/SingleRawFileUpload";
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
} from "@/app/redux/services/users.services";
import { useAppSelector } from "@/app/redux/hoook";
import toast from "react-hot-toast";

const ProfileEditForm = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const { user } = useAppSelector(
    (state: { auth: { user: { id: string } | null } }) => state.auth
  );
  const [manualaLoading,setManualLoading] = useState(false);
  const { data, isLoading, isError } = useGetUserByIdQuery(user?.id);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      // Set the data in form fields when it's fetched
      setValue("name", data?.data?.name);
      setValue("email", data?.data?.email);
      setValue("phone", data?.data?.phone);
      setValue("contact", data?.data?.contact);
      setValue("profilePic", data?.data?.profilePic);
    }
  }, [data, setValue]);

  const uploadFileToCloudinary = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary upload preset
      // Optional: Add additional parameters like folder, tags, etc.
      // formData.append("folder", "profile_pics");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dzem7xarv/image/upload`, // Replace CLOUDINARY_CLOUD_NAME with your Cloudinary cloud name
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.secure_url; // Return the secure URL of the uploaded file
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error";
      throw new Error("Failed to upload file to Cloudinary: " + errorMessage);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setFormError(null); // Reset the error before submitting
      setManualLoading(true)
      let fileUrl = null;
      if (data.profilePic) {
        // Upload the file to Cloudinary and get its URL
        fileUrl = await uploadFileToCloudinary(data.profilePic);
      }

      // Prepare the data to send to the backend
      const userData = {
        contact: data.contact,
        email: data.email,
        name: data.name,
        phone: data.phone,
        profilePicUrl: fileUrl,
      };

      // Send the data to the backend as a raw object
      const res = await updateUser({
        userId: user?.id,
        userData, // Remove JSON.stringify
      }).unwrap();
      console.log({ res });

      // Show success toast
      toast.success("Profile updated successfully!");
      setManualLoading(false)
    } catch (error) {
      setFormError("Failed to update the profile. Please try again.");
      console.error("Update failed:", error);
      // Show error toast
      toast.error("Failed to update profile. Please try again.");
      setManualLoading(false)

    }
  };
  return (
    <div>
      <ProfileHeader>
        <h1 className="text-2xl">Edit Profile</h1>
      </ProfileHeader>

      {isLoading ? (
        <div>Loading user data...</div> // Loading state when data is being fetched
      ) : isError ? (
        <div className="text-red-500">
          Failed to load user data. Please try again.
        </div> // Error handling for fetch
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="container mx-auto space-y-5 p-4"
        >
          {/* Personal Info */}
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                name: "name",
                label: "Full Name",
                placeholder: "Enter your full name",
                type: "text",
              },
              {
                name: "email",
                label: "Email Address",
                placeholder: "Enter your email address",
                type: "email",
              },
              {
                name: "phone",
                label: "Phone Number",
                placeholder: "Enter your phone number",
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
                  field.type as
                  | "text"
                  | "email"
                  | "password"
                  | "textarea"
                  | "select"
                  | "date"
                }
              />
            ))}
          </div>


          {/* Upload Image */}
          <div className="max-w-md">
            <Label label="Change Profile Picture" />
            <Controller
              name="profilePic"
              control={control}
              render={({ field: { onChange, value } }) => (
                <SingleRawFileUpload
                  onChange={(file: File | undefined) => onChange(file)}
                  existingFile={value}
                />
              )}
            />
            {errors?.profilePic && (
              <p className="text-red-500">Profile image is required.</p>
            )}
          </div>

          {/* Submit */}
          {formError && <div className="text-red-500">{formError}</div>}
          <div className="flex items-end justify-end mt-6">
            <button
              type="submit"
              className={`py-2 px-5 cursor-pointer rounded-md text-sm ${isUpdating ? "bg-gray-400" : "bg-black text-white"
                }`}
              disabled={isUpdating || manualaLoading}
            >
              {(manualaLoading || isUpdating) ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileEditForm;
