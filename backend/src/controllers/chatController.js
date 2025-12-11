// backend/src/controllers/chatController.js

const { buildChatPrompt } = require("../utils/buildChatPrompt");
const { callGemini } = require("../utils/geminiClient");

const MAX_QUESTION_LENGTH = 1000; // Maximum length allowed for the question

/**
 * POST /api/chat
 * Handles chat requests by building a prompt and calling the Gemini AI API.
 */
const chatController = async (req, res) => {
  try {
    const { question, context } = req.body || {};

    // Basic validation
    if (!question || typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required and must be a non-empty string.",
      });
    }

    // Length limit validation
    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Question is too long. Maximum length is ${MAX_QUESTION_LENGTH} characters.`,
      });
    }

    // Build prompt for Gemini
    const prompt = buildChatPrompt(question, context || {});

    // Call Gemini and get the answer text
    const answer = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      answer,
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while generating a response. Please try again later.",
    });
  }
};

module.exports = {
  chatController,
};
