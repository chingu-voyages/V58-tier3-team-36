// backend/src/__tests__/geminiClient.test.js

// IMPORTANT: Set env vars BEFORE requiring geminiClient, otherwise they will be undefined.
process.env.GEMINI_API_KEY = "test-api-key";
process.env.GEMINI_MODEL_NAME = "gemini-2.5-flash";

const { callGemini } = require("../utils/geminiClient");

describe("callGemini", () => {
  beforeEach(() => {
    global.fetch = jest.fn(); // mock fetch for every test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // 1. Validate prompt rules
  // ------------------------
  test("throws if prompt is missing/empty/not a string", async () => {
    await expect(callGemini("")).rejects.toThrow(/prompt text is required/i);
    await expect(callGemini("   ")).rejects.toThrow(/prompt text is required/i);
    await expect(callGemini(null)).rejects.toThrow(/prompt text is required/i);
  });

  // ------------------------
  // 2. Non-OK HTTP response from Gemini
  // ------------------------
  test("throws with detailed error when Gemini API returns non-OK response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Model not found",
    });

    await expect(callGemini("hello test")).rejects.toThrow(
      /Gemini API error: 404 Not Found Model not found/
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // ------------------------
  // 3. Successful response with valid text parts
  // ------------------------
  test("returns combined text from candidates on success", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "Hello" }, { text: " world!" }],
            },
          },
        ],
      }),
    });

    const answer = await callGemini("hello");
    expect(answer).toBe("Hello world!");
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // ------------------------
  // 4. Successful HTTP response but no usable text → error
  // ------------------------
  test("throws if Gemini returns no usable text", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "" }],
            },
          },
        ],
      }),
    });

    await expect(callGemini("test empty response")).rejects.toThrow(
      /Gemini API returned no text response/i
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  // ------------------------
  // 5. Test that correct URL and headers are used
  // ------------------------
  test("calls Gemini with correct URL, headers, and body", async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: { parts: [{ text: "response" }] },
          },
        ],
      }),
    });

    await callGemini("Hello Gemini");

    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, options] = global.fetch.mock.calls[0];

    // Check URL
    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
    );

    // Check method + headers
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["x-goog-api-key"]).toBe("test-api-key");

    // Check body contains our prompt
    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.contents[0].parts[0].text).toBe("Hello Gemini");
  });
});
