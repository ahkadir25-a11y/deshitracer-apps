/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Control } from "react-hook-form";
import FormFieldController from "./FormFieldController";

interface Option {
  value: string;
  label: string;
}

const InputField = ({
  label,
  name,
  required,
  placeholder,
  type = "text",
  control,
  className = "w-full",
  options = [],
  onChange,
  rules,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "date"
    | "number"
    | undefined;
  control?: any;
  className?: string;
  options?: Option[];
  rules?: any;
  onChange?: (name: string, value: string) => void;
}) => (
  <div className="space-y-1">
    <FormFieldController
      name={name}
      control={control as Control}
      rules={{
        required: required ? "This field is required" : false,
        ...rules,
        ...(type === "email" && {
          setValueAs: (value: string) => value.toLowerCase(),
          pattern: {
            value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
            message: "Please enter a valid email with lowercase letters",
          },
        }),
      }}
      label={label}
      type={type}
      placeholder={placeholder}
      className={className}
      options={options}
      onChange={onChange}
    />
  </div>
);

export default InputField;