import React from "react";

const FormTitle = ({ formTitle }: { formTitle: string }) => {
  return (
    <h1 className="text-2xl font-bold border-b pb-4 border-gray-300 text-gray-800 mb-6 text-left">{formTitle}</h1>
  );
};

export default FormTitle;
