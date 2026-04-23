"use client";
import { setUser } from "@/app/redux/features/auth.slice"; // Adjust path as needed
import { getCookie, getCurrentUser } from "@/app/utils/cookie"; // Adjust path as needed
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

const VerifyProtected = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname(); // Get the current URL path (e.g., /verify/[slug])

  useEffect(() => {
    const accessToken = getCookie("desiTrackerToken");
    if (!accessToken) {
      // Redirect to login, passing the current path as a query param for post-login redirect
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      getCurrentUser({ accessToken })
        .then((user) => {
          const { email, id, role } = user;
          dispatch(
            setUser({
              email,
              id,
              role,
            })
          );

          // Optional: Add role-based check if verify is restricted (e.g., not for admins)
          // if (role !== "user") {
          //   router.push("/");
          // }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          // On error, redirect to login with the current path preserved
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        });
    }
  }, [dispatch, router, pathname]);

  return <>{children}</>;
};

export default VerifyProtected;
