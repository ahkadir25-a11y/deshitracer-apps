import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { PiSignInLight } from "react-icons/pi";

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 },
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="md:hidden p-2 text-white z-50 relative"
        aria-label="Toggle Sidebar"
      >
        {isOpen ? <HiX size={30} /> : <HiMenuAlt3 size={30} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-80 z-40"
              onClick={() => setIsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sidebar */}
            <motion.div
              ref={sidebarRef}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-lg px-3 py-8"
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <nav className="flex flex-col space-y-6 text-gray-800 font-medium">
                <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-[#222] transition">
                  Home
                </Link>
                <Link href="/business" onClick={() => setIsOpen(false)} className="hover:text-[#222] transition">
                  Find Business
                </Link>
                <Link href="/about-us" onClick={() => setIsOpen(false)} className="hover:text-[#222] transition">
                  About Us
                </Link>
                <Link href="/how-it-works" onClick={() => setIsOpen(false)} className="hover:text-[#222] transition">
                  How It Works
                </Link>


                {/* Call-to-action button */}
                <Link
                  href="/auth/signin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between bg-[#222] text-white rounded px-4 py-2 hover:bg-blue-700 transition"
                >
                  <div className="flex flex-col text-sm">
                    <span>For listing business</span>
                    <span className="text-xs opacity-80">Sign up/ Sign In</span>
                  </div>
                  <div className="p-2 rounded-full bg-white text-[#222]">
                    <PiSignInLight size={20} />
                  </div>
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
