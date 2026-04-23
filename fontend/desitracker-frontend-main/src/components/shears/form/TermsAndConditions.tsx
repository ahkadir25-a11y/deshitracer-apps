import React, { useRef } from "react";
interface TermsAndConditionsProps {
    accepted: boolean;
    setAgreeToTermsConditions: (value: boolean) => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
    accepted,
    setAgreeToTermsConditions,
}) => {
    const termsRef = useRef<HTMLDivElement>(null);


    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgreeToTermsConditions(e.target.checked);
    };

    return (
        <div className="text-sm text-gray-700 leading-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Terms and Conditions for Business Registration on Desi Tracker
            </h1>

            {/* Scrollable container */}
            <div
                ref={termsRef}
                className="max-h-[400px] overflow-y-auto p-4 border border-gray-200 rounded-md mb-6"
            >
                <p className="mb-4 font-medium">Effective Date:</p>

                <p className="mb-6">
                    Welcome to Desi Tracker (“we”, “us”, “our”), a platform dedicated to
                    listing and promoting diverse businesses globally. By registering your
                    business on Desi Tracker, you agree to comply with and be bound by the
                    following terms and conditions:
                </p>

                <ol className="list-decimal list-inside space-y-6">
                    <li>
                        <strong>Eligibility</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>Be the owner or an authorized representative of the business.</li>
                            <li>Provide accurate, truthful, and complete information during registration.</li>
                            <li>Ensure your business complies with local laws and regulations.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Business Information</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>You agree to keep your business details up to date.</li>
                            <li>
                                Desi Tracker reserves the right to verify any information provided and to approve or reject listings at its sole discretion.
                            </li>
                        </ul>
                    </li>

                    <li>
                        <strong>Listing Approval</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>Listings are subject to review before going live.</li>
                            <li>
                                Approval is not guaranteed and may be denied if your business does not align with Desi Tracker’s vision of supporting diverse, ethical, and inclusive businesses.
                            </li>
                        </ul>
                    </li>

                    <li>
                        <strong>Content Usage</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>
                                By registering, you grant Desi Tracker the right to display your business name, logo, photos, and contact details on our platform and in our promotional materials.
                            </li>
                            <li>You must ensure all content provided is owned by you or properly licensed.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Prohibited Businesses</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>Promote illegal activities.</li>
                            <li>Violate intellectual property rights.</li>
                            <li>Discriminate based on race, religion, gender, or orientation.</li>
                            <li>Engage in unethical or misleading practices.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Account Termination</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>False or misleading information is provided.</li>
                            <li>Terms and conditions are violated.</li>
                            <li>The business harms the reputation or operations of Desi Tracker.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>No Guarantee of Results</strong>
                        <p className="mt-2">
                            Desi Tracker promotes listed businesses, but we do not guarantee increased traffic, sales, or customer engagement.
                        </p>
                    </li>

                    <li>
                        <strong>Limitation of Liability</strong>
                        <ul className="list-disc list-inside ml-5 mt-2 space-y-1">
                            <li>Business performance or service quality.</li>
                            <li>Interactions between users and listed businesses.</li>
                            <li>Third-party services linked through Desi Tracker.</li>
                        </ul>
                    </li>

                    <li>
                        <strong>Modifications to Terms</strong>
                        <p className="mt-2">
                            We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.
                        </p>
                    </li>

                    <li>
                        <strong>Governing Law</strong>
                        <p className="mt-2">These Terms are governed by the laws of the United Kingdom.</p>
                    </li>
                </ol>
            </div>

            {/* Accept terms checkbox */}
            <div className="flex items-center space-x-2 mb-4">
                <input
                    type="checkbox"
                    id="accept"
                    checked={accepted}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="accept" className="text-gray-700">
                    I have read and agree to the Terms and Conditions
                </label>
            </div>

        </div>
    );
};

export default TermsAndConditions;
