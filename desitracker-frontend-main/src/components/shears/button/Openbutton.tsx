import React from "react";

interface ButtonProps {
  onClick: () => void;
  label: string;
  bgColor?: string;
  hoverColor?: string;
  duration?: number;
}
const OpenButton: React.FC<ButtonProps> = ({
  onClick,
  label,
  bgColor = "#CCE4FF",
  hoverColor = "#9bc5f6",
  duration = 300,
}) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm  font-semibold px-3 rounded cursor-pointer bg-[${bgColor}] hover:bg-[${hoverColor}] hover:duration-[${duration}ms] transition-colors`}
    >
      {label}
    </button>
  );
};

export default OpenButton;
