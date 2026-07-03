export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
  BUSINESS_OWNER: 'business_owner',
  STAFF: 'staff',
} as const;

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
