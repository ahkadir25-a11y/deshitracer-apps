/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import SubmitButton from "@/components/shears/button/SubmitButton";
import SubCategoryDropdown from "@/components/shears/drop-Down/SubCategoryDropdown";
import SingleFileUploadUrl from "@/components/shears/file-upload/SingleFileUploadUrl";
import InputField from "@/components/shears/form/InputField";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
interface CategoryFormProps {
  onSubmit: (data: any) => void;
  title: string;
  oneSelectedIds: (ids: string[]) => void;
  selectedIds: string[];
  defaultValues?: {
    name?: string;
    details?: string;
    subCategoris?: string[];
    imageUrl?: string;
  };
  buttonText?: string;
  isUpdate?: boolean;
}
const CategoryForm = ({
  onSubmit,
  title,
  oneSelectedIds,
  selectedIds,
  defaultValues = {},
  isUpdate = false,
}: CategoryFormProps) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");

  // Using the defaultValues to pre-fill the form fields
  const { handleSubmit, control, setValue } = useForm<{
    name: string;
    details: string;
    subCategoris: string[];
    imageUrl: string;
  }>({
    defaultValues: {
      name: defaultValues.name || "",
      details: defaultValues.details || "",
      subCategoris: defaultValues.subCategoris || [],
      imageUrl: defaultValues.imageUrl || "",
    },
  });

  const defaultIdes =
    defaultValues?.subCategoris?.map(
      (subCategory: any) => subCategory?._id?.toString() || ""
    ) || [];

  useEffect(() => {
    setIsLoading(true);

    // Set form values only if they are not empty or undefined
    setValue("name", defaultValues?.name || "");
    setValue("details", defaultValues?.details || "");

    // Handle the selected IDs
    oneSelectedIds(defaultIdes);

    setIsLoading(false); // Only set loading state to false once the operations are complete
  }, [defaultValues?.name]); // This should depend on `defaultValues` as subCategoris seems like a nested property

  useEffect(() => {
    setIsLoading(true);

    // Check for imageUrl or fallback to default value
    if (imageUrl || defaultValues.imageUrl) {
      setValue("imageUrl", imageUrl || defaultValues.imageUrl || "");
      setImageUrl(imageUrl || defaultValues.imageUrl || ""); // Ensure imageUrl is properly set
    }

    setIsLoading(false);
  }, [imageUrl, defaultValues]);
  return (
    <div className="flex flex-col gap-8 w-80 md:w-1/2 lg:w-[500px] p-5 ">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full space-y-5">
          {/* Render form fields dynamically */}
          {[
            {
              name: "name",
              label: "Category Name",
              placeholder: "Enter Category Name",
              type: "text",
            },
            {
              name: "details",
              label: "Category Details",
              placeholder: "Enter Category Details",
              type: "textarea" as const,
            },
          ].map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              name={field.name}
              type={
                field.type as
                  | "text"
                  | "textarea"
                  | "email"
                  | "password"
                  | "select"
                  | "date"
                  | undefined
              }
              placeholder={field.placeholder}
              control={control}
            />
          ))}
        </div>

        {/* Category Dropdown */}

        {!isUpdate && (
          <SubCategoryDropdown
            selectedIds={selectedIds}
            oneSelectedIds={oneSelectedIds}
            defaultValues={defaultValues}
          />
        )}
        {/* Image upload */}
        <div className="mt-2">
          <SingleFileUploadUrl
            setIsLoading={setIsLoading}
            setImageUrl={setImageUrl}
            imageUrl={imageUrl}
            name="sub-category"
          />
        </div>

        {/* Submit Button */}

        <SubmitButton isLoading={isLoading} />
      </form>
    </div>
  );
};

export default CategoryForm;
