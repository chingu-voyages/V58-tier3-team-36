// tests/chingu.test.js
const request = require("supertest");
const express = require("express");

// Mock the Chingu model BEFORE importing controller
jest.mock("../models/Chingu", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
}));

const Chingu = require("../models/Chingu");
const { getChingus } = require("../controllers/memberController");

// Create a fake express app to test the controller
const app = express();
app.get("/api/chingus", getChingus);

describe("GET /api/chingus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  test("should apply fuzzy search for country", async () => {
    const regexMatcher = { $regex: "ind", $options: "i" };

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
        countryName: regexMatcher,
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

  test("should return 500 on server error", async () => {
    Chingu.find.mockImplementation(() => {
      throw new Error("DB error");
    });

    const res = await request(app).get("/api/chingus");

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Server error");
  });
});
