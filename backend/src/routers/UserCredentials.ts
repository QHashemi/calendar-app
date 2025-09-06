import express from "express";
import { login_user, logout_user, refresh_account, refresh_token, register_user, update_password } from "../controllers/CredentialsController";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// USER ROUTES
router.post("/register", register_user);
router.post("/login", login_user);
router.get("/refreshToken", refresh_token);
router.get("/refreshAccount", refresh_account);
router.get("/logout", logout_user);
router.put("/updatePassword/:id", verifyToken ,update_password);
export { router as CredentialRoutes };
