/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import SingleFileUpload from "./SingleFileUpload";
import { useUploadImagesMutation } from "@/app/redux/services/upload-images.service";

interface SingleFileUploadUrlProps {
  name?: string; // Optional folder name for the upload
  value?: string | undefined; // URL of the uploaded file or undefined
  setImageUrl: (url: string) => void; // Function to handle file upload
  setIsLoading: (bol: boolean) => void; // Function to handle file upload
  imageUrl: string;
}

const SingleFileUploadUrl: React.FC<SingleFileUploadUrlProps> = ({
  value,
  setImageUrl,
  setIsLoading,
  imageUrl,
  name = "default-folder", // Default folder name if not provided
}) => {
  const [uploadImages, { isLoading: fileUploadLoading }] =
    useUploadImagesMutation();

  const handleUpload = async (file: File | undefined) => {
    if (file) {
      setIsLoading(true);
      // Prepare FormData
      const formData = new FormData();
      formData.append("file", file); // Append the uploaded file

      // Call the upload API
      try {
        const response = await uploadImages({
          formData, // Pass FormData directly
          name: "business-tracker", // Example folder name
        }).unwrap();

        // After successful upload, set the URL
        setImageUrl(response?.data[0]); // Assuming response contains URL
        setIsLoading(false);
      } catch (error) {
        console.error("Upload failed", error);
      }
    }
  };

  return (
    <SingleFileUpload
      onChange={(file: File | undefined) => handleUpload(file)} // Update form value with selected files
      setImageUrl={setImageUrl} // Pass the setImageUrl function
      imageUrl={imageUrl} // Pass the existing value (optional, can be a URL string)
      fileUploadLoading={fileUploadLoading}
    />
  );
};

export default SingleFileUploadUrl;
