import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { Permission } from "../db/models/PermissionModel";
import { User } from "../db/models/UserModel";

const create_permission = async (req: Request, res: Response) => {
  try {
    const { name, description, created_by } = req.body;
    const permRepo = AppDataSource.getRepository(Permission);
    const userRepo = AppDataSource.getRepository(User);

    const create_by_user = await userRepo.findOneBy({ id: Number(created_by) });
    if (!create_by_user) return res.status(400).json({ msg: "No User found" });

    const existingPerm = await permRepo.findOneBy({ name });
    if (existingPerm) return res.status(400).json({ msg: "Permission with this name already exists" });

    const newPerm = permRepo.create({ name, description, created_by: create_by_user });
    const savedPerm = await permRepo.save(newPerm);

    return res.status(201).json({ data: savedPerm, msg: "Permission created successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const get_permissions = async (_req: Request, res: Response) => {
  try {
    const permRepo = AppDataSource.getRepository(Permission);
    const permissions = await permRepo.find({ relations: ["created_by"] });
    return res.status(200).json({ data: permissions, msg: "Permissions fetched successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const update_permission = async (req: Request, res: Response) => {
  try {
    const permRepo = AppDataSource.getRepository(Permission);
    const permissionId = Number(req.params.permissionId);
    const updatedData = req.body;

    const permission = await permRepo.findOne({
      where: { id: permissionId },
      relations: ["created_by"],
    });

    if (!permission) return res.status(404).json({ msg: "Permission not found" });

    permRepo.merge(permission, updatedData);
    await permRepo.save(permission);

    return res.status(200).json({ data: permission, msg: "Permission updated successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

const delete_permission = async (req: Request, res: Response) => {
  try {
    const permissionRepo = AppDataSource.getRepository(Permission);

    const permissionId = Number(req.params.permissionId);
    const permission = await permissionRepo.findOne({
      where: { id: permissionId },
      relations: ["roles"],
    });

    if (!permission) return res.status(404).json({ msg: "Permission not found" });

    // Remove relation first
    if (permission.roles.length > 0) {
      await permissionRepo
        .createQueryBuilder()
        .relation(Permission, "roles")
        .of(permissionId)
        .remove(permission.roles.map(r => r.id));
    }

    // Now delete the permission itself
    await permissionRepo.remove(permission);

    return res.status(200).json({ msg: "Permission deleted successfully", data: permissionId });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export { create_permission, get_permissions, update_permission, delete_permission };
