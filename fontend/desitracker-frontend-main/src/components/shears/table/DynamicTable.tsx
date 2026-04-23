"use client";

import React, { useState } from "react";
import { RiExpandUpDownFill } from "react-icons/ri";

interface TableProps<T> {
  headers: { key: string; label: string; sortable: boolean; sortKey: string }[];
  data: T[];
  children: (item: T, index?: number) => React.ReactNode;
  defaultSortKey: string;
  defaultSortDirection: "asc" | "desc";
  renderHeaderCheckbox?: () => React.ReactNode;
  onSort: (key: string, direction: "asc" | "desc") => void;
}

function DynamicTable<T>({
  headers,
  data,
  children,
  defaultSortKey,
  defaultSortDirection = "asc",
  onSort,
  renderHeaderCheckbox,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc";
  }>({
    key: defaultSortKey,
    direction: defaultSortDirection,
  });

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      onSort(key, direction); // Pass direction to parent
      return { key, direction };
    });
  };

  // Sort data based on sortConfig
  const sortedData = React.useMemo(() => {
    if (sortConfig.key === null) return data;
    return [...data]?.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [data, sortConfig]);

  return (
    <div className="h-full w-full overflow-auto rounded">
      <table className="table-auto w-full border-collapse border border-gray-300 ">
        {/* Table Header */}
        <thead className="bg-white z-10">
          <tr>
            {renderHeaderCheckbox && (
              <th className="py-2">{renderHeaderCheckbox()}</th>
            )}
            {headers?.map((header) => (
              <th
                key={header.key}
                className="px-4 py-2 border border-gray-300 text-start text-sm font-poppins font-normal"
              >
                {header.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(header.sortKey)}
                    className="flex cursor-pointer items-center justify-start w-full gap-x-2"
                  >
                    <span className="whitespace-nowrap">{header.label}</span>
                    <RiExpandUpDownFill />
                  </button>
                ) : (
                  header.label
                )}
              </th>
            ))}
            <th className="pl-3 pr-2 py-2 border border-gray-300 font-poppins font-normal text-sm whitespace-nowrap text-left">
              <span>Action</span>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {sortedData?.map((row, index) => (
            <tr key={index}>{children(row, index)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DynamicTable;
