/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "@/components/shears/form/InputField";
import CategoryDropdown from "@/components/shears/drop-Down/CategoryDropdown";
import SingleFileUploadUrl from "@/components/shears/file-upload/SingleFileUploadUrl";
import { TCategory } from "../categories/category.types";

interface SubCategoryFormProps {
  onSubmit: (data: any) => void;
  title: string;
  setSelectedId: (id: string) => void;
  defaultValues?: {
    name?: string;
    details?: string;
    parentCategory?: TCategory;
    imageUrl?: string;
    categoryId?: string;
  };
  buttonText?: string;
}

const SubCategoryForm = ({
  onSubmit,
  title,
  setSelectedId,
  defaultValues = {},
  buttonText,
}: // setImageUrl,
SubCategoryFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(defaultValues.imageUrl || "");
  const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(
    null
  );
  // Using the defaultValues to pre-fill the form fields
  const { handleSubmit, control, setValue } = useForm();

  useEffect(() => {
    if (defaultValues.name) setValue("name", defaultValues.name);
    if (defaultValues.details) setValue("details", defaultValues.details);
    if (defaultValues.parentCategory?._id) {
      setValue("parentCategory", defaultValues.parentCategory._id);
      setSelectedId(defaultValues.parentCategory._id);
    }
  }, [defaultValues]);

  useEffect(() => {
    if (imageUrl) {
      setValue("imageUrl", imageUrl);
    }
  }, [imageUrl, setValue]);
  return (
    <div className="flex flex-col gap-8 w-80 md:w-1/2 lg:w-[500px] p-5 ">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full space-y-5">
          {/* Render form fields dynamically */}
          {[
            {
              name: "name",
              label: "Sub Category Name",
              placeholder: "Enter Sub Category Name",
              type: "text" as const,
            },
            {
              name: "details",
              label: "Sub Category Details",
              placeholder: "Enter Sub Category Details",
              type: "textarea" as const,
            },
          ].map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              control={control}
            />
          ))}
        </div>

        {/* Category Dropdown */}
        <CategoryDropdown
          setSelectedId={setSelectedId}
          parentCategory={defaultValues.parentCategory}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          label="Select Category"
        />

        {/* Image upload */}
        <div className="mt-5">
          <SingleFileUploadUrl
            setIsLoading={setIsLoading}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            name="sub-category"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full cursor-pointer bg-[#CCE4FF] p-3 rounded hover:bg-[#a6cdfa] disabled:opacity-70"
        >
          {isLoading ? `${buttonText}ing..` : `${buttonText} Subcategory`}
        </button>
      </form>
    </div>
  );
};

export default SubCategoryForm;
