// =====================
// aggregateByCountry.test.js
// =====================

const { aggregateByCountry } = require("../controllers/memberController");
const Chingu = require("../models/Chingu");

// Mock the Chingu model
jest.mock("../models/Chingu");

// Mock country coordinates
jest.mock("../data/countryCoordinates.json", () => ({
  US: { lat: 37.0902, lng: -95.7129 },
  GB: { lat: 55.3781, lng: -3.436 },
  CA: { lat: 56.1304, lng: -106.3468 },
}));

describe("aggregateByCountry", () => {
  let req, res;

  beforeEach(() => {
    req = { query: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    jest.clearAllMocks();
  });

  // Dummy data returned from aggregate
  const mockAggregateResult = [
    { countryCode: "US", count: 10, countryName: "United States" },
    { countryCode: "GB", count: 5, countryName: "United Kingdom" },
  ];

  // ------------------------
  // SUCCESS CASES
  // ------------------------
  describe("Successful aggregations", () => {
    test("aggregates with no filters", async () => {
      const mockAggregate = jest.fn().mockResolvedValue([
        { countryCode: "US", count: 10, countryName: "United States" },
      ]);
      Chingu.aggregate = mockAggregate;

      await aggregateByCountry(req, res);

      expect(mockAggregate).toHaveBeenCalled();

      const pipeline = mockAggregate.mock.calls[0][0];

      // Validate the $project stage EXACTLY
      const project = pipeline.find((p) => p.$project);

      expect(project.$project.countryName).toEqual({
        $first: {
          $filter: {
            input: "$names",
            as: "n",
            cond: {
              $and: [
                { $ne: ["$$n", null] },
                { $ne: ["$$n", "N/A"] },
              ],
            },
          },
        },
      });

      const result = res.json.mock.calls[0][0];
      expect(result[0]).toMatchObject({
        countryCode: "US",
        count: 10,
        countryName: "United States",
        coordinates: { lat: 37.0902, lng: -95.7129 },
      });
    });

    test("filters by fuzzy country", async () => {
      req.query.country = "United";
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.$or[0].countryName).toEqual({
        $regex: "United",
        $options: "i",
      });
    });

    test("filters by multiple countries", async () => {
      req.query.country = ["United States", "United Kingdom"];
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);

      const match = Chingu.aggregate.mock.calls[0][0][0].$match;
      expect(match.$or).toHaveLength(2);
      expect(match.$or[0].countryName.$regex).toBe("United States");
      expect(match.$or[1].countryName.$regex).toBe("United Kingdom");
    });

    test("gender exact match", async () => {
      req.query.gender = "Male";
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.gender).toEqual({
        $regex: "^Male$",
        $options: "i",
      });
    });

    test("roleType fuzzy", async () => {
      req.query.roleType = "Developer";
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.roleType).toEqual({
        $regex: "Developer",
        $options: "i",
      });
    });

    test("filters numeric year", async () => {
      req.query.yearJoined = "2023";
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.yearJoined).toBe(2023);
    });

    test("enriches coordinates", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);

      await aggregateByCountry(req, res);
      const result = res.json.mock.calls[0][0];

      expect(result[0].coordinates).toEqual({ lat: 37.0902, lng: -95.7129 });
      expect(result[1].coordinates).toEqual({ lat: 55.3781, lng: -3.436 });
    });

    test("handles missing coordinates", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue([
        { countryCode: "ZZ", count: 3, countryName: "Unknown" },
      ]);

      await aggregateByCountry(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result[0].coordinates).toBeNull();
    });

    test("sorts descending", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue(mockAggregateResult);
      await aggregateByCountry(req, res);

      const pipeline = Chingu.aggregate.mock.calls[0][0];
      expect(pipeline[pipeline.length - 1]).toEqual({ $sort: { count: -1 } });
    });
  });

  // ------------------------
  // REGEX SANITIZATION
  // ------------------------
  describe("Regex safety", () => {
    test("escapes regex in country", async () => {
      req.query.country = "United.*States";
      Chingu.aggregate = jest.fn().mockResolvedValue([]);

      await aggregateByCountry(req, res);

      const match = Chingu.aggregate.mock.calls[0][0][0].$match;
      expect(match.$or[0].countryName.$regex).toBe("United\\.\\*States");
    });

    test("escapes regex across all fields", async () => {
      req.query = {
        gender: "Male+",
        roleType: "Dev[eloper]",
        role: "Front$end",
        soloProjectTier: "Tier^1",
        voyageTier: "Tier(2)",
      };
      Chingu.aggregate = jest.fn().mockResolvedValue([]);

      await aggregateByCountry(req, res);

      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.gender.$regex).toBe("^Male\\+$");
      expect(match.roleType.$regex).toBe("Dev\\[eloper\\]");
      expect(match.role.$regex).toBe("Front\\$end");
    });
  });

  // ------------------------
  // EDGE CASES
  // ------------------------
  describe("Edge cases", () => {
    test("empty country array", async () => {
      req.query.country = [];
      Chingu.aggregate = jest.fn().mockResolvedValue([]);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.$or).toEqual([]);
    });

    test("trims whitespace", async () => {
      req.query.country = "  United States  ";
      Chingu.aggregate = jest.fn().mockResolvedValue([]);

      await aggregateByCountry(req, res);
      const match = Chingu.aggregate.mock.calls[0][0][0].$match;

      expect(match.$or[0].countryName.$regex).toBe("United States");
    });

    test("lowercase countryCode still matches coordinates", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue([
        { countryCode: "us", count: 10, countryName: "United States" },
      ]);

      await aggregateByCountry(req, res);
      const result = res.json.mock.calls[0][0];

      expect(result[0].coordinates).toEqual({ lat: 37.0902, lng: -95.7129 });
    });

    test("whitespace countryCode", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue([
        { countryCode: " US ", count: 10, countryName: "United States" },
      ]);

      await aggregateByCountry(req, res);
      const result = res.json.mock.calls[0][0];

      expect(result[0].coordinates).toEqual({ lat: 37.0902, lng: -95.7129 });
    });

    test("no results returns empty array", async () => {
      Chingu.aggregate = jest.fn().mockResolvedValue([]);
      await aggregateByCountry(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });

  // ------------------------
  // ERROR HANDLING
  // ------------------------
  describe("Error handling", () => {
    test("returns 500 on error", async () => {
      Chingu.aggregate = jest.fn().mockRejectedValue(new Error("DB Error"));

      await aggregateByCountry(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Server error during aggregation",
      });
    });

    test("logs error", async () => {
      const spy = jest.spyOn(console, "error").mockImplementation();
      const err = new Error("DB Error");

      Chingu.aggregate = jest.fn().mockRejectedValue(err);

      await aggregateByCountry(req, res);

      expect(spy).toHaveBeenCalledWith("Aggregation error:", err);
      spy.mockRestore();
    });
  });
});
