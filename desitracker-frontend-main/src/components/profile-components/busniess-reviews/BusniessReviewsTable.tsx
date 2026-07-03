"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import DynamicTable from "@/components/shears/table/DynamicTable";
import React, { useState } from "react";
import { reviewsColumns } from "./reviewsColumns";

interface TableProps {
  businessReviews: any;
  sorting?: { [key: string]: "asc" | "desc" };
  setSorting?: (sorting: { [key: string]: "asc" | "desc" }) => void;
  visibleColumns: string[];
  refetch?: () => void;
}

const BusniessReviewsTable = ({
  businessReviews,
  setSorting,
  sorting,
  visibleColumns,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = businessReviews.map((bus: any) => bus._id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === businessReviews?.length);
  };

  const handleSort = (key: string) => {
    const newSorting: { [key: string]: "asc" | "desc" } = {
      [key]: (sorting?.[key] ?? "asc") === "asc" ? "desc" : "asc",
    };
    if (setSorting) {
      setSorting(newSorting);
    }
  };

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case "businessName":
        return (
          <p className="flex items-center gap-2">
            <span
              style={{ maxWidth: "120px" }}
              className="!text-sm font-poppins font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
            >
              {row?.business?.businessName}
            </span>
          </p>
        );
      case "feedback":
        return row?.feedback ? (
          <span className="!text-sm font-poppins font-medium overflow-hidden text-ellipsis">
            {row?.feedback}
          </span>
        ) : (
          <span className="text-gray-500">No feedback</span>
        );
      case "rating":
        return row?.rating ? (
          <span className="!text-sm font-poppins font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block">
            {row?.rating}
          </span>
        ) : (
          <span className="text-gray-500">No rating</span>
        );
      // Removed "userName" column case
      // Removed "show" (visibility toggle) column case
      default:
        return null;
    }
  };

  const visibleColumnDefs = reviewsColumns
    .filter((col) => visibleColumns.includes(col.key))
    .filter((col) => col.key !== "userName" && col.key !== "show"); // Remove userName and show

  return (
    <DynamicTable
      headers={visibleColumnDefs}
      data={businessReviews}
      defaultSortKey="feedback"
      defaultSortDirection="asc"
      renderHeaderCheckbox={() => (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded cursor-pointer"
        />
      )}
      onSort={handleSort}
    >
      {(rev: any) => (
        <>
          <td className="px-3 py-1 border w-10 border-gray-200 text-sm !bg-white">
            <input
              type="checkbox"
              name="checkbox"
              id={`checkbox-${rev?._id}`}
              checked={selectedRows.has(rev?._id)}
              onChange={(e) => handleSelectRow(rev?._id, e.target.checked)}
              className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded border-[#8198A8] cursor-pointer"
            />
          </td>
          {visibleColumnDefs.map((column) => (
            <td
              key={column.key}
              className="px-4 py-2 border border-gray-200 font-poppins text-sm !bg-white"
            >
              {renderCell(rev, column.key)}
            </td>
          ))}
        </>
      )}
    </DynamicTable>
  );
};

export default BusniessReviewsTable;
