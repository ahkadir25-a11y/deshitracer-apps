"use client";
import Container from "@/components/shears/Container";
import Searchbar from "@/components/shears/Searchbar";
import ManageColumns from "@/components/shears/table/ManageColumns";
import React, { useState } from "react";
import ShowEntries from "@/components/shears/ShowEntries";
import TotalEntries from "@/components/shears/TotalEntries";
import Pagination from "@/components/shears/Pagination";
import TableLoader from "@/components/shears/table/TableLoader";
import { siteReviewsColumns } from "./siteReviewsColumns";
import SiteReviewTable from "./SiteReviewTable";
import { useGetAllBusinessReviewsQuery } from "@/app/redux/services/business-reviews.services";


const SiteReviews = () => {
    // Fetch all reviews for a business using the hook\

    const [page, serPage] = React.useState<number>(1);
    const [limit, setLimit] = React.useState<number>(10);
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        siteReviewsColumns.map((col) => col.key)
    );
    const [searchTerm, setSearchTerm] = React.useState("");
    const [sort, setSort] = React.useState<{
        [key: string]: "asc" | "desc";
    }>({});
    const { data, isLoading, refetch } = useGetAllBusinessReviewsQuery({ page, limit, searchTerm });

    console.log(searchTerm)

    const handlePageChange = (page: number) => {
        serPage(page);
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        serPage(1);
    };
    const pageNation = data?.meta;
    if (isLoading) return <TableLoader />;

    // Handle the success state and display the reviews
    return (
        <Container className="max-w-5xlh-full w-full flex flex-col gap-y-4">
            <section className="lg:flex justify-between gap-x-4 items-center">
                <div className="flex justify-start gap-3 relative">
                    <Searchbar onChange={(val) => setSearchTerm(val)} />
                </div>
                <div className="flex  justify-end gap-x-4 items-center">
                    <ManageColumns
                        columns={siteReviewsColumns}
                        onVisibilityChange={setVisibleColumns}
                    />
                </div>
            </section>
            <section className="h-full w-full flex flex-col gap-y-0.5 overflow-auto space-y-2">
                <SiteReviewTable
                    business={data?.data}
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
        </Container>
    );
};

export default SiteReviews;
