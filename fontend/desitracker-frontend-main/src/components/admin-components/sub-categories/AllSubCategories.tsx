/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import React, { useState } from "react";
import { subCategoryColumns } from "./sub-category-columns";
import { useGetAllSubCategoriesQuery } from "@/app/redux/services/sub-categories.services";
import TableLoader from "@/components/shears/table/TableLoader";
import ShowEntries from "@/components/shears/ShowEntries";
import TotalEntries from "@/components/shears/TotalEntries";
import Pagination from "@/components/shears/Pagination";
import ManageColumns from "@/components/shears/table/ManageColumns";
import Searchbar from "@/components/shears/Searchbar";
import Container from "@/components/shears/Container";
import SubCategoryTable from "./SubCategoryTable";
import OpenButton from "@/components/shears/button/Openbutton";
import AddSubCategoryModal from "./AddSubCategoryModal";
import { useGetAllCategoriesQuery } from "@/app/redux/services/categories.services";

const AllSubCategories = () => {
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [isOpenAddSubModal, setIsOpenAddSubModal] = React.useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    subCategoryColumns.map((col) => col.key)
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [parentCategory, setParentCategory] = useState<string>(""); // New state for parent category
  const [sort, setSort] = React.useState<{
    [key: string]: "asc" | "desc";
  }>({});

  // Fetch categories for the dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useGetAllCategoriesQuery({
    page: 1,
    limit: 1000,
    searchTerm: "",
    // Removed backend sorting here
  });

  const {
    data: subCategoryData,
    isLoading: subCategoryLoading,
    refetch,
  } = useGetAllSubCategoriesQuery({
    page,
    limit,
    ...(searchTerm && { searchTerm }), // Include searchTerm in the query
    ...(parentCategory && {parentCategory}), // Include parentCategory in the query
  });

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const pageNation = subCategoryData?.meta;
  console.log("subCategoryData:", subCategoryData);
  console.log("subCategores:", subCategoryData?.data);
  if (subCategoryLoading || categoriesLoading) return <TableLoader />;

  return (
    <Container className="h-full w-full flex flex-col gap-y-4">
      <section className="lg:flex justify-between gap-x-4 items-center">
        <div className="flex justify-start gap-3 relative">
          <Searchbar onChange={(val) => setSearchTerm(val)} />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Parent Categories</option>
            {categoriesData?.data?.map((category: any) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <OpenButton
            onClick={() => setIsOpenAddSubModal(true)}
            label="Add Sub Category"
          />
        </div>
        <div className="flex justify-end gap-x-4 items-center">
          <ManageColumns
            columns={subCategoryColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </section>
      <section className="h-full w-full flex flex-col gap-y-0.5 overflow-auto space-y-2">
        <SubCategoryTable
          subCategores={subCategoryData?.data}
          visibleColumns={visibleColumns}
          sorting={sort}
          setSorting={setSort}
          refetch={refetch}
        />
      </section>
      <footer className="w-full p-2 rounded shadow sm:flex justify-between gap-x-4 py-3">
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
      <AddSubCategoryModal
        isOpen={isOpenAddSubModal}
        onSuccess={() => { }}
        onClose={() => setIsOpenAddSubModal(false)}
      />
    </Container>
  );
};

export default AllSubCategories;