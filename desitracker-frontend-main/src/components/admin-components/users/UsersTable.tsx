/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import DynamicTable from "@/components/shears/table/DynamicTable";
import React from "react";
import { userColumns } from "./userColumns";
import ToggleButton from "@/components/shears/button/ToggleButton";
import ProfilePhoto from "@/components/shears/ProfilePhoto";
import TableActionButton from "@/components/shears/table/TableActionButton";
import {
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "@/app/redux/services/users.services";
import toast from "react-hot-toast";
import { RiDeleteBinLine } from "react-icons/ri";

interface TableProps {
  users: any;
  sorting: { [key: string]: "asc" | "desc" };
  setSorting: (sorting: { [key: string]: "asc" | "desc" }) => void;
  visibleColumns: string[];
  refetch: () => void;
}
const actionItems = [

  {
    id: "move-to-trash",
    name: "Delete",
    icon: <RiDeleteBinLine size={16} />,
  },
];
const UsersTable = ({
  users,
  setSorting,
  sorting,
  refetch,
  visibleColumns,
}: TableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const allIds = users.map((user: any) => user._id);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  };
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  // Individual Row Selection Logic
  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
    setSelectAll(newSelected.size === users?.length);
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };
  // Render Cell Based on Column Key
  const handleToggle = async (bol: boolean, id: string) => {
    try {
      const input = { isBlocked: bol };
      const formData = new FormData();
      formData.append("data", JSON.stringify(input));
      await updateUser({
        userId: id,
        userData: formData,
      });
    } catch (error) {
      console.error("Error updating isBlocked:", error);
    }
  };

  const renderCell = (row: any, columnKey: string) => {
    switch (columnKey) {
      case "person":
        return (
          <p className="flex items-center gap-2">
            <ProfilePhoto url={row.profilePic} />
            <span
              style={{ maxWidth: "120px" }}
              className="!text-sm font-poppins  font-medium overflow-hidden text-ellipsis whitespace-nowrap inline-block"
            >
              {row?.name}
            </span>
          </p>
        );
      case "phone":
        return row?.phone ? (
          <a href={`tel:+${row?.phone}`} className="text-sm text-[#017BFE]">
            {row?.phone}
          </a>
        ) : (
          <span className="text-gray-500">No Phone</span>
        );
      case "email":
        return row?.email ? (
          <button
            onClick={() => handleEmailClick(row?.email)}
            className="text-sm cursor-pointer text-[#017BFE] "
          >
            {row?.email}
          </button>
        ) : (
          <span className="text-gray-500">No Email</span>
        );
      case "userStatus":
        return <span className="text-sm">{row?.userStatus || "-"}</span>;

      case "role":
        return (
          <span className="text-sm">
            {row?.role?.charAt(0) + row?.role?.slice(1)?.toLowerCase() || "-"}
          </span>
        );
      case "isBlocked":
        return (
          <div className="flex items-center gap-2">
            <ToggleButton
              toggleValue={row?.isBlocked}
              onToggle={(bol: boolean) => {
                handleToggle(bol, row?._id);
              }}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const visibleColumnDefs = userColumns.filter((col) =>
    visibleColumns.includes(col.key)
  );

  const handleSort = (key: string) => {
    const newSorting: { [key: string]: "asc" | "desc" } = {
      [key]: sorting[key] === "asc" ? "desc" : "asc",
    };
    setSorting(newSorting);
  };

  const handleMoveToTrash = async (userId: string) => {
    try {
      await deleteUser(userId).unwrap();
      toast.success("User moved to trash successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to move user to trash.");
      console.error(error);
    }
  };
  const handleTableAction = (id: string, userId: string) => {
    if (id === "view-profile") {
    } else if (id === "move-to-trash") {
      handleMoveToTrash(userId);
    }
  };
  return (
    <DynamicTable
      headers={visibleColumnDefs}
      data={users}
      defaultSortKey="Person"
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
      {(user: any) => (
        <>
          <td className="px-3 py-1 border w-10 border-gray-200 text-sm !bg-white">
            <input
              type="checkbox"
              name="checkbox"
              id={`checkbox-${user?._id}`}
              checked={selectedRows.has(user?._id)}
              onChange={(e) => handleSelectRow(user?._id, e.target.checked)}
              className="form-checkbox focus:ring-0 focus:ring-offset-0 rounded border-[#8198A8] cursor-pointer"
            />
          </td>
          {visibleColumnDefs.map((column) => (
            <td
              key={column.key}
              className="px-4 py-2 border border-gray-200 font-poppins text-sm !bg-white"
            >
              {renderCell(user, column.key)}
            </td>
          ))}
          <td className="px-2 py-1 w-14 border border-gray-200">
            <TableActionButton
              actionItems={actionItems}
              handleAction={(id) => handleTableAction(id, user?._id)}
            />
          </td>
        </>
      )}
    </DynamicTable>
  );
};

export default UsersTable;
