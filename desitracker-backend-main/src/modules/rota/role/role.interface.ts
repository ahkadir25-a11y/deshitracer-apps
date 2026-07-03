import { Types } from 'mongoose';

// Permissions are grouped by area of the business dashboard so the UI can
// render them in sections. Keep these in sync with the schema in role.model.ts
// and the labels in the mobile app's RolePermissionsScreen.
export type TRolePermissions = {
  // Orders & service
  canTakeOrders: boolean;
  canViewOrders: boolean;
  canDeleteOrders: boolean;
  canMarkPaid: boolean;
  canAccessKitchen: boolean;
  canAccessTables: boolean;

  // Products & inventory
  canManageProducts: boolean;
  canViewInventory: boolean;
  canEditInventory: boolean;

  // Restaurant operations
  canManageBookings: boolean;
  canManageOffers: boolean;
  canViewFridge: boolean;
  canEditFridge: boolean;
  canManageCleaning: boolean;

  // Staff & members
  canManageRota: boolean;
  canViewMembers: boolean;

  // Insights
  canViewAnalytics: boolean;
  canViewActivity: boolean;

  // Admin
  canEditBusinessInfo: boolean;
  isSuperAdmin: boolean;
};

export const PERMISSION_KEYS: (keyof TRolePermissions)[] = [
  'canTakeOrders',
  'canViewOrders',
  'canDeleteOrders',
  'canMarkPaid',
  'canAccessKitchen',
  'canAccessTables',
  'canManageProducts',
  'canViewInventory',
  'canEditInventory',
  'canManageBookings',
  'canManageOffers',
  'canViewFridge',
  'canEditFridge',
  'canManageCleaning',
  'canManageRota',
  'canViewMembers',
  'canViewAnalytics',
  'canViewActivity',
  'canEditBusinessInfo',
  'isSuperAdmin',
];

export interface IRotaRole {
  business: Types.ObjectId;
  name: string;
  description?: string;
  permissions?: TRolePermissions;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
