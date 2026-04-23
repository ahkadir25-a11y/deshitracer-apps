/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { subCategoryColumns } from "./sub-category-columns";
import toast from "react-hot-toast";
import { useDeleteSubCategoryMutation } from "@/app/redux/services/sub-categories.services";
import TableActionButton from "@/components/shears/table/TableActionButton";
import DynamicTable from "@/components/shears/table/DynamicTable";
import UpdateSubCategoryMotal from "./UpdateSubCategoryMotal";

import { TSubCategory } from "./sub-category";
import { BiCategory } from "react-icons/bi";
import { RiDeleteBinLine } from "react-icons/ri";
interface TableProps {
  subCategores: TSubCategory[];
  sorting: { [key: string]: "asc" | "desc" };
  setSorting: (sorting: { [key: string]: "asc" | "desc" }) => void;
  visibleColumns: string[];
  refetch: () => void;
}
const actionItems = [
  {
    id: "update-subCategores",
    name: "Update Sub Categores",
    icon: <BiCategory size={16} />,
  },
  {
    id: "delete-subCategores",
    name: "Delete Sub Categores",
    icon: <RiDeleteBinLine size={16} />,
  },
];
const SubCategoryTable = ({
  subCategores,
  setSorting,
  sorting,
  refetch,
  visibleColumns,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isOpenUpdateModal, setOpenUpdateModal] = useState(false);
  const [subCategorySlug, setSubCategorySlug] = useState("");

  const [deleteSubCategory] = useDeleteSubCategoryMutation();

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = subCategores?.map((bus: any) => bus._id);
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
    setSelectAll(newSelected.size === subCategores?.length);
  };

  const handleSort = (key: string) => {
    const newSorting: { [key: string]: "asc" | "desc" } = {
      [key]: sorting[key] === "asc" ? "desc" : "asc",
    };
    setSorting(newSorting);
  };

  // Move to Trash Logic
  const handleMoveToTrash = async (subCategorySlug: string) => {
    try {
      // Call the deleteCategory mutation
      await deleteSubCategory(subCategorySlug).unwrap(); // Ensure unwrap() is used to throw an error if mutation fails
      toast.success("Category moved to trash successfully!");

      // Refetch the data after deletion
      refetch();
    } catch (error) {
      toast.error("Failed to move category to trash.");
      console.error(error);
    }
  };

  const handleTableAction = (id: string, subCategorySlug: string) => {
    if (id === "update-subCategores") {
      setSubCategorySlug(subCategorySlug);
      setOpenUpdateModal(!isOpenUpdateModal);
    } else if (id === "delete-subCategores") {
      handleMoveToTrash(subCategorySlug);
    }
  };
  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return (
          <p className="flex items-center gap-2">
            {/* <ProfilePhoto url={row.profilePic} /> */}
            <span
              style={{ maxWidth: "120px" }}
              className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
            >
              {row?.name}
            </span>
          </p>
        );
      case "slug":
        return row?.slug ? (
          <span className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block">
            {row?.slug}
          </span>
        ) : (
          <span className="text-gray-500">No Slug</span>
        );
      case "details":
        return row?.details ? (
          <button
            // onClick={() => handleEmailClick(row?.owner?.email)}
            className="!text-sm font-poppins cursor-pointer  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
          >
            {row?.details}
          </button>
        ) : (
          <span className="text-gray-500">No details</span>
        );
      case "categories":
        return row?.parentCategory ? (
          <button
            // onClick={() => handleEmailClick(row?.owner?.email)}
            className="!text-sm font-poppins cursor-pointer font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
          >
            {row?.parentCategory?.name}
          </button>
        ) : (
          <span className="text-gray-500">No Subcategories</span>
        );

      default:
        return null;
    }
  };
  const visibleColumnDefs = subCategoryColumns.filter((col) =>
    visibleColumns.includes(col.key)
  );
  return (
    <>
      <UpdateSubCategoryMotal
        isOpen={isOpenUpdateModal}
        onClose={() => setOpenUpdateModal(false)}
        onSuccess={() => {
          refetch();
          setOpenUpdateModal(false);
        }}
        subCategorySlug={subCategorySlug}
      />
      <DynamicTable
        headers={visibleColumnDefs}
        data={subCategores}
        defaultSortKey="subCategoryName"
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
        {(subCate: any) => (
          <>
            <td className="px-3 py-1 border w-10 border-gray-200 text-sm !bg-white">
              <input
                type="checkbox"
                name="checkbox"
                id={`checkbox-${subCate?._id}`}
                checked={selectedRows.has(subCate?._id)}
                onChange={(e) =>
                  handleSelectRow(subCate?._id, e.target.checked)
                }
                className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded border-[#8198A8] cursor-pointer"
              />
            </td>
            {visibleColumnDefs.map((column) => (
              <td
                key={column.key}
                className="px-4 py-2 border border-gray-200 font-poppins text-sm !bg-white"
              >
                {renderCell(subCate, column.key)}
              </td>
            ))}
            <td className="px-2 py-1 w-14 border border-gray-200">
              <TableActionButton
                actionItems={actionItems}
                handleAction={(id) => handleTableAction(id, subCate?.slug)}
              />
            </td>
          </>
        )}
      </DynamicTable>
    </>
  );
};

export default SubCategoryTable;
