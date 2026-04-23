import {
  FaPhoneAlt,
  FaLink,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaMailBulk,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

interface ContactInfo {
  phoneNumber?: string;
  websiteUrl?: string;
  email?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

const BusinessContactCard = ({ contact }: { contact: ContactInfo }) => {
  if (!contact) return null;

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <FaMapMarkerAlt className="text-rose-500" />
        <h2 className="text-xl font-semibold text-gray-800">Contact & Social Info</h2>
      </div>

      {/* Contact Info */}
      <div className="space-y-3 text-sm text-gray-700 mb-6">
        {contact?.phoneNumber && (
          <div className="flex items-center gap-2">
            <FaPhoneAlt className="text-gray-400" />
            <Link href={`tel:${contact.phoneNumber}`} className="text-lime-600 hover:underline">
              {contact.phoneNumber}
            </Link>
          </div>
        )}
        {contact?.websiteUrl && (
          <div className="flex items-center gap-2">
            <FaLink className="text-gray-400" />
            <Link
              href={contact.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-600 hover:underline"
            >
              {contact.websiteUrl}
            </Link>
          </div>
        )}
        {contact?.email && (
          <div className="flex items-center gap-2">
            <FaEnvelope className="text-gray-400" />
            <Link href={`mailto:${contact.email}`} className="text-lime-600 hover:underline">
              {contact.email}
            </Link>
          </div>
        )}
      </div>

      {/* Social Media */}
      <div className="flex flex-wrap gap-3">
        {contact?.facebook && (
          <a
            href={contact.facebook}
            className="bg-[#222] p-3 rounded-full text-white hover:bg-blue-700 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
        )}
        {contact?.twitter && (
          <a
            href={contact.twitter}
            className="bg-sky-400 p-3 rounded-full text-white hover:bg-sky-500 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
        )}
        {contact?.instagram && (
          <a
            href={contact.instagram}
            className="bg-pink-500 p-3 rounded-full text-white hover:bg-pink-600 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        )}
        {contact?.linkedin && (
          <a
            href={contact.linkedin}
            className="bg-blue-800 p-3 rounded-full text-white hover:bg-blue-900 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
        )}
        {contact?.email && (
          <a
            href={`mailto:${contact.email}`}
            className="bg-yellow-500 p-3 rounded-full text-white hover:bg-yellow-600 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaMailBulk />
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default BusinessContactCard;
