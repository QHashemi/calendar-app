import express from "express";
import { get_ms_user, get_ms_user_calendar } from "../controllers/GraphApiController";


const router = express.Router();

// USER ROUTES
router.get("/getMsUser/:id", get_ms_user);
router.get("/getMsUserCalendar/:id", get_ms_user_calendar);

export { router as GraphApiRoutes };
