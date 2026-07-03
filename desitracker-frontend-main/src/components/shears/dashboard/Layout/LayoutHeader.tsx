"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Profile from "../../user/Profile";
import Hamburger from "./Hamburger";

const Breadcrumb = () => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment !== "");

  return (
    <p className="flex items-center gap-x-1">
      {pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join("/")}`;

        return (
          <span key={index} className="flex items-center">
            <Link
              href={path}
              className="tracking-wider font-poppins text-sm capitalize hover:underline"
            >
              {segment.replace(/-/g, " ")}
            </Link>

            {index < pathSegments.length - 1 && <span className="ml-1">/</span>}
          </span>
        );
      })}
    </p>
  );
};

// Previous icon
const Previous = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

// Next icon
const Next = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5"
    >
      <path
        fillRule="evenodd"
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
};

const History: React.FC = () => {
  const router = useRouter();

  const handlePrevious = () => {
    router.back(); // Navigate to the previous page
  };

  const handleNext = () => {
    router.forward(); // Navigate to the next page
  };

  return (
    <div className="items-center gap-x-1 lg:flex hidden">
      <button
        type="button"
        onClick={handlePrevious}
        className="border cursor-pointer rounded-circle bg-white"
      >
        <Previous />
        <span className="sr-only">Previous</span>
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="border cursor-pointer rounded-circle bg-white"
      >
        <Next />
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
};

const LayoutHeader = () => {
  return (
    <header className="relative border-b flex justify-between items-center gap-x-4 pl-0 lg:pl-4 p-4">
      <div className="flex items-center gap-x-2.5">
        {/* Sidebar collapse content */}

        <Hamburger />
        <div>
          <Link href="/">
            <Image
              height={100}
              width={100}
              className="h-5 w-5"
              src="/logo.svg"
              alt="deshi-tracker"
              id="logo"
            />
          </Link>
        </div>

        {/* history */}
        <History />

        {/* divider */}
        <span className="border-l border-gray-400 h-4 hidden lg:block" />

        {/* path name */}
        <div className="overflow-auto scrollbar-hide">
          <Breadcrumb />
        </div>
      </div>

      <div className="flex items-center gap-x-4">
        {/* Profile */}

        <Profile />
      </div>
    </header>
  );
};

export default LayoutHeader;
