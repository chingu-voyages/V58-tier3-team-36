// backend/src/__tests__/buildChatPrompt.test.js

const { buildChatPrompt } = require("../utils/buildChatPrompt");

describe("buildChatPrompt", () => {
  test("throws if question is empty or only whitespace", () => {
    expect(() => buildChatPrompt("")).toThrow(
      /question is required to build a chat prompt/i
    );
    expect(() => buildChatPrompt("   ")).toThrow(
      /question is required to build a chat prompt/i
    );
    // non-string
    expect(() => buildChatPrompt(null)).toThrow(
      /question is required to build a chat prompt/i
    );
  });

  test("includes the user question in the final prompt", () => {
    const question = "How do I filter by country and role?";
    const prompt = buildChatPrompt(question);

    expect(prompt).toContain("USER QUESTION:");
    expect(prompt).toContain("How do I filter by country and role?");
  });

  test("includes core app description in the prompt", () => {
    const question = "What does the map do?";
    const prompt = buildChatPrompt(question);

    expect(prompt).toContain("Chingu Demographics App");
    expect(prompt).toContain("Map view");
    expect(prompt).toContain("List view");
    expect(prompt).toContain("filters panel");
  });

  test("stringifies provided context and includes it in the prompt", () => {
    const question = "How do I use filters on the list page?";
    const context = {
      screen: "list",
      filters: {
        country: "Canada",
        roleType: "developer",
      },
    };

    const prompt = buildChatPrompt(question, context);

    // context block label
    expect(prompt).toContain("USER CONTEXT (may be empty):");

    // bits of the JSON.stringify(context)
    expect(prompt).toContain('"screen": "list"');
    expect(prompt).toContain('"country": "Canada"');
    expect(prompt).toContain('"roleType": "developer"');
  });

  test("falls back to String(context) if JSON.stringify fails", () => {
    const question = "Test non-JSON-serializable context";

    // Create a circular reference to break JSON.stringify
    const badContext = {};
    badContext.self = badContext;

    const prompt = buildChatPrompt(question, badContext);

    // In this case, we expect String(context) to appear
    // The default for an object is "[object Object]"
    expect(prompt).toContain("USER CONTEXT (may be empty):");
    expect(prompt).toContain("[object Object]");
  });
});
