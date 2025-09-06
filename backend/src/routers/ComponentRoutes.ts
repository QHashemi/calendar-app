import express from "express";

import { verifyToken } from "../middleware/verifyToken";
import { create_component, delete_component, get_components, update_component } from "../controllers/ComponentsController";

const router = express.Router();

// Component routes
router.post("/components", verifyToken, create_component);          // Create a component
router.get("/components", verifyToken, get_components);             // Get all components
router.put("/components/:id", verifyToken, update_component);       // Update a component by ID
router.delete("/components/:id", verifyToken, delete_component);    // Delete a component by ID

export { router as ComponentRoutes };
