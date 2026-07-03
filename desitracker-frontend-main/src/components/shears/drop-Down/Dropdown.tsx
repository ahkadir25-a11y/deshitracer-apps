import { useState, useRef, useEffect } from "react";
import { IoCloseOutline } from "react-icons/io5";
import { TiArrowSortedDown } from "react-icons/ti";

export interface DropdownItem {
  id: string | number;
  label: string;
}

interface DropdownProps<T extends DropdownItem> {
  items: T[];
  placeholder?: string;
  searchPlaceholder?: string;
  onSelect: (item: T | null) => void;
  selectedItem?: DropdownItem | null;
  label?: string;
  required?: boolean;
}

export function Dropdown<T extends DropdownItem>({
  items,
  placeholder = "Select an item",
  searchPlaceholder = "Search...",
  onSelect,
  selectedItem,
  label = "",
  required,
}: DropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - dropdownRect.bottom;
      const spaceAbove = dropdownRect.top;

      if (menuHeight > spaceBelow && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);
  return (
    <div className="relative !cursor-pointer w-full" ref={dropdownRef}>
      {label && (
        <label className="mb-1 text-xs font-medium text-gray-600">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <button
        type="button"
        className="w-full border cursor-pointer border-gray-200 bg-white px-3 py-2 text-sm rounded-md flex justify-between items-center transition focus:outline-none focus:ring-1 focus:ring-blue-400 hover:border-blue-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="truncate p-1 text-xs text-left text-gray-700 font-poppins">
          {selectedItem ? selectedItem.label : placeholder}
        </p>
        {!selectedItem && (
          <div>
            <TiArrowSortedDown
              className={`ml-2 text-gray-500 !cursor-pointer transition-transform duration-200 ${isOpen ? "rotate-180 text-" : ""}`}
              size={18}
            />
          </div>
        )}
        {selectedItem && (
          <button
            type="button"
            className="text-red-500 !cursor-pointer text-lg ml-2"
            onClick={() => {
              onSelect(null);
            }}
          >
            <IoCloseOutline size={24} />
          </button>
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute z-10 w-full  bg-white rounded-md shadow-[2px_2px_10px_0px] shadow-gray-300 ${openUpward ? "bottom-[75%] " : "top-full "
            }`}
        >
          <div className="p-2">
            <input
              type="search"
              className="w-full border px-3 py-2 !bg-white focus:bg-white focus:!outline-none focus:ring-0 !rounded text-xs md:text-sm xl:text-sm font-normal font-poppins !border-[#DEE4E8] outline-none transition-colors duration-300"
              placeholder={searchPlaceholder}
              value={searchTerm}
              required={required}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ul className="max-h-52 overflow-y-auto px-2 space-y-1 pb-2">
            {items
              .filter((item) =>
                item.label.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item) => (
                <li
                  key={item.id}
                  onClick={() => (onSelect(item), setIsOpen(false))}
                  className={`flex items-center gap-4 px-2 py-2 rounded-md cursor-pointer 
                        ${selectedItem && selectedItem.id === item.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <span className="text-sm font-poppins text-gray-500">
                    {item.label}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
