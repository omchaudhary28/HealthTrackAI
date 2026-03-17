import { Router } from "express";
import { sendChatbotMessage } from "../controllers/chatbot.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();

router.post("/message", asyncHandler(sendChatbotMessage));

export default router;
