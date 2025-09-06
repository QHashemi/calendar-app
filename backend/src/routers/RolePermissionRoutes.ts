import { create_permission, get_permissions, update_permission, delete_permission } from "../controllers/PermissionController";
import { create_role, delete_role, get_roles, update_role } from "../controllers/RoleController";
import { verifyToken } from "../middleware/verifyToken";
import express from "express";

const router = express.Router();

// Role routes
router.post("/roles", verifyToken, create_role);
router.get("/roles", verifyToken, get_roles);
router.put("/roles/:roleId", verifyToken, update_role);
router.delete("/roles/:roleId", verifyToken, delete_role);

// Permission routes
router.post("/permissions", verifyToken, create_permission);
router.get("/permissions", verifyToken, get_permissions);
router.put("/permissions/:permissionId", verifyToken, update_permission);
router.delete("/permissions/:permissionId", verifyToken, delete_permission);

export { router as RolePermissionRoutes };
