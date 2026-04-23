import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
// Set cookie
export const setCookie = (
  name: string,
  value: string,
  expiresInDays: number = 7
) => {
  Cookies.set(name, value, { expires: expiresInDays });
};
// Get cookie
export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

// Update cookie (essentially the same as setting)
export const updateCookie = (
  name: string,
  newValue: string,
  expiresInDays: number = 7
) => {
  setCookie(name, newValue, expiresInDays); // Overwrites the existing cookie
};

// Remove cookie
export const removeCookie = (name: string) => {
  return Cookies.remove(name);
};

export const getCurrentUser = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  if (!accessToken) return null;
  let decodedData = null;
  if (accessToken) {
    console.log("decode", accessToken)
    decodedData = await jwtDecode(accessToken);
    return decodedData;
  } else {
    return null;
  }
};
