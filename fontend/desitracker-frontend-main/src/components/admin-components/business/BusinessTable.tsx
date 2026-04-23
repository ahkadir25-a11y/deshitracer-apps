"use client";
import ToggleButton from "@/components/shears/button/ToggleButton";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import toast from "react-hot-toast";
import { businessColumns } from "./businessColumns";
import TableActionButton from "@/components/shears/table/TableActionButton";
import DynamicTable from "@/components/shears/table/DynamicTable";
import {
  useDeleteBusinessMutation,
  useUpdateBusinessMutation,
} from "@/app/redux/services/business.services";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineBusiness } from "react-icons/md";
import { useRouter } from "next/navigation";
interface TableProps {
  business: any;
  sorting: { [key: string]: "asc" | "desc" };
  setSorting: (sorting: { [key: string]: "asc" | "desc" }) => void;
  visibleColumns: string[];
  refetch: () => void;
}

const actionItems = [
  {
    id: "view-business",
    name: "View Business",
    icon: <MdOutlineBusiness size={16} />,
  },
  {
    id: "delete-business",
    name: "Delete Business",
    icon: <RiDeleteBinLine size={16} />,
  },
];
const BusinessTable = ({
  business,
  setSorting,
  sorting,
  refetch,
  visibleColumns,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteBusiness] = useDeleteBusinessMutation();
  const [updateBusiness] = useUpdateBusinessMutation();
  const router = useRouter();
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = business.map((bus: any) => bus._id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };

  // Individual Row Selection Logic
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === business?.length);
  };
  // Render Cell Based on Column Key
  const handleToggle = async (bol: boolean, slug: string, owner: string) => {
    try {
      // Create the input object with the updated field
      const input = {
        isActive: bol,
        owner: owner,
      };

      // Call the mutation to update the business
      await updateBusiness({
        slug, // Assuming 'slug' is the unique identifier for the business
        updatedBusinessData: input,
      }).unwrap(); // unwrap() to handle success and error properly

      toast.success("Business updated successfully!");
    } catch (error) {
      toast.error("Error updating isBlocked.");
      console.error("Error updating isBlocked:", error);
    }
  };

  const handleSort = (key: string) => {
    const newSorting: { [key: string]: "asc" | "desc" } = {
      [key]: sorting[key] === "asc" ? "desc" : "asc",
    };
    setSorting(newSorting);
  };
  // Handle Email Click
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Move to Trash Logic
  const handleMoveToTrash = async (businessSlug: string) => {
    try {
      // Call the delete business mutation
      await deleteBusiness(businessSlug).unwrap(); // `unwrap()` will throw an error if the mutation fails
      toast.success("Business moved to trash successfully!");

      // Refetch the data after deletion
      refetch();
    } catch (error) {
      toast.error("Failed to move business to trash.");
      console.error(error);
    }
  };
  const handleTableAction = (id: string, businessSlug: string) => {
    if (id === "view-business") {
      router.push(
        `/business-details/${businessSlug}`)
    } else if (id === "delete-business") {
      handleMoveToTrash(businessSlug);
    }
  };

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case "businessName":
        return (
          <p className="flex items-center gap-2">
            {/* <ProfilePhoto url={row.profilePic} /> */}
            <span
              style={{ maxWidth: "120px" }}
              className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
            >
              {row?.businessName}
            </span>
          </p>
        );
      case "category":
        return row?.category ? (
          <span className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block">
            {row?.category?.name}
          </span>
        ) : (
          <span className="text-gray-500">No Category</span>
        );
      case "subCategory":
        return row?.category ? (
          <span className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block">
            {row?.subCategory?.name}
          </span>
        ) : (
          <span className="text-gray-500">No Category</span>
        );
      case "owner":
        return row?.owner ? (
          <button
            onClick={() => handleEmailClick(row?.owner?.email)}
            className="text-sm text-[#017BFE] cursor-pointer"
          >
            {row?.owner?.name}
          </button>
        ) : (
          <span className="text-gray-500">No Email</span>
        );
      //   case "subCategory":
      //     return <span className="text-sm">{row?.subCategories. || "-"}</span>;

      case "isActive":
        return (
          <div className="flex items-center gap-2">
            <ToggleButton
              toggleValue={row?.isActive}
              onToggle={(bol: boolean) => {
                handleToggle(bol, row?.slug, row?.owner?._id);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };
  const visibleColumnDefs = businessColumns.filter((col) =>
    visibleColumns.includes(col.key)
  );
  return (
    <DynamicTable
      headers={visibleColumnDefs}
      data={business}
      defaultSortKey="businessName"
      defaultSortDirection="asc"
      renderHeaderCheckbox={() => (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="form-checkbox focus:ring-0 focus:ring-offset-0  rounded cursor-pointer"
        />
      )}
      onSort={handleSort}
    >
      {(bus: any) => (
        <>
          <td className="px-3 py-1 border w-10 border-gray-200 text-sm !bg-white">
            <input
              type="checkbox"
              name="checkbox"
              id={`checkbox-${bus?._id}`}
              checked={selectedRows.has(bus?._id)}
              onChange={(e) => handleSelectRow(bus?._id, e.target.checked)}
              className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded border-[#8198A8] cursor-pointer"
            />
          </td>
          {visibleColumnDefs.map((column) => (
            <td
              key={column.key}
              className="px-4 py-2 border border-gray-200 font-poppins text-sm !bg-white"
            >
              {renderCell(bus, column.key)}
            </td>
          ))}
          <td className="px-2 py-1 w-14 border border-gray-200">
            <TableActionButton
              actionItems={actionItems}
              handleAction={(id) => handleTableAction(id, bus?.slug)}
            />
          </td>
        </>
      )}
    </DynamicTable>
  );
};

export default BusinessTable;
