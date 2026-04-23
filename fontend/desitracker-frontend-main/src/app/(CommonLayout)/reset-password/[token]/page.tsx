/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useResetPasswordMutation } from "@/app/redux/services/auth.services";
import SubmitButton from "@/components/shears/button/SubmitButton";
import InputField from "@/components/shears/form/InputField";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const ResetPasswordPage = ({ params }: { params: any }) => {
  const { token } = params;
  const { handleSubmit, control, reset } = useForm();
  const [resetPassword] = useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const onSubmit = async (data: any) => {
    console.log(data.resatPassword);
    const res = await resetPassword({
      token: token,
      newPassword: data.resatPassword,
    });
    if (res?.data?.success) {
      reset();
      toast.success(res?.data?.message);
      router.push("/");
    } else {
      toast.error(res?.data?.message || "something went wrong");
    }
  };
  return (
    <div className="container mx-auto my-10">
      {" "}
      <h1 className="text-2xl">Reset Password</h1>
      <form
        action=""
        className="space-y-3 mt-5 max-w-lg mr-auto"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mt-4 space-y-4">
          <div className="relative">
            <InputField
              name="resatPassword"
              control={control}
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
              label="Resat your Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`${showPassword ? "text-gray-600 w-full" : "w-full"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute cursor-pointer right-3 top-[50px] transform -translate-y-1/2 ${
                showPassword ? "text-[#1677df]" : "text-gray-600"
              }  `}
            >
              {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
            </button>
          </div>
        </div>
        <SubmitButton />
      </form>{" "}
    </div>
  );
};

export default ResetPasswordPage;
