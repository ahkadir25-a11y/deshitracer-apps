import React from "react";
import PageHeader from "@/components/shears/page-header/PageHeader";
import Link from "next/link";
import WhatsAppFloatingButton from "@/app/(CommonLayout)/products/WhatsAppFloatingButton";

const HowItWorksComponents = () => {
  const businessSteps = [
    {
      icon: "📝",
      title: "Create a Profile",
      text: "Sign up and list your business with name, category, location, languages, hours, contact, website, and images.",
    },
    {
      icon: "🔍",
      title: "Get Discovered",
      text: "Your business appears to users searching by category, city, language, or name.",
    },
    {
      icon: "⚙️",
      title: "Manage Your Listing",
      text: "Update your info, upload promotions, or add new services anytime.",
    },
    {
      icon: "🚀",
      title: "Optional Promotions",
      text: "Run ads or feature your listing for higher visibility.",
    },
  ];

  const customerSteps = [
    {
      icon: "🔎",
      title: "Search Easily",
      text: "Find businesses using filters for location, service, language, or name.",
    },
    {
      icon: "💬",
      title: "Discover & Support",
      text: "View photos, read reviews, check hours, and contact the business directly.",
    },
    {
      icon: "📌",
      title: "Bookmark & Share",
      text: "Save favorites, share with friends, or leave reviews to support the community.",
    },
  ];

  return (
    <div className="bg-gray-50">
      <PageHeader
        className="hiwbg md:h-[33vh] h-[150px]"
        title="How Desi Tracker Works"
        subtitle="Discover the process for both business owners and users"
      />
      <WhatsAppFloatingButton/>

      <div className="container mx-auto px-6 py-16 max-w-6xl text-center">
        {/* Mission */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-800">Our Mission</h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Desi Tracker connects and promotes diverse-owned businesses across
            the UK. We help increase visibility, customer reach, and long-term
            growth. Our mission is to foster inclusion and support local
            entrepreneurship.
          </p>
        </section>

        {/* For Business Owners */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10">
            For Business Owners (Vendors)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {businessSteps.map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* For Customers */}
        <section className="mb-20">
          <h2 className="text-2xl font-semibold text-gray-800 mb-10">
            For Customers (Users)
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {customerSteps.map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800">Get In Touch</h2>
          <p className="text-gray-600 mt-4 max-w-xl mx-auto">
            Have questions or need help? Reach out via email or our support
            page. We are here to help your business grow!
          </p>
        </section>

        {/* CTA Button */}
        <div className="mt-8">
          <Link
            href="/contact"
            className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded hover:bg-yellow-500 transition"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksComponents;
