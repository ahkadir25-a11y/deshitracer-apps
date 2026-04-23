/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useForgotPasswordMutation } from "@/app/redux/services/auth.services";
import SubmitButton from "@/components/shears/button/SubmitButton";
import InputField from "@/components/shears/form/InputField";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import sign_up from "../../../assets/signup.jpg";
import Image from "next/image";
import BackButton from "@/components/shears/button/BackButton";
import toast from "react-hot-toast";
import { useGetSettingsQuery } from "@/app/redux/services/settings";
import Link from "next/link";

const ForgotPasswordPage = () => {
  const { data: currentSettings } = useGetSettingsQuery({});
  const { handleSubmit, control, reset } = useForm();
  const [forgotPassword] = useForgotPasswordMutation();
  const [resetLink, setResetLink] = useState<string | null>(null); // New state

  const onSubmit = async (data: any) => {
    try {
      const res = await forgotPassword({ email: data.email }).unwrap();
      if (res?.success) {
        reset();
        toast.success(res?.message);
        setResetLink(res?.data?.reset_link); // Save reset link to state
      } else {
        toast.error("Email does not exist.");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Something went wrong!");
    }
  };

  return (
    <div className="relative h-screen flex justify-center">
      {/* Image Section */}
      <div className="h-[100%]  w-[60%] z-10 relative md:block hidden overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(92deg, #002B22EB 16%, #002B2230 171%)",
          }}
        ></div>
        <Image
          className="h-full w-full object-cover"
          src={sign_up}
          width={1000}
          height={1000}
          alt="signUp"
          priority
          quality={100}
        />
      </div>

      {/* Form Section */}
      <div className="bg-[#F4F4F4] h-full shadow-2xl md:w-[40%] w-full z-10 flex flex-col justify-center">
        <div className="p-2 bg-white">
          <BackButton />
        </div>
        <div className="md:p-10 p-2 bg-white border-b border-gray-200">
          <div className="pt-2 flex flex-col text-center items-center justify-center">
            <Link href="/">
              <Image
                src={currentSettings?.data?.logo}
                alt="logo"
                width={400}
                height={400}
                className="rounded-full w-28 h-28"
              />
            </Link>
            <p className="md:text-lg font-semibold text-xs mt-3 mb-4 md:max-w-96 max-w-72 mx-auto text-neutral-700 font-poppins">
              Forgot your Password?
            </p>
          </div>
        </div>

        {!resetLink ? (
          // Show the form
          <form
            className="space-y-3 mt-5 w-[80%] mx-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            <InputField
              key={"email"}
              label={"Your Email"}
              name={"email"}
              type={"email"}
              placeholder={"Enter Your Email"}
              control={control}
            />
            <SubmitButton buttonText={"Submit"} />
          </form>
        ) : (
          // Show the reset link UI
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-green-700">
              Password Reset Link Sent!
            </h2>
            <p className="mt-2 text-gray-600">
              Click the button below to reset your password:
            </p>
            <Link
              href={resetLink}
              className="inline-block mt-4 px-6 py-2 bg-[#222] text-white rounded hover:bg-blue-700 transition"
            >
              Reset Password
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              If you don&apos;t receive the email, check your spam folder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
