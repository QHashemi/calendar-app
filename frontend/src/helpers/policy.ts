// utils/policy.ts

import { UserType } from "../types/UserTypes";

// Generic resource type
type Resource = { createdBy?: number; [key: string]: any };

export function can(user: UserType, action: string, resource?: Resource): boolean {
  if (!user) return false;

  const normalizedAction = action.toLowerCase().trim();

  // 1. User-specific extra permissions
  if (user.extra_permissions?.some(p => p.name.toLowerCase() === normalizedAction)) {
    return true;
  }

  // 2. Role-based permissions
  const rolePermissions = user.roles?.flatMap(role => role.permissions.map(p => p.name.toLowerCase())) || [];
  if (rolePermissions.includes(normalizedAction)) {
    return true;
  }

  // 3. Optional ABAC (resource ownership) checks
  if (resource && resource.createdBy !== undefined) {
    if (normalizedAction.startsWith("edit:") || normalizedAction.startsWith("delete:")) {
      if (resource.createdBy === user.id) return true;
    }
  }

  return false;
}
