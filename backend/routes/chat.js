
import { Router } from "express";
import { chatStream, healthCheck } from "../controllers/chatController.js";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// POST /api/chat — Main SSE streaming endpoint
router.post("/chat", chatRateLimiter, chatStream);

// GET /api/health — Health check
router.get("/health", healthCheck);

export default router;
