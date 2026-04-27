import express from "express";
import rateLimit from "express-rate-limit";
import { askChatbot } from "../controllers/chatbot.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rate limiter: 20 requests per minute per IP
const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please wait a moment before asking another question.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/ask", isAuthenticated, chatbotLimiter, askChatbot);

export default router;
