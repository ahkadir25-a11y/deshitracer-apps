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

export const routes = ["/", "/shop", "/cart", "/checkout"];
