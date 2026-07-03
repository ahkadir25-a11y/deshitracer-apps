"use client";
import Footer from "@/components/common/home/Footer";
import Navbar from "@/components/common/home/Navbar";
import VerifyMemberClient from "@/components/shears/members/VerifyMemberClient";
import { useParams } from "next/navigation";

const VerifyPage = () => {
  const { slug } = useParams<{ slug: string }>(); // 👈 type the params
  return (
    <>
      <Navbar />
      <VerifyMemberClient slug={slug} />
      <Footer /></>

  );
};

export default VerifyPage;
