/* eslint-disable react-hooks/exhaustive-deps */
import SubmitButton from "@/components/shears/button/SubmitButton";
import SingleRawFileUpload from "@/components/shears/file-upload/SingleRawFileUpload";
import InputField from "@/components/shears/form/InputField";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const SliderForm = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: { position: number }) => void;
  isLoading: boolean;
}) => {
  const [imageFile, setImageFile] = useState<File | undefined>();
  const { control, handleSubmit, setValue } = useForm<{
    position: number;
    imageFile?: File;
  }>();
  console.log({ imageFile });
  useEffect(() => {
    setValue("imageFile", imageFile);
  }, [imageFile]);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="container mx-auto space-y-5 w-96 mt-7"
    >
      <SingleRawFileUpload
        onChange={(file: File | undefined) => setImageFile(file)}
      />
      <InputField
        label={"Position"}
        name={"position"}
        placeholder={"Position"}
        control={control}
        type={"number"}
      />
      <SubmitButton isLoading={isLoading} />
    </form>
  );
};

export default SliderForm;
