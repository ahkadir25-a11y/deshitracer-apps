import { logOutAction } from "../redux/features/auth.slice";
import { useAppDispatch } from "../redux/hoook";
import { removeCookie } from "./cookie";

// Custom hook for logging out
export const useLogOut = () => {
  const dispatch = useAppDispatch();
  // Define the logOut function
  const logOut = () => {
    dispatch(logOutAction()); // Dispatch the logOutAction
    removeCookie("accessToken"); // Remove the token (you can handle this more elegantly if needed)
    window.location.href = "/auth/login"; // Uncomment to redirect to login page
  };

  return { logOut };
};
