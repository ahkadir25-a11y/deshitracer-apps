"use client";

import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";
import { BiSolidError } from "react-icons/bi";

interface Option {
  value: string;
  label: string;
}

interface FormFieldControllerProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  rules?: Omit<
    RegisterOptions<T, Path<T>>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  label?: string;
  type: "text" | "email" | "password" | "textarea" | "select" | "date" | "number";
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  options?: Option[];
  onChange?: (name: string, value: string) => void;
}

const FormFieldController = <T extends FieldValues = FieldValues>({
  name,
  control,
  rules,
  label,
  type,
  placeholder,
  className = "w-full",
  labelClassName = "block text-sm font-medium text-gray-800",
  options = [],
}: FormFieldControllerProps<T>) => {
  const formatString = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/^./, (match) => match.toUpperCase());

  const renderField = (
    field: ControllerRenderProps<T, Path<T>>,
    error: FieldError | undefined
  ) => {
    const baseInputClass = `
      ${className}
      bg-white
      border 
      rounded 
      px-3 py-2.5
      text-sm 
      font-normal 
      font-poppins 
      transition-all 
      duration-200
      placeholder:text-gray-400 
      focus:outline-none
      focus:ring-2 
      focus:ring-
      focus:border-
      ${error ? "border-red-400 focus:ring-red-400 focus:border-red-400" : "border-gray-300 hover:border-gray-400"}
    `;

    switch (type) {
      case "textarea":
        return (
          <textarea
            {...field}
            id={name}
            placeholder={formatString(placeholder || label || "")}
            className={baseInputClass}
            rows={4}
          />
        );
      case "select":
        return (
          <select {...field} id={name} className={baseInputClass}>
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            {...field}
            type={type}
            id={name}
            value={field.value || ""}
            placeholder={formatString(placeholder || label || "")}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <div className="space-y-1">
          {label && (
            <label htmlFor={name} className={labelClassName}>
              {formatString(label)}{" "}
              {rules?.required && <span className="text-red-500">*</span>}
            </label>
          )}
          {renderField(field, error)}
          {error && (
            <p className="flex items-center text-sm text-red-500 mt-1">
              <BiSolidError className="mr-1" />
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default FormFieldController;
