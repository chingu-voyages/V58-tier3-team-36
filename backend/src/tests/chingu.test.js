// tests/chingu.test.js
const request = require("supertest");
const express = require("express");

// Mock Chingu BEFORE importing controller
jest.mock("../models/Chingu", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

const Chingu = require("../models/Chingu");
const { getChingus } = require("../controllers/memberController");

// Fake express app
const app = express();
app.get("/api/chingus", getChingus);

describe("GET /api/chingus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // PAGINATION
  // -------------------------
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

  // -------------------------
  // FUZZY FILTERS
  // -------------------------

  test("should apply fuzzy search for country", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?country=ind");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        countryName: { $regex: "ind", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for gender", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?gender=fe");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        gender: { $regex: "fe", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for roleType", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?roleType=dev");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        roleType: { $regex: "dev", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for role", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?role=frontend");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        role: { $regex: "frontend", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for soloProjectTier", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?soloProjectTier=2");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        soloProjectTier: { $regex: "2", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for voyageTier", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?voyageTier=5");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        voyageTier: { $regex: "5", $options: "i" },
      })
    );
  });

  test("should apply fuzzy search for voyage", async () => {
    Chingu.find.mockReturnValue({
      sort: () => ({
        skip: () => ({
          limit: () => [],
        }),
      }),
    });
    Chingu.countDocuments.mockResolvedValue(0);

    await request(app).get("/api/chingus?voyage=v42");

    expect(Chingu.find).toHaveBeenCalledWith(
      expect.objectContaining({
        voyage: { $regex: "v42", $options: "i" },
      })
    );
  });

  // -------------------------
  // NUMERIC FILTERS
  // -------------------------

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

  // -------------------------
  // SORTING
  // -------------------------

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

  // -------------------------
  // SERVER ERROR HANDLING
  // -------------------------

  test("should return 500 on server error", async () => {
    Chingu.find.mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await request(app).get("/api/chingus");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });
});
