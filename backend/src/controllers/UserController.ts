import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import { User } from "../db/models/UserModel";
import path from "path";
import fs from "fs";
import { Role } from "../db/models/RoleModel";
import { Permission } from "../db/models/PermissionModel";
import { In } from "typeorm";
import bcrypt from "bcrypt";
import { Credential } from "../db/models/UserCredentials";

const create_user = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);
    const credentialRepo = AppDataSource.getRepository(Credential);

    const {
      first_name,
      last_name,
      email,
      title,
      job,
      color,
      gender,
      has_personal_calendar,
      roles, // optional array of role IDs
      extra_permissions, // optional array of permission IDs
      password, // optional
      confirm_password, // optional
    } = req.body;

    // Check if user exists
    const existingUser = await userRepo.findOneBy({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const newUser = userRepo.create({
      first_name,
      last_name,
      email,
      title,
      job,
      color,
      gender,
      has_personal_calendar,
      display_name: `${first_name} ${last_name}`,
    });

    // Assign roles if provided
    if (roles && roles.length > 0) {
      const assignedRoles = await roleRepo.findBy({
        id: In(roles.map((id: string) => Number(id))),
      });
      newUser.roles = assignedRoles;
    }

    // Assign extra permissions if provided
    if (extra_permissions && extra_permissions.length > 0) {
      const assignedPerms = await permissionRepo.findBy({
        id: In(extra_permissions.map((id: string) => Number(id))),
      });
      newUser.extra_permissions = assignedPerms;
    }

    // Save user
    const addedUser = await userRepo.save(newUser);

    // Create credentials if password provided
    if (password || confirm_password) {
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const password_hash = await bcrypt.hash(password, 10);
      const credential = credentialRepo.create({
        password_hash,
        password_algo: "bcrypt",
        failed_attempts: 0,
        user: addedUser,
      });
      await credentialRepo.save(credential);
    }

    return res.status(201).json({ data: addedUser, msg: "The user has been added" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};
const get_users = async (_req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);

    // Load users along with their roles
    const users = await userRepo.find({
      relations: ["roles", "extra_permissions"], // <-- add this
    });

    return res.status(200).json({
      data: users,
      msg: "Users fetched successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      isLoggedIn: true,
      error: `Internal server error: ${error.message}`,
    });
  }
};

const delete_user = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const userId = req.params.id; // assuming ID is passed as URL param

    const user = await userRepo.findOneBy({ id: Number(userId) });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    await userRepo.delete(userId);

    return res.status(200).json({
      msg: "User deleted successfully",
      data: userId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

const update_user = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);

    const userId = Number(req.params.id);
    const updatedData = req.body;

    const user = await userRepo.findOne({
      where: { id: userId },
      relations: ["roles", "extra_permissions"], // ✅ matches entity
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    // Handle roles if included
    if (updatedData.roles) {
      const roles = await roleRepo.findBy({
        id: In(updatedData.roles.map((id: string) => Number(id))),
      });
      user.roles = roles;
    }

    // Handle extra permissions if included
    if (updatedData.extra_permissions) {
      const perms = await permissionRepo.findBy({
        id: In(updatedData.extra_permissions.map((id: string) => Number(id))),
      });
      user.extra_permissions = perms;
    }

    // Merge other fields except relations
    const { roles, extra_permissions, ...otherFields } = updatedData;
    userRepo.merge(user, otherFields);

    await userRepo.save(user);
    console.log(user);

    return res.status(200).json({ msg: "User updated successfully", data: user });
  } catch (error: any) {
    return res.status(500).json({
      error: `Internal server error: ${error.message}`,
    });
  }
};

const update_profile_image = async (req: Request, res: Response) => {
  try {
    const userRepo = AppDataSource.getRepository(User);
    const userId = Number(req.params.id);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Handle image replacement
    if (req.file) {
      const fileName = req.file.filename;

      // Remove old image if exists
      if (user.image) {
        const oldImagePath = path.join(__dirname, "../uploads/profiles", path.basename(user.image));

        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }

      user.image = `/profiles/${fileName}`;
    }

    // Merge remaining fields from req.body
    userRepo.merge(user);
    await userRepo.save(user);

    return res.status(200).json({ msg: "User updated successfully", data: user });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
};

export { get_users, create_user, delete_user, update_user, update_profile_image };
