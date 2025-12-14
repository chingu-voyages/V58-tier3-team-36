
describe("callGemini", () => {
  let callGemini;
  let consoleErrorSpy;

  beforeAll(() => {
    // Ensure env vars exist for the entire test suite
    process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || "test-api-key";
    process.env.GEMINI_MODEL_NAME =
      process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash";
  });

  beforeEach(() => {
    // Force geminiClient to re-read env vars without deleting them
    jest.resetModules();

    // Mock fetch for every test
    global.fetch = jest.fn();

    // Silence expected error logs
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    ({ callGemini } = require("../utils/geminiClient"));
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
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
  test("throws when Gemini API returns non-OK response", async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Model not found",
    });

    await expect(callGemini("hello test")).rejects.toThrow(
      /Gemini API error: 404 Not Found/i
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
  });

  // ------------------------
  // 5. URL, headers, and body
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

    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"
    );

    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers["x-goog-api-key"]).toBe(process.env.GEMINI_API_KEY);

    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.contents[0].parts[0].text).toBe("Hello Gemini");
  });
});