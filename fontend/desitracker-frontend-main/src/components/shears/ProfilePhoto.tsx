import Image from "next/image";
import React from "react";
import default_user from "../../assets/ProfilePlaceholder.svg";
const ProfilePhoto = ({
  url,
  className = "h-12 w-12 object-cover",
}: {
  className?: string;
  url?: string;
}) => {
  return (
    <Image
      src={url || default_user}
      alt="user"
      className={`${className} rounded-full object-cover `}
      width={100}
      height={100}
    />
  );
};

export default ProfilePhoto;
