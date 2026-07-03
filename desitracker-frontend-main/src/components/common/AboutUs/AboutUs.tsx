// AboutUs.tsx
import WhatsAppFloatingButton from "@/app/(CommonLayout)/products/WhatsAppFloatingButton";
import PageHeader from "@/components/shears/page-header/PageHeader";
import React from "react";
const AboutUs: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PageHeader
        className="aboutUsBg md:h-[33vh] h-[150px]"
        title="About Us"
        subtitle="Who we are & our mission"
      />
      <WhatsAppFloatingButton/>

      <div className="max-w-[1000px] mx-auto px-6 py-16">
        <p className="text-lg text-gray-700 leading-8">
          Desi Tracker is a global business directory created to spotlight and support diverse and minority-owned businesses.
          The platform allows users to easily search by category, language, city, or business name, making it simple to find
          services that reflect their cultural and community needs.
        </p>
        <p className="text-lg text-gray-700 mt-6 leading-8">
          We believe in economic empowerment through representation, giving every business — big or small — a fair opportunity to grow.
          From desi restaurants and halal butchers to bilingual accountants and ethnic salons, Desi Tracker connects users with trusted,
          culturally relevant services.
        </p>
        <p className="text-lg text-gray-700 mt-6 leading-8">
          Businesses benefit by gaining visibility, expanding their customer base, and building trust through verified listings and
          community engagement. Users enjoy access to authentic, reliable services that understand their background and preferences.
        </p>
        <p className="text-lg text-gray-700 mt-6 leading-8">
          We also aim to support local events, collaborations, and promotions through the platform. Desi Tracker exists to bridge the
          gap between diverse businesses and the communities they serve.
        </p>
        <p className="text-lg text-gray-700 mt-6 leading-8 font-medium">
          Our mission is to foster trust, visibility, and economic unity across cultures.
          Our vision is to become the number one platform where diversity in business is celebrated, supported, and successful.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
