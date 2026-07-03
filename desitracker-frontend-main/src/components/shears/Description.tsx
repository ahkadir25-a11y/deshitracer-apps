import React from "react";

const Description = ({ description }: { description: string }) => {
  return <p className="text-gray-600 text-center">{description}</p>;
};

export default Description;
