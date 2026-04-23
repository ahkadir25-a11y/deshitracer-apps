import React from "react";

const ProfileHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="text-lg font-semibold text-gray-800 border-b border-[#DEE4E8] p-3">
      {children}
    </div>
  );
};

export default ProfileHeader;
