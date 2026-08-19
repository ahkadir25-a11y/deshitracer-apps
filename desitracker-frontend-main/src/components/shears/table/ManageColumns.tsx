"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import Sortable from "sortablejs";
import { TbColumns } from "react-icons/tb";
import OutsideClick from "../OutsideClick";

interface ManageColumnsProps {
  columns: {
    key: string;
    label: string;
    sortable: boolean;
  }[];
  onVisibilityChange?: (visibleColumns: string[]) => void;
}

const ManageColumns: React.FC<ManageColumnsProps> = ({
  columns: initialColumns,
  onVisibilityChange,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const sortableContainerRef = useRef<HTMLDivElement | null>(null);
  const sortableRef = useRef<Sortable | null>(null);

  const [columns, setColumns] = useState(initialColumns);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    initialColumns?.map((col) => col.key)
  );
  const memoizedColumns = useMemo(() => columns, [columns]);

  useEffect(() => {
    setColumns(initialColumns);
    setVisibleColumns(initialColumns?.map((col) => col.key));
  }, [initialColumns]);

  useEffect(() => {
    if (sortableContainerRef.current && isVisible) {
      if (sortableRef.current) {
        sortableRef.current.destroy();
      }

      sortableRef.current = new Sortable(sortableContainerRef.current, {
        animation: 150,
        draggable: ".column-item",
        handle: ".drag-handle",
        onEnd: (evt: any) => {
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;

          if (
            typeof oldIndex !== "undefined" &&
            typeof newIndex !== "undefined"
          ) {
            setColumns((prevColumns) => {
              const newColumns = [...prevColumns];
              const [removed] = newColumns.splice(oldIndex, 1);
              if (!removed) return prevColumns;
              newColumns.splice(newIndex, 0, removed);

              const newOrder = newColumns.map((col) => col.key);
              setVisibleColumns(newOrder);
              onVisibilityChange?.(newOrder);

              return newColumns;
            });
          }
        },
      });
    }

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [isVisible, onVisibilityChange]);

  const handleCheckboxChange = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const newVisibleColumns = prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey];

      onVisibilityChange?.(newVisibleColumns);
      return newVisibleColumns;
    });
  };

  return (
    <main className="relative space-y-2">
      <button
        type="button"
        ref={buttonRef}
        className={`flex gap-x-2 cursor-pointer items-center font-poppins text-sm border border-gray-300 bg-white px-4 py-2 rounded whitespace-nowrap ${
          isVisible ? "border-[#017BFE]" : ""
        }`}
        onClick={() => setIsVisible((prev) => !prev)}
      >
        <TbColumns size={20} className="text-" />
        Manage Columns
      </button>

      {isVisible && (
        <OutsideClick
          targetedElement={buttonRef}
          onOutsideClick={() => setIsVisible(false)}
          className="absolute top-full right-0 h-fit w-48 p-2 bg-white rounded shadow z-20 overflow-y-auto space-y-3"
        >
          <div
            ref={sortableContainerRef}
            className="h-full w-full flex flex-col"
          >
            {memoizedColumns.map((column) => (
              <div
                key={column.key}
                className="column-item flex justify-between items-center gap-x-4 p-2 hover:bg-base/5 rounded"
              >
                <label
                  htmlFor={column.key}
                  className="flex gap-x-2 items-center whitespace-nowrap cursor-pointer font-poppins text-sm select-none"
                >
                  <input
                    type="checkbox"
                    name={column.key}
                    id={column.key}
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => handleCheckboxChange(column.key)}
                    className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded checked:text-base"
                  />
                  {column.label}
                </label>

                <div className="drag-handle cursor-move text-[#017BFE]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-grip size-4"
                  >
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="19" cy="5" r="1" />
                    <circle cx="5" cy="5" r="1" />
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                    <circle cx="12" cy="19" r="1" />
                    <circle cx="19" cy="19" r="1" />
                    <circle cx="5" cy="19" r="1" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </OutsideClick>
      )}
    </main>
  );
};

export default ManageColumns;
