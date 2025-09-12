import { UserType } from "../types/UserTypes";

type Resource = { createdBy?: number; role?: string; [key: string]: any };

export function can(user: UserType, action: string, resource?: Resource): boolean {
  if (!user) return false;

  const normalizedAction = action.toLowerCase().trim();

  // 1. User-specific extra permissions
  if (user.extra_permissions?.some(p => p.name.toLowerCase() === normalizedAction)) {
    return true;
  }

  // 2. Role-based permissions (from roles table)
  const rolePermissions =
    user.roles?.flatMap(role => role.permissions.map(p => p.name.toLowerCase())) || [];
  if (rolePermissions.includes(normalizedAction)) {
    return true;
  }

  // 3. Global override: admins & superadmins can do everything
  if (user.roles.some(role => ["admin", "superadmin"].includes(role.name.toLowerCase()))) {
    return true;
  }

  // 4. ABAC: resource ownership
  if (resource && resource.createdBy !== undefined) {
    if (
      normalizedAction.startsWith("edit:") ||
      normalizedAction.startsWith("delete:") ||
      normalizedAction.startsWith("view:") ||
      normalizedAction.startsWith("add:")
    ) {
      if (resource.createdBy === user.id) return true;
    }
  }

  return false;
}
