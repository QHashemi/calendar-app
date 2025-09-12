// seed-roles-permissions.ts
import "reflect-metadata";
import { AppDataSource } from "./db/data-source";
import { Role } from "./db/models/RoleModel";
import { Permission } from "./db/models/PermissionModel";
import { Roles } from "./config/Rols";
import { Component } from "./db/models/ComponentModel";
import { User } from "./db/models/UserModel";

const ComponentsRolesMap: Record<string, string[]> = {
  Profile: ["superadmin", "user", "admin"],
  Dashboard: ["superadmin", "user", "admin"],
  Users: ["superadmin", "admin"],
  Calendar: ["superadmin", "user", "admin"],
  Events: ["superadmin", "user", "admin"],
  Settings: ["superadmin", ],
};

export async function seedRolesPermissionsAndComponents() {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);
    const componentRepo = AppDataSource.getRepository(Component);
    const userRepo = AppDataSource.getRepository(User);

    const allPermissionEntities: Record<string, Permission> = {};
    const allRoles: Record<string, Role> = {};

    // 1️⃣ Seed permissions and roles
    for (const [roleName, permNames] of Object.entries(Roles)) {
      // Ensure permissions exist
      const perms: Permission[] = [];
      for (const permName of permNames) {
        let perm = await permissionRepo.findOne({ where: { name: permName } });
        if (!perm) {
          perm = permissionRepo.create({ name: permName });
          await permissionRepo.save(perm);
        }
        perms.push(perm);
        allPermissionEntities[permName] = perm;
      }

      // Ensure role exists
      let role = await roleRepo.findOne({
        where: { name: roleName },
        relations: ["permissions"],
      });

      if (!role) {
        role = roleRepo.create({
          name: roleName,
          description: `${roleName} role`,
          permissions: perms,
        });
        await roleRepo.save(role);
      } else {
        // Merge missing permissions
        const currentPermNames = role.permissions.map((p) => p.name);
        const missingPerms = perms.filter((p) => !currentPermNames.includes(p.name));
        if (missingPerms.length > 0) {
          role.permissions = [...role.permissions, ...missingPerms];
          await roleRepo.save(role);
        }
      }

      allRoles[roleName] = role;
    }

    // 2️⃣ Seed components
    const superAdminUser = await userRepo.findOne({
      where: { roles: { name: "superadmin" } },
      relations: ["roles"],
    });

    for (const [componentName, roleNames] of Object.entries(ComponentsRolesMap)) {
      
      let component = await componentRepo.findOne({
        where: { name: componentName },
        relations: ["roles", "permissions"],
      });

      if (!component) {
        component = componentRepo.create({
          name: componentName,
          ...(superAdminUser ? { created_by: superAdminUser } : {}),
        });
      }

      // Merge roles into component
      const existingRoles = component.roles ?? [];
      const newRoles = roleNames.map((r) => allRoles[r]).filter((role) => role && !existingRoles.some((er) => er.id === role.id));

      if (newRoles.length > 0) {
        component.roles = [...existingRoles, ...newRoles];
      }

      await componentRepo.save(component);

      console.log(`Component seeded: ${componentName} with roles [${component.roles.map((r) => r.name).join(", ")}]`);
    }

    console.log("Roles, permissions, and components seeded successfully!");
  } catch (error) {
    console.error(" Error seeding components:", error);
    throw error;
  }
}
