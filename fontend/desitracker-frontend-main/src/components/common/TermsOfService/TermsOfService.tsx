"use client";
import React from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/shears/page-header/PageHeader";

// Terms of Service Component
const TermsOfService: React.FC = () => {
  return (
    <div >
      <PageHeader
        className="listingBg md:h-[30vh]  h-[150px] "
        title="Terms of Service"
        subtitle=""
      />
      <motion.div
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ duration: 1 }}
        className="space-y-6 container mx-auto p-6"
      >
        <section>
          <h2 className="text-2xl text-gray-800">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to [Your Company Name]. These Terms of Service govern your use
            of our website and services. By accessing or using our services, you agree
            to comply with these terms. If you do not agree to these terms, please refrain
            from using our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">2. User Registration</h2>
          <p className="text-gray-700">
            To access certain features of the platform, users must create an account. You
            agree to provide accurate and complete information during the registration process.
            You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">3. Use of Services</h2>
          <p className="text-gray-700">
            You agree to use our services only for lawful purposes and in accordance with these
            Terms of Service. You shall not engage in any activities that violate any laws or
            infringe on the rights of others.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">4. User-Generated Content</h2>
          <p className="text-gray-700">
            You are solely responsible for any content you submit, post, or share on our platform.
            By submitting content, you grant [Your Company Name] a non-exclusive, royalty-free
            license to use, display, and distribute such content as necessary to provide our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">5. Prohibited Activities</h2>
          <p className="text-gray-700">
            You agree not to engage in the following prohibited activities:
            <ul className="list-disc list-inside mt-2">
              <li>Illegal activities or transactions</li>
              <li>Impersonating others or using false information</li>
              <li>Spamming, phishing, or distributing harmful software</li>
              <li>Engaging in abusive, harassing, or discriminatory behavior</li>
              <li>Violating the intellectual property rights of others</li>
            </ul>
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">6. Termination of Account</h2>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate your account if we believe you have violated
            these Terms of Service. You may also terminate your account at any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">7. Limitation of Liability</h2>
          <p className="text-gray-700">
            To the fullest extent permitted by law, [Your Company Name] is not responsible for any
            direct, indirect, incidental, or consequential damages arising from the use or inability to
            use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">8. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold harmless [Your Company Name], its affiliates, and employees
            from any claims, damages, liabilities, and expenses arising from your use of our services or
            violation of these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">9. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms of Service from time to time. Any changes will be posted on this page,
            and you will be notified of any significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl text-gray-800">10. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions or concerns about these Terms of Service, please contact us at
            [Your Contact Email].
          </p>
        </section>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
