import { countries } from "./countries";

export function getCountryNameByCode(code: string) {
  const country = countries.find(
    (c) => c.code.toUpperCase() === code.toUpperCase()
  );
  return country ? country.name : "Invalid country code";
}
