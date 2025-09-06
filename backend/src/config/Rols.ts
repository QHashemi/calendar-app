// roles-permissions.ts

export const Permissions = {
  // Role management
  ADD_ROLE: "add:role",
  EDIT_ROLE: "edit:role",
  DELETE_ROLE: "delete:role",

  // Permission management
  ADD_PERMISSION: "add:permission",
  EDIT_PERMISSION: "edit:permission",
  DELETE_PERMISSION: "delete:permission",

  // Events
  ADD_EVENT: "add:event",
  EDIT_EVENT: "edit:event",
  DELETE_EVENT: "delete:event",

  // Users
  ADD_USER: "add:user",
  EDIT_USER: "edit:user",
  DELETE_USER: "delete:user",

  // Own resources
  ADD_OWN: "add:own",
  EDIT_OWN: "edit:own",
  DELETE_OWN: "delete:own",

  // Component
  ADD_COMPONENT: "add:component",
  EDIT_COMPONENT: "edit:component",
  DELETE_COMPONENT: "delete:component",
} as const;


// Create a union type of all permissions
export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

// Define roles with their permissions
export const Roles: Record<string, PermissionType[]> = {
  superadmin: [
    // Role management
    Permissions.ADD_ROLE,
    Permissions.EDIT_ROLE,
    Permissions.DELETE_ROLE,

    // Permission management
    Permissions.ADD_PERMISSION,
    Permissions.EDIT_PERMISSION,
    Permissions.DELETE_PERMISSION,

    // Events
    Permissions.ADD_EVENT,
    Permissions.EDIT_EVENT,
    Permissions.DELETE_EVENT,

    // Users
    Permissions.ADD_USER,
    Permissions.EDIT_USER,
    Permissions.DELETE_USER,

    // Own resources
    Permissions.ADD_OWN,
    Permissions.EDIT_OWN,
    Permissions.DELETE_OWN,
    // Component
    Permissions.ADD_COMPONENT,
    Permissions.EDIT_COMPONENT,
    Permissions.DELETE_COMPONENT,
  ],

  user: [Permissions.ADD_OWN, Permissions.EDIT_OWN, Permissions.DELETE_OWN],
};
