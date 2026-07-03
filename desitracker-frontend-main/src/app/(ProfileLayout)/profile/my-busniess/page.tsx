"use client";
import React from "react";
// import MyBusniessComponents from "@/components/profile-components/my-busniess/MyBusniessComponents";
import dynamic from "next/dynamic";
const MyBusniessComponents = dynamic(
  () =>
    import("@/components/profile-components/my-busniess/MyBusniessComponents"),
  { ssr: false }
);

const MyBusniessPage = () => {
  return <MyBusniessComponents />;
};

export default MyBusniessPage;
