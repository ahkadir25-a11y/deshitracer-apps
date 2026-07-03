"use client";
import { useAppSelector } from '@/app/redux/hoook';
import { useGetAllBusinessQuery } from '@/app/redux/services/business.services';
import OrdersManagementPage from '@/components/orders/OrdersManagementPage';
import { skipToken } from '@reduxjs/toolkit/query';
import React from 'react';


const page = () => {
    const { user } = useAppSelector((s) => s.auth) as { user: { id: string } };
      const { data: businessData } = useGetAllBusinessQuery(
        user?.id ? { owner: user.id } : skipToken
      );
    return (
        <>
            <OrdersManagementPage userId={user?.id} businessId={businessData && businessData?.data[0]?._id} />
        </>
    );
};

export default page;