const request = require("supertest");
const express = require("express");

// Reproduce the same escapeRegex used in the controller
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mock Chingu model
jest.mock("../models/Chingu", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

const Chingu = require("../models/Chingu");
const { getChingus } = require("../controllers/memberController");

const app = express();
app.get("/api/chingus", getChingus);

describe("GET /api/chingus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Small helper to mock the chainable query
  const mockFindChain = (data = []) => {
    const limitMock = jest.fn().mockResolvedValue(data);
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
    const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

    Chingu.find.mockReturnValue({ sort: sortMock });
    return { sortMock, skipMock, limitMock };
  };

  // ------------------------------------------------
  // PAGINATION TEST
  // ------------------------------------------------
  test("should return paginated results", async () => {
    mockFindChain([{ name: "Test User" }]);
    Chingu.countDocuments.mockResolvedValue(10);

    const res = await request(app).get("/api/chingus?page=1&limit=1");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.total).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(1);
    expect(res.body.totalPages).toBe(10);

    // Also ensure query object was empty (no filters)
    expect(Chingu.find).toHaveBeenCalledWith({});
  });

  // ------------------------------------------------
  // COUNTRY — MULTI FUZZY ($or)
  // ------------------------------------------------
  test("should apply fuzzy OR search for multiple country values", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const res = await request(app).get(
      "/api/chingus?country=Tanzania&country=Kenya"
    );

    expect(res.status).toBe(200);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          {
            countryName: {
              $regex: escapeRegex("Tanzania"),
              $options: "i",
            },
          },
          {
            countryName: {
              $regex: escapeRegex("Kenya"),
              $options: "i",
            },
          },
        ],
      })
    );
  });


  // COUNTRY CODE — case-insensitive exact match
  test("should apply case-insensitive exact match for countryCode", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/chingus?countryCode=in");

    expect(res.status).toBe(200);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        countryCode: {
          $regex: "^in$", // escaped + anchored
          $options: "i",
        },
      })
    );
  });

  // ------------------------------------------------
  // OTHER FIELDS — DIRECT REGEX (NO $or)
  // ------------------------------------------------
  const directFuzzyFields = [
    { key: "roleType", mongo: "roleType" },
    { key: "role", mongo: "role" },
    { key: "soloProjectTier", mongo: "soloProjectTier" },
    { key: "voyageTier", mongo: "voyageTier" },
  ];

  directFuzzyFields.forEach(({ key, mongo }) => {
    test(`should apply fuzzy search for ${key}`, async () => {
      mockFindChain([]);
      Chingu.countDocuments.mockResolvedValue(0);

      const value = "v42";

      const res = await request(app).get(`/api/chingus?${key}=${value}`);
      expect(res.status).toBe(200);

      expect(Chingu.find).toHaveBeenCalledWith(
        expect.objectContaining({
          [mongo]: {
            $regex: escapeRegex(value),
            $options: "i",
          },
        })
      );
    });
  });

  // ------------------------------------------------
  // CASE-INSENSITIVE EXACT MATCH — GENDER
  // ------------------------------------------------
  test("should apply case-insensitive exact match filter for gender", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const value = "Male";

    const res = await request(app).get(`/api/chingus?gender=${value}`);
    expect(res.status).toBe(200);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: {
          $regex: `^${escapeRegex(value)}$`,
          $options: "i",
        },
      })
    );
  });

  // ------------------------------------------------
  // EXACT MATCH — VOYAGE
  // ------------------------------------------------
  test("should apply exact match filter for voyage", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const voyage = "v58-tier3-team-36";

    const res = await request(app).get(`/api/chingus?voyage=${voyage}`);
    expect(res.status).toBe(200);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        voyage,
      })
    );
  });

  // ------------------------------------------------
  // NUMERIC FILTER — yearJoined
  // ------------------------------------------------
  test("should apply numeric filter for yearJoined", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/chingus?yearJoined=2022");
    expect(res.status).toBe(200);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        yearJoined: 2022,
      })
    );
  });

  // ------------------------------------------------
  // SORTING
  // ------------------------------------------------
  test("should handle sorting param", async () => {
    const limitMock = jest.fn().mockResolvedValue([]);
    const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
    const sortMock = jest.fn().mockReturnValue({ skip: skipMock });

    Chingu.find.mockReturnValue({ sort: sortMock });
    Chingu.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/chingus?sort=countryName");
    expect(res.status).toBe(200);

    expect(sortMock).toHaveBeenCalledWith("countryName");
  });

  // ------------------------------------------------
  // PAGINATION VALIDATION (min/max)
  // ------------------------------------------------
  test("should clamp page and limit to valid ranges", async () => {
    mockFindChain([]);
    Chingu.countDocuments.mockResolvedValue(0);

    const res = await request(app).get("/api/chingus?page=-5&limit=5000");

    expect(res.status).toBe(200);
    // page should be clamped to 1, limit clamped to 100
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(100);
  });

  // ------------------------------------------------
  // SERVER ERROR HANDLING
  // ------------------------------------------------
    test("should return 500 on server error", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => Promise.reject(new Error("Connection failed")),
        }),
      }),
    });
    Chingu.countDocuments.mockRejectedValue(new Error("Count failed"));

    const res = await request(app).get("/api/chingus");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });
  
});
