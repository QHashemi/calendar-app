import { Role } from "../db/models/RoleModel";
import { Permission } from "../db/models/PermissionModel";
import { Component } from "../db/models/ComponentModel";
import { User } from "../db/models/UserModel";

type Resource = Role | Permission | Component | User;

type Params = {
  user: User;
  allResources: Resource[];
};

/**
 * Filters any resource based on user's roles and access_level
 */
export const filterResourcesByUserRoles = ({ user, allResources }: Params): Resource[] => {
  if (!user || !user.roles || user.roles.length === 0) return [];

  // Get the minimum access_level of the user across all their roles
  const userAccessLevels = user.roles.map(r => Number(r.access_level ?? 999));
  const minLevel = Math.min(...userAccessLevels);

  // Filter resources: allow any resource that has access_level >= minLevel
  // Assuming resources have optional access_level; fallback to 999
  return allResources.filter(resource => {
    if ("access_level" in resource) {
      return Number(resource.access_level ?? 999) >= minLevel;
    }

    // If resource has roles assigned (like Component.permissions/roles), check if user has any role matching
    if ("roles" in resource && Array.isArray(resource.roles)) {
      return resource.roles.some((r: Role) => user.roles.some(ur => ur.id === r.id));
    }

    // If resource has permissions assigned
    if ("permissions" in resource && Array.isArray(resource.permissions)) {
      return resource.permissions.some((p: Permission) =>
        user.roles.some(ur => ur.permissions?.some(up => up.id === p.id))
      );
    }

    return false;
  });
};
