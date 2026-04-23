import React from "react";
import ToggleButton from "../button/ToggleButton";
import Label from "./Label";

const FormToggleButton = ({
  booleanState,
  label,
  toggleValue,
}: {
  booleanState: (b: boolean) => void;
  label: string;
  toggleValue?: boolean;
}) => {
  return (
    <div className="">
      <Label label={label} />
      <ToggleButton
        onToggle={(b) => booleanState(b)}
        toggleValue={toggleValue}
      />
    </div>
  );
};

export default FormToggleButton;
