/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  useDeleteSliderMutation,
  useGetAllSlidersQuery,
} from "@/app/redux/services/slider.services";
import React from "react";
import AddSliderModal from "./AddSliderModal";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaPlusCircle, FaRegTrashAlt } from "react-icons/fa";
const SlideComponent = () => {
  const [isOpenAddSliderModal, setIsOpenAddSliderModal] =
    React.useState<boolean>(false);
  const { data, refetch } = useGetAllSlidersQuery({});
  const [deleteSlider] = useDeleteSliderMutation();

  const handleDeleteSlider = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this slider?");

    if (!isConfirmed) {
      return; // Exit if the user clicks "Cancel"
    }

    try {
      const res = await deleteSlider(id);
      if (res?.data?.success) {
        // Success toast notification
        toast.success("Slider deleted successfully!");
      } else {
        // Failure toast notification
        toast.error("Failed to delete slider. Please try again.");
      }
    } catch (error) {
      // Error handling
      console.error("Error deleting slider:", error);
      toast.error("An error occurred while deleting the slider.");
    }
  };
  return (
    <div className=" mx-auto bg-gray-100 p-4 rounded-lg border border-gray-300">
      {/* <div className="flex justify-between mb-4">

      </div> */}
      <div className=" space-x-4 grid md:grid-cols-5 grid-cols-2 gap-2 p-2">
        <button
          onClick={() => setIsOpenAddSliderModal(true)}
          className="bg-[#110f75] flex items-center cursor-pointer justify-center transition-all duration-300 w-full h-40 text-white px-4 py-2 border border-gray-300 rounded-sm hover:bg-[#2b2c3f]"
        >
          <FaPlusCircle size={40} />
        </button>
        {data?.data?.map((slide: any) => (
          <div
            key={slide.id}
            className=" bg-white border border-gray-300 rounded-sm flex-none"
          >
            <div>
              <Image
                src={slide?.url}
                alt="slide"
                height={500}
                width={500}
                quality={100}
                className="md:h-40 h-28 object-cover rounded-t-sm"
              />
            </div>
            <div className="pt-1 flex justify-between items-center px-2">
              <h3 className="text-sm font-medium mb-2">
                Slide {slide.position}
              </h3>

              <div className="flex items-center justify-center gap-3 pb-2">
                {/* Edit */}
                {/* <button>
                  <MdOutlineEdit size={20} />
                </button> */}
                {/* Delete */}
                <button className=" cursor-pointer transition-all duration-300 hover:border-red-200 border border-gray-200 hover:scale-95 hover:bg-red-100 rounded-full p-1" onClick={() => handleDeleteSlider(slide?._id)}>
                  <FaRegTrashAlt className="text-red-500" size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AddSliderModal
        isOpen={isOpenAddSliderModal}
        onSuccess={() => {
          setIsOpenAddSliderModal(false);
          refetch();
        }}
        onClose={() => setIsOpenAddSliderModal(false)}
      />
    </div>
  );
};

export default SlideComponent;
