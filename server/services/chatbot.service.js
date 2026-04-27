import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `You are EduBot, a friendly and knowledgeable education assistant for the EduTrack learning platform. Your role is to help students, teachers, and educators with general education-related questions and doubts.

You can help with:
- Explaining concepts from any subject (Science, Math, History, Geography, Computer Science, etc.)
- Clarifying doubts about how things work (e.g., "How does photosynthesis work?", "What is gravity?")
- Providing definitions and explanations
- Helping understand formulas, theories, and principles
- Giving study tips and learning strategies
- Explaining educational terminology

Rules you MUST follow:
1. ONLY answer education-related questions. If someone asks something unrelated to education (like personal advice, entertainment, politics, or anything non-educational), politely redirect them by saying: "I'm EduBot, and I specialize in education-related topics! Feel free to ask me about any subject or concept you'd like to learn about. 📚"
2. Keep your answers clear, concise, and easy to understand
3. Use examples when explaining complex concepts
4. Format your responses with proper structure — use bullet points, numbered lists, and bold text where helpful
5. Be encouraging and supportive — remember, there are no silly questions!
6. If a topic is very broad, give a concise overview and offer to explain specific parts in more detail`;

// Fallback model chain — if one fails (429/quota), try the next
const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
];

/**
 * Get a response from Gemini API with automatic model fallback.
 * Tries each model in order; if one fails, moves to the next.
 * @param {string} message - The user's question
 * @param {Array} history - Previous conversation messages [{role, text}]
 * @returns {Promise<string>} - The AI response text
 */
export const getGeminiResponse = async (message, history = []) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Build conversation history for chat
  const chatHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Trying model: ${modelName}`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      });

      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(message);
      const reply = result.response.text();

      if (reply) {
        console.log(`Success with model: ${modelName}`);
        return reply;
      }
    } catch (error) {
      console.warn(`Model ${modelName} failed: ${error.message}`);
      lastError = error;
      // Continue to next model
    }
  }

  // All models failed
  throw lastError || new Error("All Gemini models failed to respond");
};
