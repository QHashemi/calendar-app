import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { Role } from "../db/models/RoleModel";
import { Permission } from "../db/models/PermissionModel";
import { User } from "../db/models/UserModel";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET_PUBLICKEY } from "../accessTokenConfig";
import { filterResourcesByUserRoles } from "../helpers/filter_resource_base_role_permission";
/* --------------------------- ROLE CONTROLLERS --------------------------- */

const create_role = async (req: Request, res: Response) => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const permRepo = AppDataSource.getRepository(Permission);
    const userRepo = AppDataSource.getRepository(User);
    const { name, description, permissions, created_by } = req.body; // permissions is ["1", "2"]

    // Check for duplicate role
    const existingRole = await roleRepo.findOneBy({ name });
    if (existingRole) return res.status(400).json({ msg: "Role with this name already exists" });

    // Validate permission IDs

    const foundPermissions = await permRepo.findByIds(permissions.map((id: string) => Number(id)));
    if (!foundPermissions) return res.status(400).json({ msg: "No valid permissions found" });

    const create_by_user = await userRepo.findOneBy({ id: Number(created_by) });
    if (!create_by_user) return res.status(400).json({ msg: "No User found" });

    const newRole = roleRepo.create({
      name,
      description,
      permissions: foundPermissions, // store array of permission IDs as strings
      created_by: create_by_user,
    });

    const savedRole = await roleRepo.save(newRole);
    return res.status(201).json({ data: savedRole, msg: "Role created successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const get_roles = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token provided" });
    }

    const decoded: any = jwt.verify(refreshToken, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY);
    const userId = decoded.user.id;

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["roles", "extra_permissions"],
    });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const roles = await roleRepo.find({ relations: ["permissions", "created_by"] });

    const allowedComponents = filterResourcesByUserRoles({ user, allResources: roles });

    return res.status(200).json({ data: allowedComponents, msg: "Roles fetched successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const update_role = async (req: Request, res: Response) => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission); // <-- fetch permissions
    const roleId = Number(req.params.roleId);
    const { name, description, permissions } = req.body; // permissions = ["1", "2", ...]

    const role = await roleRepo.findOne({
      where: { id: roleId },
      relations: ["permissions", "created_by"], // load existing permissions
    });
    if (!role) return res.status(404).json({ msg: "Role not found" });

    // Update simple fields
    role.name = name;
    role.description = description;

    // Update permissions relation
    if (permissions && Array.isArray(permissions)) {
      const perms = await permissionRepo.findByIds(permissions.map(Number));
      role.permissions = perms;
    }

    await roleRepo.save(role);

    return res.status(200).json({ data: role, msg: "Role updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const delete_role = async (req: Request, res: Response) => {
  try {
    const roleRepo = AppDataSource.getRepository(Role);
    const roleId = Number(req.params.roleId);

    const role = await roleRepo.findOneBy({ id: roleId });
    if (!role) return res.status(404).json({ msg: "Role not found" });

    await roleRepo.delete(roleId);
    return res.status(200).json({ msg: "Role deleted successfully", data: roleId });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export { create_role, get_roles, update_role, delete_role };
