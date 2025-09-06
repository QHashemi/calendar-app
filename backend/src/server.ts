import express, { Request, Response } from "express";
import cors from "cors";
import { UserRoutes } from "./routers/UserRoutes";
import { AppDataSource } from "./db/data-source";
import { EventRoutes } from "./routers/EventRoutes";
import { CredentialRoutes } from "./routers/UserCredentials";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { RolePermissionRoutes } from "./routers/RolePermissionRoutes";
import { ComponentRoutes } from "./routers/ComponentRoutes";

// Import your idempotent seeding function
import { seedRolesPermissionsAndComponents } from "./seed-roles-permissions";

const app = express();
const PORT = 4000;

dotenv.config();

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000", // exact frontend URL
    credentials: true, // allow cookies/credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

AppDataSource.initialize()
  .then(async () => {
    console.log("Data source has been initialized!");

    // Run seeding on startup (idempotent)
    await seedRolesPermissionsAndComponents();
    // Routes
    app.get("/", (req: Request, res: Response) => res.send("HELLO"));
    app.use("/calendar", UserRoutes);
    app.use("/calendar", EventRoutes);
    app.use("/calendar", CredentialRoutes);
    app.use("/calendar", RolePermissionRoutes);
    app.use("/calendar", ComponentRoutes);

    // Static file serving
    app.use("/calendar/uploads", express.static(`${path.resolve(".")}/src/uploads`));
    app.use("/calendar/uploads", express.static("/backend/src/uploads"));

    app.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
  })
  .catch((error) => {
    console.error("❌ Error initializing DataSource or seeding:", error);
    process.exit(1);
  });
