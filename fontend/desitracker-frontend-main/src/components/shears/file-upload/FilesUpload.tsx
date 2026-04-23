/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import Image from "next/image"; // Import for handling the upload.svg
import upload from "../../../assets/upload.svg";
import uploading from "../../../assets/icons/uploading.gif";
interface FileUploadProps {
  onChange: (files: File[]) => void; // Function to update files in the form
  accept: "image" | "video";
  id: string;
  media?: any;
  setRemove?: any;
  fileUploadLoading?: boolean;
}

const FilesUpload: React.FC<FileUploadProps> = ({
  onChange,
  accept = ".png,.jpg,.mp4",
  id,
  media,
  setRemove,
  fileUploadLoading,
}) => {
  console.log("FilesUpload Component Rendered", { id, media, setRemove });
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      // setFilePreviews((prev) => [...prev, ...newFiles]);
      onChange(newFiles); // Update the parent form
    }
  };
  const removeFile = (urlId: string, id: string) => {
    console.log({ urlId, id });

    // Update the state by filtering out the file based on the urlId
    if (id === "video") {
      // For video, filter out the video with the matching urlId
      setRemove((prevMedia: any) => ({
        ...prevMedia,
        videos: prevMedia.videos.filter((video: any) => video._id !== urlId),
      }));
    } else if (id === "image") {
      // For image, filter out the image with the matching urlId
      setRemove((prevMedia: any) => ({
        ...prevMedia,
        images: prevMedia.images.filter((image: any) => image._id !== urlId),
      }));
    }
  };

  return (
    <div className="space-y-4">
      <input
        name={id}
        type="file"
        multiple
        accept={id === "image" ? ".jpg,.jpeg,.png,.heic,.heif,.heics,.heifs,.webp,.avif,.svg,.mp4,.mov,.quicktime,.webm,.3gp,.3gpp,.3g2,.3gpp2" : id === "video" ? ".mp4" : accept}
        onChange={handleFileChange}
        className="hidden"
        id={id}
      />
      <label
        htmlFor={id}
        className={`cursor-pointer flex flex-col items-center justify-center ${fileUploadLoading ? "bg-pink-300" : "bg-white"} p-6 border-2 border-dashed border-gray-300 rounded-lg transition hover:border-blue-400 hover:bg-blue-50`}
      >
        {
          fileUploadLoading ?
            <div>
              <Image src={uploading} alt="Uploading" width={200} height={200} />
            </div>
            :
            <div className="flex flex-col items-center space-y-3 text-center">
              <div>
                <Image src={upload} alt="Upload Icon" width={24} height={24} />

              </div>
              <p className="text-gray-600 text-sm font-medium">
                Drag and drop or <span className="text-[#222] underline">browse</span>
              </p>
              <p className="text-xs text-gray-400">
                {id === "video"
                  ? "Max size: 15MB"
                  : "Max size: 15MB"}
              </p>
            </div>
        }

      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {id === "image" &&
          media?.images?.map((img: any, index: number) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <Image
                src={img?.url}
                alt="Preview"
                width={120}
                height={90}
                className="w-full h-24 object-cover transition-transform group-hover:scale-105"
              />
              <button
                onClick={() => removeFile(img?._id, id)}
                className="absolute cursor-pointer top-1 right-1 w-6 h-6 rounded-full bg-white text-gray-600 hover:text-red-500 border border-gray-300 flex items-center justify-center shadow transition"
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
        {id === "video" &&
          media?.videos?.map((video: any, index: number) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
              <video
                controls
                className="w-full h-24 object-cover rounded"
              >
                <source src={video.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                onClick={() => removeFile(video?._id, id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white text-gray-600 hover:text-red-500 border border-gray-300 flex items-center justify-center shadow transition"
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
      </div>
    </div>

  );
};

export default FilesUpload;
