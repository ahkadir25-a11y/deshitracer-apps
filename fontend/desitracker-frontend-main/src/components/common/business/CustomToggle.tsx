"use client";
// Reusable Toggle Component
interface CustomToggleProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
}

const CustomToggle: React.FC<CustomToggleProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        onClick={onChange}
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
          checked ? "bg-[#222]" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
};

export default CustomToggle;