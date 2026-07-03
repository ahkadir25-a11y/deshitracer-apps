"use client";
import React from "react";
import Header from "@/components/shears/Header";
import { useRouter } from "next/navigation";

const CallToAction = () => {
  const navigate = useRouter(); // Initialize the navigate function

  const handleRegisterClick = () => {
    // Navigate to the review submission page
    navigate.push("/submit-review"); // Replace '/submit-review' with your actual route path for the submission page
  };

  return (
    <section className="text-center  px-2 !text-white min-h-[40vh] flex items-center justify-center flex-col bg-gray-50 border-t">
      <Header
        title="Ready to Share Your  Experience?"
        description="Your feedback is valuable to us and helps others make better decisions."
      />
      <button
        onClick={handleRegisterClick} // Attach the click handler
        className="border border-[#222] cursor-pointer text-[#222] hover:text-white hover:bg-black transition-all duration-300 px-6 py-3 rounded mt-4"
      >
        Submit Your Review
      </button>
    </section>
  );
};

export default CallToAction;
