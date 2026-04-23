"use client";

import { useGetSettingsQuery } from "@/app/redux/services/settings";
import Image from "next/image";
import Link from "next/link";
import { FaSquareFacebook } from "react-icons/fa6";

const Footer = () => {
  const { data: currentSettings } = useGetSettingsQuery({});

  return (
    <footer className="bg-[#222] text-white pt-16 pb-6 px-6">
      {/* Top Bar */}
      <div className="border-b border-dashed border-gray-400 text-center max-w-[1200px] mx-auto pb-5">
        <p className="text-lg md:text-2xl">
          {currentSettings?.data?.phoneNumber && (
            <>
              Free support:{" "}
              <a
                href={`tel:${currentSettings.data.phoneNumber}`}
                className="hover:underline"
              >
                {currentSettings.data.phoneNumber}
              </a>{" "}
              |{" "}
            </>
          )}
          Email:{" "}
          <a
            href={`mailto:${currentSettings?.data?.email}`}
            className="hover:underline"
          >
            {currentSettings?.data?.email}
          </a>
        </p>
      </div>

      {/* Footer Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-[1200px] mx-auto text-center mt-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center">
          <Link href="/">
            <Image
              src={currentSettings?.data?.logo || "/logo.jpg"}
              alt="Logo"
              width={80}
              height={80}
              className="rounded-full"
            />
          </Link>
          <p className="mt-3 text-sm">
            Connecting local businesses with customers
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/about-us" className="hover:text-gray-300">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/auth/login" className="hover:text-gray-300">
                Add Your Business
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-gray-300">
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-2 text-sm">
            {currentSettings?.data?.email && <li>Email: {currentSettings.data.email}</li>}
            {currentSettings?.data?.phoneNumber && <li>Phone: {currentSettings.data.phoneNumber}</li>}
            {currentSettings?.data?.location && <li>Location: {currentSettings.data.location}</li>}
          </ul>
          <div className="flex justify-center mt-4 text-white">
            <a
              href="https://www.facebook.com/share/1Xedt9gj1P/?mibextid=wwXIfr"
              className="hover:text-gray-300"
            >
              <FaSquareFacebook size={24} />
            </a>
          </div>
        </div>

        {/* Policies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/privacy-policy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-services" className="hover:text-gray-300">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-10 text-sm">
        &copy; 2025 DealTracker. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
