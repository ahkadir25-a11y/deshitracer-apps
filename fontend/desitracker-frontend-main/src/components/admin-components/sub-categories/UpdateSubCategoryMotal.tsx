/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  useGetSubCategoryQuery,
  useUpdateSubCategoryMutation,
} from "@/app/redux/services/sub-categories.services";
import toast from "react-hot-toast";
import SubCategoryForm from "./SubCategoryForm";
import Modal from "@/components/shears/Modal";

interface ModalProps {
  isOpen: boolean;
  subCategorySlug: string;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateSubCategoryModal = ({
  isOpen,
  onClose,
  onSuccess,
  subCategorySlug,
}: ModalProps) => {
  //   const [isLoading, setIsLoading] = useState(false);
  const { data, isLoading } = useGetSubCategoryQuery(subCategorySlug);
  const [updateSubCategory] = useUpdateSubCategoryMutation();
  interface DefaultValues {
    name: string;
    details: string;
    parentCategory: any;
    imageUrl: string | undefined;
  }

  const [defaultValues, setDefaultValues] = useState<
    DefaultValues | undefined
  >();
  const [selectedId, setSelectedId] = useState("");

  const onSubmit = async (formData: {
    name: string;
    details: string;
    parentCategory: string;
    imageUrl: string;
  }) => {
    // Destructure the form data
    const { name, details, imageUrl } = formData;
    // Prepare the input data for updating the subcategory
    const inputData = {
      name,
      details,
      parentCategory: selectedId, // Assuming the categoryId is passed to the form
      icon: imageUrl, // Icon is passed from the form as well
    };
    try {
      // Update the subcategory using the mutation
      await updateSubCategory({
        slug: subCategorySlug, // Use subCategorySlug here instead of categorySlug
        updatedSubCategoryData: inputData,
      }).unwrap(); // Unwrap to get the result

      toast.success("Subcategory updated successfully!");
      onSuccess(); // Call the success callback passed from the parent component
    } catch (error) {
      console.log(error);
      toast.error("Failed to update subcategory.");
    } finally {
      onClose(); // Close the modal after submission
    }
  };

  useEffect(() => {
    setDefaultValues({
      name: data?.data?.name || "",
      details: data?.data?.details || "",
      parentCategory: data?.data?.parentCategory || "",
      imageUrl: data?.data?.icon, // Set this to the existing image URL if applicable
    });
  }, [data, isLoading]);
  if (isLoading) {
    return <div>Loading...</div>; // Show loading state if data is being fetched
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {data && (
        <SubCategoryForm
          onSubmit={onSubmit}
          title="Update Subcategory"
          setSelectedId={(id) => setSelectedId(id)}
          defaultValues={defaultValues}
          buttonText="Update"
        />
      )}
    </Modal>
  );
};

export default UpdateSubCategoryModal;
