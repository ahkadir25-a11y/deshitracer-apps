import { TbHomeSignal } from "react-icons/tb";
import { PiUsersFourDuotone } from "react-icons/pi";
import { RiDropboxLine } from "react-icons/ri";
import { FaHome, FaShoppingBag } from "react-icons/fa";
import { MdOutlineCategory } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { IoSettingsOutline } from "react-icons/io5";
// Define the menu items with correct `label` key
export const adMenuItems = [
  {
    label: "General",
    elements: [
      {
        label: "Dashboard", // corrected typo: `lable` -> `label`
        icon: <TbHomeSignal size={22} />,
        path: "/admin/dashboard",
        status: "unlocked",
      },
      {
        label: "Users", // corrected typo: `lable` -> `label`
        icon: <PiUsersFourDuotone size={22} />,
        path: "/admin/users",
        status: "unlocked",
      },
      {
        label: "Business", // corrected typo: `lable` -> `label`
        icon: <RiDropboxLine size={22} />,
        path: "/admin/business",
        status: "unlocked",
      },
      {
        label: "Categorie's", // corrected typo: `lable` -> `label`
        icon: <MdOutlineCategory size={22} />,
        path: "/admin/categories",
        status: "unlocked",
      },
      {
        label: "Sub Categorie's", // corrected typo: `lable` -> `label`
        icon: <BiCategory size={22} />,
        path: "/admin/sub-categories",
        status: "unlocked",
      },
      {
        label: "Members", // corrected typo: `lable` -> `label`
        icon: <MdOutlineCategory size={22} />,
        path: "/admin/member",
        status: "unlocked",
      },
    ],
  },
  {
    label: "Settings",
    elements: [
      {
        label: "Slider", // corrected typo: `lable` -> `label`
        icon: <FaHome size={22} />,
        path: "/admin/settings/sliders",
      },
      {
        label: "Tags", // corrected typo: `lable` -> `label`
        icon: <FaShoppingBag size={22} />,
        path: "/admin/settings/tags",
      },
      {
        label: "Settings", // corrected typo: `lable` -> `label`
        icon: <IoSettingsOutline size={22} />,
        path: "/admin/settings/basic",
      },
    ],
  },
];

export const ownerMenuItems = [
  {
    label: "Main",
    elements: [
      {
        label: "Edit Profile",
        icon: <PiUsersFourDuotone size={22} />,
        path: "/profile/edit",
      },
      {
        label: "Add Product",
        icon: <RiDropboxLine size={22} />,
        path: "/profile/my-products/create",
      },
      {
        label: "My Product",
        icon: <FaShoppingBag size={22} />,
        path: "/profile/my-products",
      },
      {
        label: "Order",
        icon: <FaShoppingBag size={22} />,
        path: "/profile/orders",
      },
      {
        label: "Opening Hours",
        icon: <TbHomeSignal size={22} />,
        path: "/profile/my-busniess", // Points to business management
      },
      {
        label: "Offer & Discount",
        icon: <BiCategory size={22} />,
        path: "/profile/day-offers",
      },
      {
        label: "Review",
        icon: <MdOutlineCategory size={22} />,
        path: "/profile/busniess-reviews",
      },
      {
        label: "Promote",
        icon: <TbHomeSignal size={22} />,
        path: "/profile/leads",
      },
      {
        label: "Rota",
        icon: <FaHome size={22} />,
        path: "/profile/rota",
      },
      {
        label: "Analyze Member",
        icon: <PiUsersFourDuotone size={22} />,
        path: "/profile/members",
      },
      {
        label: "Analysis",
        icon: <TbHomeSignal size={22} />,
        path: "/user/dashboard",
      },
      {
        label: "Content",
        icon: <IoSettingsOutline size={22} />,
        path: "/profile/my-busniess",
      },
    ],
  },
];

export const routes = ["/", "/shop", "/cart", "/checkout"];
