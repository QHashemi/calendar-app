import { Request, Response } from "express";
import { AppDataSource } from "../db/data-source";
import bcrypt from "bcrypt";
import { User } from "../db/models/UserModel";
import { Credential } from "../db/models/UserCredentials";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRATION, JWT_ACCESS_TOKEN_SECRET_PRIVATEKEY, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY, REFRESH_TOKEN_EXPIRATION } from "../accessTokenConfig";
import { Role } from "../db/models/RoleModel";
import { Permission } from "../db/models/PermissionModel";
import { Roles } from "../config/Rols";

const checkFaildInformation = (data: Object) => {
  const faildValue: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === "") {
      faildValue.push(key);
    }
  }
  return faildValue;
};

const register_user = async (req: Request, res: Response) => {
  try {
    const { email, password, confirm_password, first_name, last_name } = req.body;

    // Validate required fields
    const failedValue = checkFaildInformation(req.body);
    if (failedValue.length > 0) {
      return res.status(400).json({
        msg: `Following information failed: ${failedValue.join(", ")}`,
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ msg: "Passwords do not match!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRepo = AppDataSource.getRepository(User);
    const credentialsRepo = AppDataSource.getRepository(Credential);
    const roleRepo = AppDataSource.getRepository(Role);
    const permissionRepo = AppDataSource.getRepository(Permission);

    // Determine role to assign
    const userCount = await userRepo.count();
    const roleName = userCount === 0 ? "superadmin" : "user";

    let role = await roleRepo.findOne({ where: { name: roleName }, relations: ["permissions"] });

    if (!role) {
      // Create permissions if missing
      const permissions: Permission[] = [];
      for (const permName of Roles[roleName]) {
        let perm = await permissionRepo.findOne({ where: { name: permName } });
        if (!perm) {
          perm = permissionRepo.create({ name: permName });
          await permissionRepo.save(perm);
        }
        permissions.push(perm);
      }

      role = roleRepo.create({
        name: roleName,
        description: roleName === "superadmin" ? "Administrator role with full permissions" : "Default role for regular users",
        permissions,
      });
      await roleRepo.save(role);
    }

    // Create user
    const newUser = userRepo.create({
      first_name,
      last_name,
      email,
      display_name: `${first_name} ${last_name}`,
      roles: [role],
    });
    const savedUser = await userRepo.save(newUser);

    // Save credentials
    const credential = credentialsRepo.create({
      password_hash: hashedPassword,
      password_algo: "bcrypt",
      user: savedUser,
    });
    await credentialsRepo.save(credential);

    return res.status(200).json({
      data: savedUser,
      isLoggedIn: true,
      msg: "User registered successfully!",
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    return res.status(500).json({ msg: "Error registering user" });
  }
};




const login_user = async (req: Request, res: Response) => {
  try {

  
    const { email, password } = req.body;
    const failedValue = checkFaildInformation(req.body);
   

    if (failedValue.length !== 0) {
      return res.status(400).json({
        msg: `Invalid or missing fields: ${failedValue.join(", ")}`,
        isLoggedIn: false,
      });
    }

    const credentialsRepo = AppDataSource.getRepository(Credential);

    // Load user along with roles and permissions
    const credential = await credentialsRepo.findOne({
      where: { user: { email:email } },
      relations: ["user", "user.roles", "user.roles.permissions"],
    });

    
    if (!credential) return res.status(401).json({ msg: "No account found with the provided email.", isLoggedIn: false });

    const user = credential.user;

    if (!credential.password_hash) return res.status(500).json({ msg: "Authentication data is missing for this user.", isLoggedIn: false });

    const passwordCompareResult = bcrypt.compareSync(password, credential.password_hash);
    if (!passwordCompareResult) return res.status(401).json({ msg: "Incorrect password." });

    const accessToken = jwt.sign({ user: { id: user.id, email: user.email } }, JWT_ACCESS_TOKEN_SECRET_PRIVATEKEY, { expiresIn: ACCESS_TOKEN_EXPIRATION, algorithm: "RS256" });

    const refreshToken = jwt.sign({ user: { id: user.id, email: user.email } }, JWT_ACCESS_TOKEN_SECRET_PRIVATEKEY, { expiresIn: REFRESH_TOKEN_EXPIRATION, algorithm: "RS256" });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ msg: "Login successful", data: user, accessToken, isLoggedIn: true });
  } catch (error: any) {
    return res.status(500).json({
      msg: `An error occurred during login: ${error.message || error}`,
    });
  }
};

const logout_user = (req: Request, res: Response) => {
  try {
    // Clear refresh token
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Optional: clear access token if it's also stored in a cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ msg: "User logged out successfully", isLoggedIn: false });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      msg: `There was an error logging out the user: ${error}`,
    });
  }
};

const refresh_token = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token provided" });
    }

    try {
      const decoded: any = jwt.verify(refreshToken, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY);
      const userId = decoded.user.id;

      const credentialsRepo = AppDataSource.getRepository(Credential);
      const credential = await credentialsRepo.findOne({
        where: { user: { id: userId } },
        relations: ["user", "user.roles", "user.roles.permissions"], // include roles & permissions
      });
      if (!credential) return res.status(404).json({ msg: "Account not found!" });

      const accessToken = jwt.sign(
        { user: { id: userId, email: credential.user.email } }, // fix: use email, not id
        JWT_ACCESS_TOKEN_SECRET_PRIVATEKEY,
        { expiresIn: ACCESS_TOKEN_EXPIRATION, algorithm: "RS256" }
      );

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        data: credential.user,
        msg: "Token refreshed",
        isLoggedIn: true,
        accessToken,
      });
    } catch (err: any) {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ error: `Token expired: ${err.message}`, isLoggedIn: false });
      }
      return res.status(500).json({ error: `Invalid token: ${err.message}`, isLoggedIn: false });
    }
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}`, isLoggedIn: false });
  }
};

const refresh_account = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: "No refresh token provided", isLoggedIn: false });
    }

    const decoded: any = jwt.verify(refreshToken, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY);
    const userId = decoded.user.id;

    const credentialsRepo = AppDataSource.getRepository(Credential);
    const credential = await credentialsRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user", "user.roles", "user.roles.permissions"], // include roles & permissions
    });

    if (!credential) return res.status(404).json({ msg: "Account not found!" });

    return res.status(200).json({
      data: credential.user,
      accessToken: accessToken,
      isLoggedIn: true,
      msg: "Account Refreshed",
    });
  } catch (error: any) {
    return res.status(500).json({ error: `Internal server error: ${error.message}`, isLoggedIn: false });
  }
};

const update_password = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const { current_password, new_password, confirm_password } = req.body;

    const failedValue = checkFaildInformation(req.body);
    if (failedValue.length !== 0) {
      return res.status(400).json({ msg: `Invalid or missing fields: ${failedValue.join(", ")}` });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ msg: "New password and confirm password do not match." });
    }

    const credentialsRepo = AppDataSource.getRepository(Credential);
    const credential = await credentialsRepo.findOne({
      where: { user: { id: userId } },
      relations: ["user", "user.roles", "user.roles.permissions"], // include roles & permissions
    });

    if (!credential) return res.status(401).json({ msg: "No account found with the provided ID." });
    if (!credential.password_hash) return res.status(500).json({ msg: "Authentication data is missing for this user." });

    const isPasswordValid = bcrypt.compareSync(current_password, credential.password_hash);
    if (!isPasswordValid) return res.status(401).json({ msg: "Incorrect current password." });

    const newPasswordHash = bcrypt.hashSync(new_password, bcrypt.genSaltSync(10));
    credential.password_hash = newPasswordHash;
    await credentialsRepo.save(credential);

    return res.status(200).json({
      msg: "Password updated successfully.",
      data: {
        userId: credential.user.id,
        email: credential.user.email,
        roles: credential.user.roles, // include roles in response
      },
    });
  } catch (error: any) {
    return res.status(500).json({ msg: `An error occurred while updating the password: ${error.message || error}` });
  }
};

export { register_user, login_user, logout_user, refresh_token, refresh_account, update_password };
