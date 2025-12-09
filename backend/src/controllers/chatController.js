// backend/src/controllers/chatController.js

const { buildChatPrompt } = require("../utils/buildChatPrompt");
const { callGemini } = require("../utils/geminiClient");

/**
 * POST /api/chat
 * Body: { question: string, context?: object }
 */
const chatController = async (req, res) => {
  try {
    const { question, context } = req.body || {};

    // Basic validation
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        error: "Question is required and must be a non-empty string.",
      });
    }

    // Build prompt for Gemini
    const prompt = buildChatPrompt(question, context || {});

    // Call Gemini and get the answer text
    const answer = await callGemini(prompt);

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in /api/chat:", error);

    return res.status(500).json({
      error:
        "Something went wrong while generating a response. Please try again later.",
    });
  }
};

module.exports = {
  chatController,
};
