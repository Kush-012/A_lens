/**
 * routes/index.js
 *
 * Root router — mounts all sub-routers under their prefixes.
 */

import { Router } from "express";
import chatRoutes from "./chat.js";
import dashboardRoutes from "./dashboard.js";
import marketRoutes from "./market.js";

const router = Router();

router.use("/api", chatRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/market", marketRoutes);

export default router;
