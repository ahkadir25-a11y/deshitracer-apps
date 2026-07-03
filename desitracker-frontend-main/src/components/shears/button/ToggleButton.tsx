import { useEffect, useState } from "react";

function ToggleButton({
  onToggle,
  toggleValue,
}: {
  onToggle?: (value: boolean) => void;
  toggleValue?: boolean;
}) {
  const [toggle, setToggle] = useState(false);

  const handleToggle = () => {
    const newValue = !toggle;
    setToggle(newValue);
    onToggle?.(newValue);
  };
  useEffect(() => {
    setToggle(toggleValue ?? false);
  }, [toggleValue]);
  return (
    <button
      type="button"
      className={`w-10 h-5 flex cursor-pointer items-center rounded-full transition-colors duration-300 ${
        toggle ? "bg-black" : "bg-gray-300"
      }`}
      onClick={handleToggle}
    >
      <span
        className={`h-4 w-4 bg-white rounded-full shadow transition-transform duration-300 ${
          toggle ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default ToggleButton;
