"use client";
import React from "react";
import { motion } from "framer-motion";
import PageHeader from "@/components/shears/page-header/PageHeader";

// Privacy Policy Component
const PrivacyPolicy: React.FC = () => {
    return (
        <div className="">
            <PageHeader
                className="listingBg md:h-[30vh]  h-[150px] "
                title="Privacy Policy"
                subtitle="Who we are & our mission"
            />
            <motion.div
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ duration: 1 }}
                className="space-y-6 container mx-auto p-5"
            >
                <section>
                    <h2 className="text-2xl text-gray-800">1. Information We Collect</h2>
                    <p className="text-gray-700">
                        We collect personal information such as your name, email address,
                        and review data when you sign up as a user or business owner on our
                        platform. Business owners may also submit business-related
                        information, which will be subject to review by our admin team.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">2. How We Use Your Information</h2>
                    <p className="text-gray-700">
                        We use the collected information to:
                        <ul className="list-disc list-inside mt-2">
                            <li>Provide and improve our services</li>
                            <li>Allow users and business owners to submit reviews</li>
                            <li>Allow admins to approve or reject businesses and users</li>
                            <li>Send relevant updates and notifications related to your account</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">3. Sharing Your Information</h2>
                    <p className="text-gray-700">
                        We do not sell or share your personal information with third parties
                        without your consent, except as required by law or to facilitate
                        necessary services provided by our platform (e.g., payment processors).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">4. Data Security</h2>
                    <p className="text-gray-700">
                        We take reasonable precautions to protect your personal data from
                        unauthorized access, alteration, or destruction. However, no data
                        transmission over the internet is 100% secure, and we cannot guarantee
                        the absolute security of your data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">5. User Rights</h2>
                    <p className="text-gray-700">
                        You have the right to:
                        <ul className="list-disc list-inside mt-2">
                            <li>Access the personal information we hold about you</li>
                            <li>Request corrections or updates to your personal information</li>
                            <li>Request the deletion of your account and personal data</li>
                        </ul>
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">6. Admin Rights</h2>
                    <p className="text-gray-700">
                        As an admin, you have the right to approve or reject businesses and
                        user reviews submitted on the platform. Admins are responsible for
                        ensuring that the reviews and businesses comply with our terms of service
                        and privacy policies.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">7. Changes to This Policy</h2>
                    <p className="text-gray-700">
                        We may update this Privacy Policy from time to time. Any changes will
                        be posted on this page, and you will be notified of any significant changes.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl text-gray-800">8. Contact Us</h2>
                    <p className="text-gray-700">
                        If you have any questions or concerns about our Privacy Policy, feel free
                        to contact us at [Your Contact Email].
                    </p>
                </section>
            </motion.div>
        </div>
    );
};

export default PrivacyPolicy;
