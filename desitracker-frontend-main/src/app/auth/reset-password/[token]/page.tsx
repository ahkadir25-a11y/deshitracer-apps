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
    try {
      const res = await resetPassword({
        token: token,
        newPassword: data.resatPassword,
      }).unwrap();

      if (res?.success) {
        reset();
        toast.success(res?.message || "Password reset successful!");
        router.push("/");
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h1 className="text-2xl font-semibold text-center text-[#222] mb-4">
          Reset Your Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter a new password to regain access to your account.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5"
        >
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
              label="New Password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              className={`${showPassword ? "text-gray-600 w-full" : "w-full"}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 top-[42px] transform -translate-y-1/2 ${
                showPassword ? "text-[#222]" : "text-gray-500"
              }`}
            >
              {showPassword ? <IoMdEye size={20} /> : <IoMdEyeOff size={20} />}
            </button>
          </div>
      
          <SubmitButton buttonText="Reset Password" />
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
