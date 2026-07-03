export const businessColumns = [
  {
    key: "businessName",
    label: "Business Name",
    sortable: true,
    sortKey: "businessName",
  },
  {
    key: "category",
    label: "Category",
    sortable: true,
    sortKey: "category",
  },
  {
    key: "subCategory",
    label: "Sub Category",
    sortable: true,
    sortKey: "subCategory",
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
    sortKey: "owner.name", // Assuming owner is an object with a name
  },
  {
    key: "isActive",
    label: "Active",
    sortable: true,
    sortKey: "isActive",
  },
];
