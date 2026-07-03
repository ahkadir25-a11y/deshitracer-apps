import React from "react";

// Define the interface for props
interface SubmitButtonProps {
  buttonText?: string;
  isLoading?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  buttonText = "Submit",
  isLoading = false,
}) => {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full cursor-pointer bg-[#222] p-3 rounded hover:bg-black disabled:opacity-70"
    >
      {isLoading ? `${buttonText}ing...` : `${buttonText}`}
    </button>
  );
};

export default SubmitButton;
