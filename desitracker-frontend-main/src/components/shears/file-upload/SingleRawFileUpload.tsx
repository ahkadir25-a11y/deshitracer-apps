"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import upload from "../../../assets/upload.svg";
interface FileUploadProps {
  onChange: (file: File | undefined) => void; // Function to update files in the form
  existingFile?: File | string; // Optional existing file for preview
}

const SingleRawFileUpload: React.FC<FileUploadProps> = ({
  onChange,
  existingFile,
}) => {
  const [filePreview, setFilePreview] = useState<File | undefined>(
    typeof existingFile === "string" ? undefined : existingFile
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (file) {
      setFilePreview(file);
      onChange(file);
    }
  };

  const removeFile = (fileToRemove: File) => {
    setFilePreview(undefined);
    onChange(undefined); // Update the parent form
    URL.revokeObjectURL(URL.createObjectURL(fileToRemove)); // Revoke object URL to free up memory
  };

  useEffect(() => {
    return () => {
      if (filePreview) URL.revokeObjectURL(URL.createObjectURL(filePreview));
    };
  }, [filePreview]);

  return (
    <div className="">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer  min-h-40 flex items-center justify-center flex-col  bg-white p-4 border-2 border-[#dee4e8] rounded-lg border-dashed "
      >
        {/* Upload Icon */}
        <div className=" flex space-x-2 items-center text-sm">
          <div className="">
            <Image src={upload} alt="Upload" width={20} height={30} />
          </div>
          <div>
            <p className="text-gray-500">
              Drag and drop file or{" "}
              <span className="text-black font-semibold">Browse</span>
            </p>
            <p className="text-xs text-gray-400">Max 15 MB</p>
          </div>
        </div>
      </label>

      {/* Preview section */}
      <div className="flex mt-4 space-x-4 overflow-x-auto">
        {filePreview && (
          <div className="relative w-24 h-24">
            <Image
              src={URL.createObjectURL(filePreview)}
              alt="Preview"
              width={50}
              height={70}
              className="object-cover rounded-[10px] w-[97px] h-[90px] "
            />
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black rounded-xl"></div>
            {/* Remove button */}
            <button
              onClick={() => removeFile(filePreview)}
              className="absolute cursor-pointer top-0 right-0 bg-white text-black rounded-full w-5 h-5 flex items-center justify-center border border-gray-300 shadow-md"
            >
              &times;
            </button>
            {/* Progress bar style */}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleRawFileUpload;

// SingleRawFileUpload
