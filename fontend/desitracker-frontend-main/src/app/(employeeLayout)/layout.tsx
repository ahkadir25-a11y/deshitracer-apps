import LoginUserRep from "@/components/shears/LoginUserRep";
import React from "react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoginUserRep>
      <div className="w-full px-4 py-4 flex   md:flex-row flex-col">
        <main className="w-full  bg-white border-y border-gray-200 border-x">
          {children}
        </main>
      </div>
    </LoginUserRep>
  );
};

export default ProfileLayout;
