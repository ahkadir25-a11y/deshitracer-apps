import ProfileHeader from "@/components/shears/dashboard/profile-layout/ProfileHeader";
import BusinessForm from "@/components/shears/form/BusinessForm";
import React from "react";

const AddBusniessPage = () => {
  return (
    <div>
      <ProfileHeader>
        <h1 className="text-2xl"> {"Add Busniess"}</h1>
      </ProfileHeader>
      <BusinessForm />
    </div>
  );
};

export default AddBusniessPage;
