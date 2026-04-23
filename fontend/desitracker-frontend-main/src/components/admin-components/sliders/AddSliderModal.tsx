/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from "@/components/shears/Modal";
import { TModalProps } from "@/components/shears/shears-typers";
import React from "react";
import SliderForm from "./SliderForm";
import { useCreateSliderMutation } from "@/app/redux/services/slider.services";
import toast from "react-hot-toast";

const AddSliderModal = ({ isOpen, onClose, onSuccess }: TModalProps) => {
  const [createSlider, { isLoading }] = useCreateSliderMutation();

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("file", data.imageFile as Blob);
    const inputData = {
      position: data.position,
    };
    formData.append("data", JSON.stringify(inputData));

    try {
      const res = await createSlider(formData);

      // Show success toast if response is successful
      if (res?.data.success) {
        toast.success(res?.data?.message || "Slider created successfully!");
        onSuccess(); // Trigger any success-related actions (like resetting form)
      } else {
        // Show error toast if the API response doesn't indicate success
        toast.error(res?.data?.message || "Failed to create slider.");
      }
    } catch (error) {
      // Show error toast in case of network/API failure
      console.error("Error submitting slider data:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <SliderForm onSubmit={onSubmit} isLoading={isLoading} />
    </Modal>
  );
};

export default AddSliderModal;
