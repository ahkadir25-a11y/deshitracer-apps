/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from "@/components/shears/Modal";
import React, { useEffect, useState } from "react";
import CategoryForm from "./CategoryForm";

import { FieldValues, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useGetCategoryQuery,
  useUpdateCategoryMutation,
} from "@/app/redux/services/categories.services";
interface ModalProps {
  isOpen: boolean;
  categorySlug: string;
  onClose: () => void;
  onSuccess: () => void;
  selectedIds: string[];
  setSelectedIds: any;
}

const UpdateCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  categorySlug,
  selectedIds,
  setSelectedIds,
}: ModalProps) => {
  const [defaultValues, setDefaultValues] = useState<{
    name?: string;
    details?: string;
    subCategories?: string[];
    imageUrl?: string;
  }>({});
  const { data, isLoading: isCategoryLoading } = useGetCategoryQuery({
    categorySlug,
  });
  const [updateCategory] = useUpdateCategoryMutation();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { name, details, imageUrl } = data;
    const inputData = {
      name,
      details,
      icon: imageUrl,
      subCategories: selectedIds,
    };
    try {
      await updateCategory({
        slug: categorySlug, // Assuming `slug` is in `defaultValues`
        updatedCategoryData: inputData,
      }).unwrap();
      toast.success("Subcategory added successfully!");
      onSuccess(); // Call the onSuccess function passed from the parent component
    } catch (error) {
      console.log(error);
      toast.error("Failed to add subcategory.");
    } finally {
      //   setIsLoading(false);
      onClose(); // Close the modal after submission
    }
  };
  useEffect(() => {
    setDefaultValues({
      name: data?.data?.name,
      details: data?.data?.details,
      subCategories: data?.data?.subCategories,
      imageUrl: data?.data?.icon,
    });
  }, [isCategoryLoading, data?.data]);
  if (isCategoryLoading) {
    return <p>Loading...!</p>;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <CategoryForm
        onSubmit={onSubmit}
        title={"Update category"}
        oneSelectedIds={(ids: string[]) => {
          setSelectedIds([...ids]);
        }}
        selectedIds={selectedIds}
        buttonText="Update"
        defaultValues={defaultValues}
        isUpdate={true}
      />
    </Modal>
  );
};

export default UpdateCategoryModal;
