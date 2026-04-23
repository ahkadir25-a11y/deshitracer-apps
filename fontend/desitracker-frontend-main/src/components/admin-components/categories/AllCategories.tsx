"use client";
import React, { useState } from "react";
import { categoryColumns } from "./categoryColumns";
import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";
import TableLoader from "@/components/shears/table/TableLoader";
import Container from "@/components/shears/Container";
import Searchbar from "@/components/shears/Searchbar";
import ManageColumns from "@/components/shears/table/ManageColumns";
import ShowEntries from "@/components/shears/ShowEntries";
import TotalEntries from "@/components/shears/TotalEntries";
import Pagination from "@/components/shears/Pagination";
import CategoryTable from "./CategoryTable";
import OpenButton from "@/components/shears/button/Openbutton";
import AddCategoryModal from "./AddCategoryModal";

const AllCategories = () => {
  const [page, serPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [isOpenAddCategoryModal, setIsOpenAddCategoryModal] =
    React.useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    categoryColumns.map((col) => col.key)
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sort, setSort] = React.useState<{
    [key: string]: "asc" | "desc";
  }>({});
  const {
    data: categoryData,
    isLoading: categoryLoading,
    refetch,
  } = useGetAllCategoriesQuery({
    page,
    limit,
    searchTerm,
    // Removed backend sorting here
  });
  const handlePageChange = (page: number) => {
    serPage(page);
  };
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    serPage(1);
  };
  const pageNation = categoryData?.meta;
  if (categoryLoading) return <TableLoader />;
  return (
    <Container className="h-full w-full flex flex-col gap-y-4">
      <section className="lg:flex justify-between gap-x-4 items-center">
        <div className="flex justify-start gap-3 relative">
          <Searchbar onChange={(val) => setSearchTerm(val)} />
          <OpenButton
            onClick={() => setIsOpenAddCategoryModal(true)}
            label="Add Category"
          />
        </div>
        <div className="flex  justify-end gap-x-4 items-center">
          <ManageColumns
            columns={categoryColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </section>
      <section className="h-full w-full flex flex-col gap-y-0.5 overflow-auto space-y-2">
        <CategoryTable
          category={categoryData?.data}
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
            totalPages={pageNation?.totalPage}
            onPageChange={handlePageChange}
          />
        </div>
      </footer>
      <AddCategoryModal
        isOpen={isOpenAddCategoryModal}
        onSuccess={() => { }}
        onClose={() => setIsOpenAddCategoryModal(false)}
      />
    </Container>
  );
};

export default AllCategories;
