import React from "react";

const Title = ({ title }: { title: string }) => {
  return (
    <h2 className="text-4xl font-semibold text-center mb-4 text-black">
      {title}
    </h2>
  );
};

export default Title;
