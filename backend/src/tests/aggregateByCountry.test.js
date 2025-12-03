// tests/aggregateByCountry.test.js

const request = require("supertest");
const express = require("express");

jest.mock("../models/Chingu", () => ({
  aggregate: jest.fn(),
}));

const Chingu = require("../models/Chingu");
const { aggregateByCountry } = require("../controllers/memberController");

// Fake express app
const app = express();
app.get("/api/chingus/aggregate-by-country", aggregateByCountry);

// Helper for escaped regex
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

    const res = await request(app).get("/api/chingus/aggregate-by-country");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockData);

    expect(Chingu.aggregate).toHaveBeenCalledWith([
      { $match: {} },
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

  test("should apply sanitized fuzzy filters + exact voyage + numeric yearJoined", async () => {
    Chingu.aggregate.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/chingus/aggregate-by-country?country=ind.&gender=female?&voyage=V58&yearJoined=2021"
    );

    expect(res.status).toBe(200);

    expect(Chingu.aggregate).toHaveBeenCalledWith([
      {
        $match: {
          $or: [
            {
              countryName: {
                $regex: escapeRegex("ind."),
                $options: "i",
              },
            },
          ],
          gender: {
            $regex: "^" + escapeRegex("female?") + "$",
            $options: "i",
          },
          voyage: "V58",
          yearJoined: 2021,
        },
      },
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

  test("should support multiple countries using $or", async () => {
    Chingu.aggregate.mockResolvedValue([]);

    const res = await request(app).get(
      "/api/chingus/aggregate-by-country?country=Tanzania&country=Kenya"
    );

    expect(res.status).toBe(200);

    expect(Chingu.aggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $match: {
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
          },
        }),
      ])
    );
  });

  test("should return empty array when no results found", async () => {
    Chingu.aggregate.mockResolvedValue([]);

    const res = await request(app).get("/api/chingus/aggregate-by-country");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("should return 500 on server error", async () => {
    Chingu.aggregate.mockRejectedValue(new Error("Aggregation failed"));

    const res = await request(app).get("/api/chingus/aggregate-by-country");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "Server error during aggregation",
    });
  });
});
