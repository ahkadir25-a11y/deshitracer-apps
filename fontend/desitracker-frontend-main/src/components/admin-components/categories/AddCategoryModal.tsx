/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import CategoryForm from "./CategoryForm";
import Modal from "@/components/shears/Modal";
import { FieldValues, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { useCreateCategoryMutation } from "@/app/redux/services/categories.services";
import { TModalProps } from "@/components/shears/shears-typers";

const AddCategoryModal = ({ isOpen, onClose, onSuccess }: TModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [createCategory] = useCreateCategoryMutation();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, details, imageUrl } = data;
    const inputData = {
      name,
      details,
      icon: imageUrl,
      subCategories: selectedIds,
    };
    try {
      setIsLoading(true);
      // Simulate an API call
      await createCategory(inputData).unwrap();
      toast.success("Subcategory added successfully!");
      onSuccess(); // Call the onSuccess function passed from the parent component
    } catch (error) {
      console.log(error);
      toast.error("Failed to add subcategory.");
    } finally {
      setIsLoading(false);
      onClose(); // Close the modal after submission
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CategoryForm
        onSubmit={onSubmit}
        title={"Add category"}
        oneSelectedIds={(ids: string[]) => {
          setSelectedIds([...ids]);
        }}
        selectedIds={selectedIds}
        buttonText="Add"
        // isLoading={isLoading}
      />
    </Modal>
  );
};

export default AddCategoryModal;
