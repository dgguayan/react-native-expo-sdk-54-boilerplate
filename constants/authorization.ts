export const SYSTEM_ROLES = {
  admin: "admin",
  manager: "manager",
  staff: "staff",
  user: "user",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export const PERMISSIONS = {
  manageUsers: "users.manage",
  manageRoles: "roles.manage",
  manageSettings: "settings.manage",
  manageInventory: "inventory.manage",
  manageSales: "sales.manage",
  manageReports: "reports.manage",
  manageProducts: "products.manage",
  viewAnalytics: "analytics.view",
  exportData: "data.export",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface AuthorizationSnapshot {
  permissions: readonly string[];
  primaryRole: string | null;
  roles: readonly string[];
}

export const EMPTY_AUTHORIZATION: AuthorizationSnapshot = {
  permissions: [],
  primaryRole: null,
  roles: [],
};
