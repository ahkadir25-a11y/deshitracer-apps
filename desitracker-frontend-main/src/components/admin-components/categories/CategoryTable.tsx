/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { categoryColumns } from "./categoryColumns";
import TableActionButton from "@/components/shears/table/TableActionButton";
import DynamicTable from "@/components/shears/table/DynamicTable";
import { useDeleteCategoryMutation } from "@/app/redux/services/categories.services";
import UpdateCategoryModal from "./UpdateCategoryModal";

import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineCategory } from "react-icons/md";

interface TableProps {
  category: any;
  sorting: { [key: string]: "asc" | "desc" };
  setSorting: (sorting: { [key: string]: "asc" | "desc" }) => void;
  visibleColumns: string[];
  refetch: () => void;
}
const actionItems = [
  {
    id: "update-categores",
    name: "Update Categores",
    icon: <MdOutlineCategory size={16} />,
  },
  {
    id: "delete-category",
    name: "Delete Categores",
    icon: <RiDeleteBinLine size={16} />,
  },
];
const CategoryTable = ({
  category,
  setSorting,
  sorting,
  refetch,
  visibleColumns,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [deleteCategory] = useDeleteCategoryMutation();
  const [isOpenUpdateModal, setOpenUpdateModal] = useState(false);
  const [categorySlug, setCategorySlug] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = category.map((bus: any) => bus._id);
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
    setSelectAll(newSelected.size === category?.length);
  };

  const handleSort = (key: string) => {
    const newSorting: { [key: string]: "asc" | "desc" } = {
      [key]: sorting[key] === "asc" ? "desc" : "asc",
    };
    setSorting(newSorting);
  };

  // Move to Trash Logic
  const handleMoveToTrash = async (categorySlug: string) => {
    try {
      // Call the deleteCategory mutation
      await deleteCategory(categorySlug).unwrap(); // Ensure unwrap() is used to throw an error if mutation fails
      toast.success("Category moved to trash successfully!");

      // Refetch the data after deletion
      refetch();
    } catch (error: any) {
      toast.error(
        error.data.errorSources
          ? error.data.errorSources[0].message
          : "Error creating business. Please try again."
      );
    }
  };

  const handleTableAction = (id: string, categorySlug: string) => {
    if (id === "update-categores") {
      setCategorySlug(categorySlug);
      setOpenUpdateModal(!isOpenUpdateModal);
    } else if (id === "delete-category") {
      handleMoveToTrash(categorySlug);
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
            className="!text-sm  font-poppins cursor-pointer  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
          >
            {row?.details}
          </button>
        ) : (
          <span className="text-gray-500">No details</span>
        );
      case "subCategories":
        return row?.subCategories ? (
          <button
            // onClick={() => handleEmailClick(row?.owner?.email)}
            className="!text-sm font-poppins cursor-pointer font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
          >
            {row?.subCategories?.length} Subcategories
          </button>
        ) : (
          <span className="text-gray-500">No Subcategories</span>
        );

      default:
        return null;
    }
  };
  const visibleColumnDefs = categoryColumns.filter((col) =>
    visibleColumns.includes(col.key)
  );
  return (
    <>
      <DynamicTable
        headers={visibleColumnDefs}
        data={category}
        defaultSortKey="categoryName"
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
        {(cate: any) => (
          <>
            <td className="px-3 py-1 border w-10 border-gray-200 text-sm !bg-white">
              <input
                type="checkbox"
                name="checkbox"
                id={`checkbox-${cate?._id}`}
                checked={selectedRows.has(cate?._id)}
                onChange={(e) => handleSelectRow(cate?._id, e.target.checked)}
                className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded border-[#8198A8] cursor-pointer"
              />
            </td>
            {visibleColumnDefs.map((column) => (
              <td
                key={column.key}
                className="px-4 py-2 border border-gray-200 font-poppins text-sm !bg-white"
              >
                {renderCell(cate, column.key)}
              </td>
            ))}
            <td className="px-2 py-1 w-14 border border-gray-200">
              <TableActionButton
                actionItems={actionItems}
                handleAction={(id) => handleTableAction(id, cate?.slug)}
              />
            </td>
          </>
        )}
      </DynamicTable>
      <UpdateCategoryModal
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        isOpen={isOpenUpdateModal}
        onClose={() => {
          setOpenUpdateModal(false);
          setSelectedIds([]);
        }}
        onSuccess={() => {
          refetch();
          setOpenUpdateModal(false);
        }}
        categorySlug={categorySlug}
      />
    </>
  );
};

export default CategoryTable;
