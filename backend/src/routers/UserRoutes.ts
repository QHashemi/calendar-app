import express from "express";
import { create_user, delete_user, get_users, update_profile_image, update_user } from "../controllers/UserController";
import { verifyToken } from "../middleware/verifyToken";
import { profilesUpload } from "../helpers/multer_storage";

const router = express.Router();

// USER ROUTES
router.post("/createUser", verifyToken, create_user);
router.get("/getUser", verifyToken, get_users);
router.delete("/deleteUser/:id", verifyToken, delete_user);

router.put("/updateUser/:id/profile", verifyToken, profilesUpload.single("image"), update_profile_image);
router.put("/updateUser/:id", update_user);


export { router as UserRoutes };
