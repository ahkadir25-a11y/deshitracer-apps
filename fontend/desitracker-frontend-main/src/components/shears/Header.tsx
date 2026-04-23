import React from "react";
import Title from "./Title";
import Description from "./Description";

const Header = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <div>
      <Title title={title} />
      <Description description={description} />
    </div>
  );
};

export default Header;
