"use client";
import { useGetAllBusinessReviewsQuery } from "@/app/redux/services/business-reviews.services";
import BusniessAnimationSpiner from "@/components/shears/spiner/BusniessAnimationSpiner";
import React, { useState } from "react";
import { reviewsColumns } from "./reviewsColumns";
import Container from "@/components/shears/Container";
import Searchbar from "@/components/shears/Searchbar";
import ManageColumns from "@/components/shears/table/ManageColumns";
import BusniessReviewsTable from "./BusniessReviewsTable";
import ShowEntries from "@/components/shears/ShowEntries";
import TotalEntries from "@/components/shears/TotalEntries";
import Pagination from "@/components/shears/Pagination";

const AllBusniessReviews = ({ busniessId }: { busniessId: string }) => {
  const [page, serPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    reviewsColumns.map((col) => col.key)
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sort, setSort] = React.useState<{
    [key: string]: "asc" | "desc";
  }>({});
  const { data, isLoading } = useGetAllBusinessReviewsQuery({
    busniessId,
    meta: {
      page,
      limit,
      searchTerm,
      sort: JSON.stringify({ name: "asc" }),
    },
  });
  const handlePageChange = (page: number) => {
    serPage(page);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    serPage(1);
  };
  const pageNation = data?.meta;
  console.log({ data });
  if (isLoading) {
    return <BusniessAnimationSpiner />;
  }
  return (
    <Container className="h-full w-full flex flex-col p-3 gap-y-4">
      <section className="lg:flex justify-between gap-x-4 items-center">
        <div className="flex justify-start gap-3 relative">
          <Searchbar onChange={(val) => setSearchTerm(val)} />
        </div>
        <div className="flex  justify-end gap-x-4 items-center">
          <ManageColumns
            columns={reviewsColumns}
            onVisibilityChange={setVisibleColumns}
          />
        </div>
      </section>
      <section className="h-full w-full flex flex-col gap-y-0.5 overflow-auto space-y-2">
        <BusniessReviewsTable
          businessReviews={data?.data}
          visibleColumns={visibleColumns}
          sorting={sort}
          setSorting={setSort}
          // refetch={refetch}
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
    </Container>
  );
};

export default AllBusniessReviews;
