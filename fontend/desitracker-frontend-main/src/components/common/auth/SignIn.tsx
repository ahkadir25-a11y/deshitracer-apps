/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import InputField from "@/components/shears/form/InputField";
import { IoMdEye } from "react-icons/io";
import { IoMdEyeOff } from "react-icons/io";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/app/redux/services/auth.services";
import { getCookie, getCurrentUser, setCookie } from "@/app/utils/cookie";
import { useGetAllBusinessQuery } from "@/app/redux/services/business.services";
import BackButton from "@/components/shears/button/BackButton";
import { FaCheck } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { setUser } from "@/app/redux/features/auth.slice";
import BusinessForm from "@/components/shears/form/BusinessForm";
const SignInForm = () => {
  const { handleSubmit, control, watch } = useForm();
  const [activeTab, setActiveTab] = useState("signin");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isConfirmPassword, setisConfirmPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>({});
  const [selectedCity, setSelectedCity] = useState();
  const steps = [
    { key: "signin", label: "Account Info" },
    { key: "business", label: "Business Info" },
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === activeTab);

  const router = useRouter();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const [loginUser, { isLoading: loginLoading, data: loginData, error }] =
    useLoginUserMutation();

  const { data, isLoading: busniessLoading } = useGetAllBusinessQuery(
    userId ? { owner: userId } : null
  );
  const dispatch = useDispatch();

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    const { password, confirmPassword, ...rest } = data;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    const inputData = {
      email: data?.email,
      password,
      name: data?.name,
      phone: data.phone,
      contact: {
        address: data.address,
        district: data.district,
        subArea: data.subArea,
        country: selectedCountry?.name,
        state: selectedCity,
      },
    };
    const formData = new FormData();

    formData.append("data", JSON.stringify(inputData));
    try {
      const res = await registerUser(formData).unwrap();
      if (isLoading) {
        toast.loading("Signin...!", { duration: 1000 });
      }
      if (res.success) {
        setSuccess(res.success);
        toast.success(res.message, { duration: 1000 });
        const loginRes = await loginUser({
          ...(data?.email && { email: data.email }),
          ...(data?.phone && { phone: data.phone }),
          password,
        }).unwrap();
        if (loginRes.success) {
          toast.success("Login successful!");
          setActiveTab("business");
        } else {
          toast.error(res?.errorSources[0]?.message?.message || "Login failed.");
        }
        // setActiveTab("business");
      } else {
        toast.error(res?.errorSources[0]?.message?.message || "Registration failed.");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  // FOR LOGIN

  useEffect(() => {
    const handleLogin = async () => {
      if (loginData?.success === true) {
        // toast.success(loginData?.message);
        setCookie("desiTrackerToken", loginData?.data?.accessToken);
        const user = await getCurrentUser({
          accessToken: loginData?.data?.accessToken,
        });

        const { email, id, role } = user;
        dispatch(
          setUser({
            email,
            id,
            role,
          })
        );
      }

      if (loginData?.success === false) {
        toast.error(loginData?.message);
      }
    };

    handleLogin();
  }, [loginLoading, loginData, error, dispatch]);

  useEffect(() => {
    const accessToken = getCookie("desiTrackerToken");
    if (!accessToken) {
      setActiveTab("signin");
    } else {
      getCurrentUser({ accessToken })
        .then((user) => {
          const { email, id, role } = user;
          // Assuming you're using dispatch for setting user data
          setUserId(id);
          if (email) {
            setActiveTab("business");
            setSuccess(true);
          }
          // Set the active tab once the user data is retrieved
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
        });
    }
  }, []);
  useEffect(() => {
    if (data?.data?.length > 0) {
      router.push("/profile/my-busniess");
      console.log("insite data?.data?.length", data?.data?.length);
    }
  }, [data, router]);
  return (
    <div className=" w-full signinBg relative min-h-screen flex items-center justify-center p-4 bg-white rounded overflow-hidden shadow-lg">
      <div
        style={{
          background: "linear-gradient(92deg, rgb(0, 0, 0, 0.92) 16%, rgba(128, 128, 128, 0.19) 171%)",
        }}
        className="absolute inset-0  z-0" />

      {/* Right Panel (Form) */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded shadow-2xl ">
        <div
          className="p-3 border-b border-gray-200">
          <BackButton />
          {/* Form Title */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Register To Continue</h2>
            <p className="text-sm text-gray-500 mt-1">
              Please fill in your account information to proceed
            </p>
          </div>
          {/* Stepper */}
          <div className="flex justify-center items-center w-full max-w-xl mx-auto ">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isActive = index === currentStepIndex;

              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {/* Connector Line - left */}
                  {index !== 0 && (
                    <div className="absolute top-6 left-0 w-1/2 h-0.5 bg-gray-300" />
                  )}

                  {/* Connector Line - right */}
                  {index !== steps.length - 1 && (
                    <div className="absolute top-6 right-0 w-1/2 h-0.5 bg-gray-300" />
                  )}

                  {/* Step Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 z-10
              ${isCompleted
                        ? "bg-black text-white border-"
                        : isActive
                          ? "bg-white text-black border-black"
                          : "bg-gray-200 text-gray-500 border-gray-300"
                      }`}
                  >
                    {isCompleted ? <FaCheck size={18} /> : index + 1}
                  </div>

                  {/* Label */}
                  <div
                    className={`text-sm mt-2 ${isActive
                      ? "text-black font-semibold"
                      : isCompleted
                        ? "text-gray-700"
                        : "text-gray-400"
                      }`}
                  >
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Form */}
        {activeTab === "signin" && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            <div className="grid md:grid-cols-2 gap-5">
              <InputField
                label="Your  Full Name"
                name="name"
                placeholder="Al Taj"
                control={control}
              />
              <InputField
                label="Email"
                name="email"
                placeholder="example@gmail.com"
                control={control}
              />
            </div>


            <div className="grid md:grid-cols-1 gap-5">
              {[
                { name: "phone", label: "Phone", placeholder: "Phone Number" },
              ].map((field) => (
                <InputField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  placeholder={field.placeholder}
                  control={control}
                  required={field.name === "phone"}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-1 gap-5">
              <div className="relative">
                <InputField
                  name="password"
                  control={control}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  required
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "At least 8 characters",
                    },
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-600 hover:text-[#222]"
                >
                  {showPassword ? <IoMdEye /> : <IoMdEyeOff />}
                </button>
              </div>

              <div className="relative">
                <InputField
                  name="confirmPassword"
                  control={control}
                  label="Confirm Password"
                  type={isConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  required
                  rules={{
                    required: "Confirmation required",
                    minLength: {
                      value: 8,
                      message: "At least 8 characters",
                    },
                  }}
                />
                <button
                  type="button"
                  onClick={() => setisConfirmPassword(!isConfirmPassword)}
                  className="absolute right-3 top-[42px] transform -translate-y-1/2 text-gray-600 hover:text-[#222]"
                >
                  {isConfirmPassword ? <IoMdEye /> : <IoMdEyeOff />}
                </button>
              </div>
            </div>


            <button
              type="submit"
              className="w-full bg-[#222] rounded cursor-pointer hover:bg-[#1c109f] text-white font-semibold py-2.5  transition"
            >
              Next
            </button>

            <p className="text-sm text-center mt-4">
              Already have an account?
              <Link href="/auth/login" className="text-[#222] font-bold">
                Log In
              </Link>
            </p>
          </form>
        )}
        {activeTab === "business" && (
          <div className="md:p-6">
            {activeTab === "business" && (data?.data?.length || 0) === 0 ? (
              <div>
                <BusinessForm />
              </div>
            ) : (
              <div className="pt-2 flex flex-col text-center items-center justify-center">
                <Link
                  href={"/"}
                  className="text-2xl cursor-pointer italic text-white bg-[#222] "
                >
                  DesiTracker
                </Link>
                <h1 className="md:text-3xl text-xl text-white font-semibold mt-4">
                  Welcome to DesiTracker
                </h1>
                <p className="md:text-sm text-xs mt-3 mb-4 md:max-w-96 max-w-72 mx-auto text-neutral-700 font-poppins">
                  You already have a business
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>

  );
};

export default SignInForm;
