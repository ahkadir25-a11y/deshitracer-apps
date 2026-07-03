import ProfileHeader from "@/components/shears/dashboard/profile-layout/ProfileHeader";
import React from "react";

const FavoriteOnePage = () => {
  return (
    <div>
      <ProfileHeader>
        <span>My Favorite Listings</span>
      </ProfileHeader>
      <div className="pt-5 space-y-4">
        {/* <BusinessCart />
        <BusinessCart />
        <BusinessCart />
        <BusinessCart /> */}
      </div>
    </div>
  );
};

export default FavoriteOnePage;
