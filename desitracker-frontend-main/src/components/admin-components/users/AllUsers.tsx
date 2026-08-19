"use client";
import { useGetUsersQuery } from "@/app/redux/services/users.services";
import React, { useState } from "react";
import { userColumns } from "./userColumns";
import TotalEntries from "@/components/shears/TotalEntries";
import Pagination from "@/components/shears/Pagination";
import ShowEntries from "@/components/shears/ShowEntries";
import ManageColumns from "@/components/shears/table/ManageColumns";
import Container from "@/components/shears/Container";
import UsersTable from "./UsersTable";
import TableLoader from "@/components/shears/table/TableLoader";
import Searchbar from "@/components/shears/Searchbar";

const AllUsers = () => {
  const [page, serPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    userColumns.map((col) => col.key)
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sort, setSort] = React.useState<{
    [key: string]: "asc" | "desc";
  }>({});
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch,
  } = useGetUsersQuery({
    page,
    limit,
    searchTerm,
    sort: JSON.stringify({ name: "asc" }),
  });
  // Defensively extract pagination meta
  const pageNation = usersData?.meta || usersData?.data?.meta || {};
  
  const handlePageChange = (page: number) => {
    serPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    serPage(1);
  };
  
  if (usersLoading) {
    return <TableLoader />;
  }
  
  // Defensively extract users array
  const usersArray = usersData?.data?.users || usersData?.users || usersData?.data?.data || usersData?.data;
  const safeUsers = Array.isArray(usersArray) 
    ? usersArray 
    : Object.values(usersData?.data || usersData || {}).find(val => Array.isArray(val)) || [];

  if (!usersData || (!usersLoading && safeUsers.length === 0)) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        No Data Found
      </div>
    );
  }

  return (
    <Container className="h-full w-full flex flex-col gap-y-4">
      <section className="lg:flex justify-between gap-x-4 items-center">
        <div className="flex justify-start gap-3 relative">
          <Searchbar onChange={(val) => setSearchTerm(val)} />
        </div>
        <div className="flex  justify-end gap-x-4 items-center">
          <ManageColumns
            columns={userColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </section>
      <section className="h-full w-full flex flex-col gap-y-0.5 overflow-auto space-y-2">
        <UsersTable
          users={safeUsers}
          visibleColumns={visibleColumns}
          sorting={sort}
          setSorting={setSort}
          refetch={refetch}
        />
      </section>
      <footer className="w-full p-2  rounded shadow sm:flex justify-between gap-x-4 py-3">
        <ShowEntries limit={limit} onLimitChange={handleLimitChange} />
        <div className="flex items-center gap-x-4">
          <TotalEntries total={pageNation?.total || 0} />
          <Pagination
            currentPage={page}
            totalPages={pageNation?.totalPage || 1}
            onPageChange={handlePageChange}
          />
        </div>
      </footer>
    </Container>
  );
};

export default AllUsers;
