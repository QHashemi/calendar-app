// types.d.ts
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: number;
        // add other properties you want here
      };
    }
  }
}
