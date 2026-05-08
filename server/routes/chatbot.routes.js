import express from "express";
import { askChatbot } from "../controllers/chatbot.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/ask", isAuthenticated, askChatbot);

export default router;
