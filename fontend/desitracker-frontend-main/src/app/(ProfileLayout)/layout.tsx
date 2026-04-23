import Footer from "@/components/common/home/Footer";
import Navbar from "@/components/common/home/Navbar";
import NeedHelpCard from "@/components/NeedHelpCard";
import ProfileSidebar from "@/components/shears/dashboard/profile-layout/ProfileSidebar";
import LoginUserRep from "@/components/shears/LoginUserRep";
import React from "react";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoginUserRep>
      <Navbar />
      <div className="w-full  flex   md:flex-row flex-col">
        {/* Sidebar */}
        <aside className="w-full md:w-1/6">
          <ProfileSidebar />
        </aside>

        {/* Main content */}
        <main className="w-full md:w-5/6 bg-white border-y border-gray-200 border-x">
          {children}
          <NeedHelpCard />
        </main>
      </div>
      <Footer />
    </LoginUserRep>
  );
};

export default ProfileLayout;
