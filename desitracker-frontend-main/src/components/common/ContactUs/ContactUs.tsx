"use client";
import { useSendContactMessageMutation } from "@/app/redux/services/contactus.service";
import PageHeader from "@/components/shears/page-header/PageHeader";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import { useGetSettingsQuery } from "@/app/redux/services/settings";
import WhatsAppFloatingButton from "@/app/(CommonLayout)/products/WhatsAppFloatingButton";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    phone: "",
  });
  const { data: currentSettings } = useGetSettingsQuery({});

  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message || !formData.phone) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      await sendContactMessage(formData).unwrap();
      setError("");
      setFormData({ name: "", email: "", message: "", phone: "" });
      setShowModal(true);
    } catch (err) {
      console.log(err)
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-[#F9FAFB]">
      <PageHeader
        className="listingBg md:h-[33vh] h-[150px]"
        title="Contact Us"
        subtitle="We would love to hear from you! Please fill out the form below, and we will get back to you as soon as possible."
      />
            <WhatsAppFloatingButton/>
      
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10 items-start">
        {/* FORM SECTION */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-"
                  required
                />
              </div>
             
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700">
                What do you have in mind? <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                placeholder="Please enter query..."
                className="mt-2 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-"
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#222] cursor-pointer text-white font-semibold py-3 rounded-md hover:bg-green-800"
            >
              {isLoading ? "Sending..." : "Submit"}
            </button>
          </form>
        </div>

        {/* CONTACT INFO SECTION */}
        <div className="bg-[#222] p-6 rounded-3xl space-y-6 text-white">
          <h2 className="text-2xl font-semibold">Contact us</h2>
          <p className="text-sm leading-relaxed text-white/90">
            Have questions or need help finding a business? Our team is here to assist you with any inquiries or support you may need.
          </p>


          {
            currentSettings?.data?.phoneNumber && (
              <div className="flex items-center space-x-3">
                <FiPhone className="text-xl text-white" />
                <span className="text-sm">{currentSettings?.data?.phoneNumber}</span>
              </div>
            )
          }

          {
            currentSettings?.data?.email && (
              <div className="flex items-center space-x-3">
                <FiMail className="text-xl text-white" />
                <span className="text-sm">{currentSettings?.data?.email}</span>
              </div>
            )
          }

          {
            currentSettings?.data?.location && (
              <div className="flex items-center space-x-3">
                <FiMapPin className="text-xl text-white" />
                <span className="text-sm">{currentSettings?.data?.location}</span>
              </div>
            )
          }


        </div>

      </div>

      {/* SUCCESS MODAL */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white p-6 rounded-md shadow-md text-center max-w-sm w-full"
            initial={{ y: -40 }}
            animate={{ y: 0 }}
          >
            <h2 className="text-xl font-semibold text-gray-800">Thank You!</h2>
            <p className="mt-3 text-gray-600">
              We have received your message and will get back to you soon.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-[#222] text-white py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ContactUs;
