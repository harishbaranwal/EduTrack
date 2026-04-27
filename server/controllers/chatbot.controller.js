import { getGeminiResponse } from "../services/chatbot.service.js";

export const askChatbot = async (req, res) => {
  try {
    const { message, history } = req.body;

    // Validate message
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Message is required and cannot be empty",
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Message must be less than 1000 characters",
      });
    }

    // Validate history (optional)
    const conversationHistory = Array.isArray(history) ? history.slice(-20) : [];

    const reply = await getGeminiResponse(message.trim(), conversationHistory);

    res.status(200).json({
      success: true,
      data: { reply },
    });
  } catch (error) {
    console.error("Chatbot error:", error.message);

    const statusCode = error.message.includes("not configured") ? 503 : 500;
    
    res.status(statusCode).json({
      success: false,
      message:
        statusCode === 503
          ? "Chatbot service is not configured. Please contact the administrator."
          : "Failed to get response from chatbot. Please try again.",
    });
  }
};
