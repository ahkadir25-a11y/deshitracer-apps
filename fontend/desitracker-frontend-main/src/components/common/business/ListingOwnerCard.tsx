import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";

interface OwnerInfoProps {
  name: string;
  profilePic?: string;
  createdAt: string;
}

const ListingOwnerCard: React.FC<OwnerInfoProps> = ({ name, profilePic, createdAt }) => {
  const [imageError, setImageError] = useState(false);
  console.log(createdAt)
  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-md mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Listing Created By</h2>
      </div>

      <div className="flex items-start gap-4">
        {profilePic && !imageError ? (
          <Image
            src={profilePic}
            alt="Owner"
            width={64}
            height={64}
            onError={() => setImageError(true)}
            className="rounded-full object-cover w-16 h-16 border"
          />
        ) : (
          <FaUserCircle className="text-gray-400 w-16 h-16" />
        )}

        <div>
          <p className="text-md font-medium text-gray-800">{name}</p>
          {/* <p className="text-xs text-gray-500 mt-1">{createdAt}</p> */}
        </div>
      </div>
    </motion.div>
  );
};

export default ListingOwnerCard;
