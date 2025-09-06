import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_TOKEN_SECRET_PUBLICKEY } from "../accessTokenConfig";

// Extend Express Request interface to add 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: any; // adjust type as needed
  }
}

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Unauthorized - no token provided", isLoggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_TOKEN_SECRET_PUBLICKEY);
    req.user = decoded; // attach decoded payload
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Unauthorized - invalid token", isLoggedIn: false });
  }
}
