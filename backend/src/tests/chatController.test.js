// backend/src/tests/chatController.test.js

const { chatController } = require("../controllers/chatController");

// Mock the utilities used by the controller
jest.mock("../utils/buildChatPrompt", () => ({
  buildChatPrompt: jest.fn(),
}));

jest.mock("../utils/geminiClient", () => ({
  callGemini: jest.fn(),
}));

const { buildChatPrompt } = require("../utils/buildChatPrompt");
const { callGemini } = require("../utils/geminiClient");

// Helper to create a mock res object with chained status().json()
function createMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("chatController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when question is missing or empty", async () => {
    const res = createMockRes();

    // Case 1: no body
    let req = { body: {} };

    await chatController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Question is required and must be a non-empty string.",
    });

    jest.clearAllMocks();

    // Case 2: empty string
    req = { body: { question: "   " } };
    await chatController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Question is required and must be a non-empty string.",
    });
  });

  test("returns 200 and AI answer when question is valid", async () => {
    const req = {
      body: {
        question: "How do I use the filters?",
        context: { screen: "list", filters: { country: "Canada" } },
      },
    };
    const res = createMockRes();

    buildChatPrompt.mockReturnValue("PROMPT_FOR_GEMINI");
    callGemini.mockResolvedValue("Mocked AI answer");

    await chatController(req, res);

    // buildChatPrompt called correctly
    expect(buildChatPrompt).toHaveBeenCalledTimes(1);
    expect(buildChatPrompt).toHaveBeenCalledWith("How do I use the filters?", {
      screen: "list",
      filters: { country: "Canada" },
    });

    // callGemini called with built prompt
    expect(callGemini).toHaveBeenCalledTimes(1);
    expect(callGemini).toHaveBeenCalledWith("PROMPT_FOR_GEMINI");

    // Response
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "AI response generated successfully.",
      answer: "Mocked AI answer",
    });
  });

  test("uses empty context object when context is not provided", async () => {
    const req = {
      body: {
        question: "No context question",
        // no context
      },
    };
    const res = createMockRes();

    buildChatPrompt.mockReturnValue("PROMPT_NO_CONTEXT");
    callGemini.mockResolvedValue("Answer with no context");

    await chatController(req, res);

    expect(buildChatPrompt).toHaveBeenCalledWith("No context question", {});
    expect(callGemini).toHaveBeenCalledWith("PROMPT_NO_CONTEXT");

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "AI response generated successfully.",
      answer: "Answer with no context",
    });
  });

  test("returns 500 when an internal error occurs (e.g., Gemini throws)", async () => {
    const req = {
      body: {
        question: "Trigger error",
      },
    };
    const res = createMockRes();

    buildChatPrompt.mockReturnValue("PROMPT_ERROR_CASE");
    callGemini.mockRejectedValue(new Error("Gemini failed"));

    await chatController(req, res);

    expect(buildChatPrompt).toHaveBeenCalledTimes(1);
    expect(callGemini).toHaveBeenCalledTimes(1);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message:
        "Something went wrong while generating a response. Please try again later.",
    });
  });
});
