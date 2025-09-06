import express from "express";
import { create_event, delete_event, get_events, update_event } from "../controllers/EventController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// event ROUTES
router.post("/events", verifyToken, create_event);
router.get("/events", verifyToken, get_events);
router.put("/events/:eventId", verifyToken, update_event);
router.delete("/events/:eventId", delete_event);


export { router as EventRoutes };
