"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import EditOrderPad from "@/components/orders/EditOrderPad";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAppSelector } from "@/app/redux/hoook";

const EditOrderPage = () => {
  const params = useParams();
  const router = useRouter();

  const { user } = useAppSelector((s) => s.auth) as { user?: { id?: string } };

  const { data: businessData } = useGetAllBusinessQuery(
    user?.id ? { owner: user.id } : skipToken
  );

  const id = params?.id as string;
  const businessId = businessData?.data?.[0]?._id;

  if (!id) return <div>Order id missing</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-4">
        <button
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold"
        >
          Back
        </button>
      </div>

      <EditOrderPad
        orderId={id}
        userId={user?.id || ""}
        businessId={businessId || ""}
        onUpdated={() => router.back()}
      />
    </div>
  );
};

export default EditOrderPage;