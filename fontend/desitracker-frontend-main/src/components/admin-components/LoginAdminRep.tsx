import { setUser } from "@/app/redux/features/auth.slice";
import { getCookie, getCurrentUser } from "@/app/utils/cookie";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const LoginAdminRep = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const accessToken = getCookie("desiTrackerToken");
    if (!accessToken) {
      router.push("/auth/login"); // Redirect to login if there's no token
    } else {
      getCurrentUser({
        accessToken,
      })
        .then((user) => {
          const { email, id, role } = user;
          dispatch(
            setUser({
              email,
              id,
              role,
            })
          );

          // Allow both admins and business owners to access the dashboard
          const dashboardRoles = ["admin", "super_admin", "business_owner"];
          if (!dashboardRoles.includes(role)) {
            router.push("/");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          router.push("/auth/login"); // Redirect to login on error
        });
    }
  }, [dispatch, router]);

  return <>{children}</>;
};

export default LoginAdminRep;
