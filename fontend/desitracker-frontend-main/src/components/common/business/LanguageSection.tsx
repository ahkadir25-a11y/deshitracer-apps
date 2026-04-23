import { FaLanguage } from "react-icons/fa6";
import { motion } from "framer-motion";

const LanguageSection = ({ official, second, homeTown }: { official: string; second: string, homeTown: string }) => {
  if (!official && !second) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <FaLanguage className="text-indigo-500" />
        <h2 className="text-xl font-semibold text-gray-800">Languages Spoken</h2>
      </div>

      <motion.div
        className="flex flex-col gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {official && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Primary Language:</span>
            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
              {official}
            </span>
          </div>
        )}
        {second && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Secondary Language:</span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">
              {second}
            </span>
          </div>
        )}

        {homeTown && (
          <p>
            <span className="text-gray-600">Home Town:</span> {homeTown}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default LanguageSection;
