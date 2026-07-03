"use client"
import { useGetBusinessQuery } from "@/app/redux/services/business.services";
import Spinner from "@/components/shears/spiner/Spiner";
import WaiterOrderPad from "@/components/WaiterOrderPad/WaiterOrderPad";
import React from "react";

const TakeOrder = ({ params }: { params: any }) => {
    const { slug } = params;
    const { data, isLoading } = useGetBusinessQuery(slug);
    if (isLoading) {
        return <Spinner />;
    }
    const business = data.data;

    return (
        <div>
            <WaiterOrderPad businessId={business?._id} userId={business?.owner?._id} />
        </div>
    );
};

export default TakeOrder;
