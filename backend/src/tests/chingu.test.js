const request = require("supertest");
const express = require("express");

// regex
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Mock Chingu 
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

  // ------------------------------------------------
  // PAGINATION TEST
  // ------------------------------------------------
  test("should return paginated results", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [{ name: "Test User" }],
        }),
      }),
    });

    Chingu.countDocuments.mockResolvedValue(10);

    const res = await request(app).get("/api/chingus?page=1&limit=1");

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.total).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(10);
  });

  // ------------------------------------------------
  // COUNTRY — MULTI FUZZY ($or)
  // ------------------------------------------------
  test("should apply fuzzy OR search for country", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });

    Chingu.countDocuments.mockResolvedValue(0);

    const value = "Kenya";
    await request(app).get(`/api/chingus?country=${value}`);

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: [
          {
            countryName: {
              $regex: escapeRegex(value),
              $options: "i",
            },
          },
        ],
      })
    );
  });

  // ------------------------------------------------
  // OTHER FUZZY FIELDS — DIRECT REGEX (NO $or)
  // ------------------------------------------------

  const directFuzzyFields = [
    { key: "roleType", mongo: "roleType" },
    { key: "role", mongo: "role" },
    { key: "soloProjectTier", mongo: "soloProjectTier" },
    { key: "voyageTier", mongo: "voyageTier" },
  ];

  directFuzzyFields.forEach(({ key, mongo }) => {
    test(`should apply fuzzy search for ${key}`, async () => {
      Chingu.find.mockReturnValue({
        sort: () => ({
          skip: () => ({
            limit: () => [],
          }),
        }),
      });

      Chingu.countDocuments.mockResolvedValue(0);

      const value = "v42";

      await request(app).get(`/api/chingus?${key}=${value}`);

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
  // NUMERIC FILTER
  // ------------------------------------------------
  test("should apply numeric filter for yearJoined", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });

    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?yearJoined=2022");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        yearJoined: 2022,
      })
    );
  });

  // ------------------------------------------------
  // SORTING
  // ------------------------------------------------
  test("should handle sorting", async () => {
    const sortMock = jest.fn().mockReturnValue({
      skip: () => ({
        limit: () => [],
      }),
    });

    Chingu.find.mockReturnValue({ sort: sortMock });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?sort=countryName");

    expect(sortMock).toHaveBeenCalledWith("countryName");
  });

  // ------------------------------------------------
  // SERVER ERROR HANDLING
  // ------------------------------------------------
  test("should return 500 on server error", async () => {
    const original = console.error;
    console.error = jest.fn();

    Chingu.find.mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await request(app).get("/api/chingus");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");

    console.error = original;
  });
});
