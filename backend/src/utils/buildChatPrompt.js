// backend/src/utils/buildChatPrompt.js

/**
 * Build a prompt string for the Chingu Demographics AI helper.
 * This tells Gemini what the app is, what it can help with,
 * and includes the user's question + optional context.
 *
 * @param {string} question - The user's question about the app.
 * @param {object} [context={}] - Optional context (current screen, filters, etc.).
 * @returns {string} - Final prompt to send to Gemini.
 */
function buildChatPrompt(question, context = {}) {
  if (!question || typeof question !== "string" || !question.trim()) {
    throw new Error("Question is required to build a chat prompt.");
  }

  // Safely stringify context for the prompt (if empty, this becomes "{}")
  let contextDescription;
  try {
    contextDescription = JSON.stringify(context, null, 2);
  } catch {
    contextDescription = String(context);
  }

  const appDescription = `
  You are the built-in AI assistant for the **Chingu Demographics App**.
  
  The app helps users explore Chingu members' demographics. It has:
  - A **Map view** that shows pins with member count, country name and country code for countries with Chingu members around the world.
  - A **List view** that shows members in a table-like format.
  - Map and List have a shared **filters panel** that can filter results by:
    - gender
    - country
    - country code
    - yearJoined (year the member joined Chingu)
    - roleType (e.g. mentor, developer, etc.)
    - role
    - soloProjectTier
    - voyageTier
    - voyage (specific voyage number or cohort)
  
  The filters affect both the map and list views:
  - When filters are applied, only matching members should appear on the map and in the list.
  - Users can combine filters (e.g., country + roleType).
  - Users can clear all filters to reset the view.
  `;

  const behaviorRules = `
  Your job:
  - Explain how to use the app, its filters, map, and list.
  - Answer questions like "How can I filter results?" or "What do Map and List do?", "Can I filter multiple options?" based on how this app typically works.
  - If something is not supported in the app, say so clearly instead of inventing features.
  - Keep answers friendly, concise, and focused on practical steps the user can take inside this app.
  - If the user question is unclear, ask a brief clarifying question.
  
  Important:
  - Do NOT invent new endpoints, database collections, or hidden features.
  - Assume you are speaking to an end user, not a developer, unless they clearly ask for technical details.
  `;

  const contextSection = `
  USER CONTEXT (may be empty):
  ${contextDescription}
  `;

  const questionSection = `
  USER QUESTION:
  "${question.trim()}"
  `;

  const finalPrompt = `
  ${appDescription}
  ${behaviorRules}
  ${contextSection}
  ${questionSection}
  Please respond as the in-app assistant for Chingu Demographics, using the context above.
  `.trim();

  return finalPrompt;
}

module.exports = {
  buildChatPrompt,
};
