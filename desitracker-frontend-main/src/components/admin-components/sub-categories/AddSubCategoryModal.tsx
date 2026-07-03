/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Modal from "@/components/shears/Modal";
import React, { useState } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import SubCategoryForm from "./SubCategoryForm";
import toast from "react-hot-toast";
import { useCreateSubCategoryMutation } from "@/app/redux/services/sub-categories.services";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
const AddSubCategoryModal = ({ isOpen, onClose, onSuccess }: ModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [createSubCategory] = useCreateSubCategoryMutation();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, details, imageUrl } = data;
    const inputData = {
      name,
      details,
      icon: imageUrl,
      parentCategory: selectedId,
    };

    try {
      setIsLoading(true);
      // Call the createSubCategory mutation
      await createSubCategory(inputData).unwrap();
      toast.success("Subcategory added successfully!");
      onSuccess(); // Call the onSuccess function passed from the parent component
    } catch (error) {
      toast.error("Failed to add subcategory.");
    } finally {
      setIsLoading(false);
      onClose(); // Close the modal after submission
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <SubCategoryForm
        onSubmit={onSubmit}
        title={"Add Sub category"}
        setSelectedId={(id: string) => setSelectedId(id)}
        buttonText="Add"
      />
    </Modal>
  );
};

export default AddSubCategoryModal;
