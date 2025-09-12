import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { Component } from "../db/models/ComponentModel";
import { Role } from "../db/models/RoleModel";
import { Permission } from "../db/models/PermissionModel";
import { In } from "typeorm";
import { User } from "../db/models/UserModel";

// Create component
const create_component = async (req: Request, res: Response) => {
  try {
   
    const { name, roles = [], permissions = [], created_by } = req.body as { name: string; roles?: (string | number)[]; permissions?: (string | number)[]; created_by: string };

    const componentRepo = AppDataSource.getRepository(Component);
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);
    const userRepo = AppDataSource.getRepository(User);
    // Check duplicate name
    const existing = await componentRepo.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ msg: "Component already exists" });
    }

    const create_by_user = await userRepo.findOneBy({ id: Number(created_by) });
    if (!create_by_user) return res.status(400).json({ msg: "No User found" });

    const component = componentRepo.create({ name });

    // Attach roles
    const roleIds = [...new Set(roles.map((r) => Number(r)).filter((n) => !Number.isNaN(n)))];
    if (roleIds.length) {
      const roleEntities = await roleRepo.findBy({ id: In(roleIds) });
      component.roles = roleEntities;
    }

    // Attach permissions
    const permIds = [...new Set(permissions.map((p) => Number(p)).filter((n) => !Number.isNaN(n)))];
    if (permIds.length) {
      const permissionEntities = await permissionRepo.findBy({ id: In(permIds) });
      component.permissions = permissionEntities;
    }

    component.created_by = create_by_user;

    const savedComponent = await componentRepo.save(component);

    return res.status(201).json({ msg: "Component created", data: savedComponent });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

// Get all components
const get_components = async (_req: Request, res: Response) => {
  try {
    const componentRepo = AppDataSource.getRepository(Component);
    const components = await componentRepo.find({
      relations: ["roles", "permissions", "created_by"],
    });
    return res.status(200).json({
      msg: "Components fetched successfully",
      data: components,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

// Update component (name, roles, permissions)
const update_component = async (req: Request, res: Response) => {
  try {
    const componentRepo = AppDataSource.getRepository(Component);
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);

    const componentId = Number(req.params.id); const { name, roles, permissions } = req.body;

    const component = await componentRepo.findOne({
      where: { id: componentId },
      relations: ["roles", "permissions", "created_by"],
    });

    if (!component) {
      return res.status(404).json({ msg: "Component not found" });
    }

    // ✅ Update name if provided
    if (typeof name === "string" && name.trim()) {
      component.name = name.trim();
    }

    // ✅ Update roles incrementally
    if (Array.isArray(roles)) {
      const roleIds = [...new Set(roles.map((r) => Number(r)).filter((n) => !Number.isNaN(n)))];
      const roleEntities = await roleRepo.findBy({ id: In(roleIds) });

      const currentRoles = component.roles ?? [];
      const newRoles = roleEntities.filter((role) => !currentRoles.some((r) => r.id === role.id));
      const rolesToRemove = currentRoles.filter((r) => !roleEntities.some((role) => role.id === r.id));

      component.roles = [...currentRoles.filter((r) => !rolesToRemove.includes(r)), ...newRoles];
    }

    // ✅ Update permissions incrementally
    if (Array.isArray(permissions)) {
      const permIds = [...new Set(permissions.map((p) => Number(p)).filter((n) => !Number.isNaN(n)))];
      const permissionEntities = await permissionRepo.findBy({ id: In(permIds) });

      const currentPerms = component.permissions ?? [];
      const newPerms = permissionEntities.filter((perm) => !currentPerms.some((p) => p.id === perm.id));
      const permsToRemove = currentPerms.filter((p) => !permissionEntities.some((perm) => perm.id === p.id));

      component.permissions = [...currentPerms.filter((p) => !permsToRemove.includes(p)), ...newPerms];
    }

    // ✅ Save changes
    await componentRepo.save(component);

    // 🔑 Reload with all relations to ensure latest state
    const reloaded = await componentRepo.findOne({
      where: { id: component.id },
      relations: ["roles", "permissions", "created_by"],
    });

    return res.status(200).json({
      msg: "Component updated successfully",
      data: reloaded,
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

// Delete component
const delete_component = async (req: Request, res: Response) => {
  try {
    const componentRepo = AppDataSource.getRepository(Component);
    const componentId = Number(req.params.id);

    const component = await componentRepo.findOneBy({ id: componentId });
    if (!component) {
      return res.status(404).json({ msg: "Component not found" });
    }

    await componentRepo.delete(componentId);
    return res.status(200).json({ msg: "Component deleted successfully", data: componentId });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export { create_component, get_components, update_component, delete_component };
