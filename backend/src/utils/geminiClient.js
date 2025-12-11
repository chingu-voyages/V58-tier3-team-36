// backend/src/utils/geminiClient.js

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL_NAME;

const BASE_URL = "https://generativelanguage.googleapis.com/v1/models";

/**
 * Call Gemini with a single text prompt and return the model's answer text.
 * @param {string} prompt - The fully constructed prompt string.
 * @returns {Promise<string>} The text of the model's response.
 */
async function callGemini(prompt) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set. Add it to backend .env file.");
  }
  if (!API_KEY || typeof API_KEY !== "string" || !API_KEY.trim()) {
    throw new Error("GEMINI_API_KEY must be a non-empty string.");
  }
  if (!MODEL_NAME) {
    throw new Error(
      "GEMINI_MODEL_NAME is not set. Add it to backend .env file."
    );
  }
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    throw new Error("Prompt text is required and must be a non-empty string.");
  }

  const url = `${BASE_URL}/${MODEL_NAME}:generateContent`; //full Gemini API endpoint

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      errorDetail = await response.text();
    } catch {
      // ignore JSON/text parse errors here
    }
    throw new Error(
      `Gemini API error: ${response.status} ${response.statusText} ${errorDetail}`
    );
  }

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";

  if (!text.trim()) {
    throw new Error("Gemini API returned no text response.");
  }

  return text;
}

module.exports = {
  callGemini,
};
