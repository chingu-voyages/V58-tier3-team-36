// tests/aggregateByCountry.test.js

const request = require("supertest");
const express = require("express");

jest.mock("../models/Chingu", () => ({
  aggregate: jest.fn(),
}));

const Chingu = require("../models/Chingu");
const { aggregateByCountry } = require("../controllers/memberController");

// Create a fake express app
const app = express();
app.get("/api/chingus/aggregate-by-country", aggregateByCountry);

describe("GET /api/chingus/aggregate-by-country", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return aggregated results sorted by count", async () => {
    const mockData = [
      { countryName: "India", count: 5 },
      { countryName: "USA", count: 3 },
    ];

    Chingu.aggregate.mockResolvedValue(mockData);

    const res = await request(app).get(
      "/api/chingus/aggregate-by-country"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);

    // Verify correct Mongo pipeline
    expect(Chingu.aggregate).toHaveBeenCalledWith([
      {
        $group: {
          _id: "$countryName",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          countryName: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);
  });

  test("should return an empty array if aggregation returns none", async () => {
    Chingu.aggregate.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/chingus/aggregate-by-country"
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("should return 500 on server error", async () => {
    Chingu.aggregate.mockRejectedValue(new Error("Aggregation failed"));

    const res = await request(app).get(
      "/api/chingus/aggregate-by-country"
    );

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "Server error during aggregation",
    });
  });
});
