const Chingu = require("../models/Chingu");
const countryCoordinates = require("../data/countryCoordinates.json");

// Escape regex special characters to prevent ReDoS & regex injection
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const aggregateByCountry = async (req, res) => {
  try {
    const {
      country,
      gender,
      roleType,
      role,
      soloProjectTier,
      voyageTier,
      voyage,
      yearJoined,
    } = req.query;

    const matchQuery = {};

    // SAFE regex searches (fuzzy for most fields, exact for gender)
    if (country) {
      const countries = Array.isArray(country) ? country : [country];

      matchQuery.$or = countries.map((c) => ({
        countryName: {
          $regex: escapeRegex(String(c).trim()), // fuzzy contains search
          $options: "i",
        },
      }));
    }

    if (gender)
      matchQuery.gender = { $regex: `^${escapeRegex(gender)}$`, $options: "i" };
    if (roleType)
      matchQuery.roleType = { $regex: escapeRegex(roleType), $options: "i" };
    if (role) matchQuery.role = { $regex: escapeRegex(role), $options: "i" };
    if (soloProjectTier)
      matchQuery.soloProjectTier = {
        $regex: escapeRegex(soloProjectTier),
        $options: "i",
      };
    if (voyageTier)
      matchQuery.voyageTier = {
        $regex: escapeRegex(voyageTier),
        $options: "i",
      };

    //  Voyage should be an exact match like "V58"
    if (voyage) matchQuery.voyage = voyage;

    // Exact numeric match
    if (yearJoined) matchQuery.yearJoined = Number(yearJoined);

    const result = await Chingu.aggregate([
      { $match: matchQuery },

      {
        $group: {
          _id: "$countryCode",
          count: { $sum: 1 },

          // Collect all names, including N/A
          names: { $addToSet: "$countryName" },
        },
      },

      {
        $project: {
          _id: 0,
          countryCode: "$_id",
          count: 1,

          // Filter out "N/A" and null values
          countryName: {
            $first: {
              $filter: {
                input: "$names",
                as: "n",
                cond: {
                  $and: [{ $ne: ["$$n", null] }, { $ne: ["$$n", "N/A"] }],
                },
              },
            },
          },
        },
      },

      { $sort: { count: -1 } },
    ]);

    const enriched = result.map((item) => {
      const code = item.countryCode?.trim().toUpperCase();
      const coords = countryCoordinates[code] || null;

      return {
        ...item,
        coordinates: coords,
      };
    });

    return res.json(enriched);
  } catch (error) {
    console.error("Aggregation error:", error);
    return res.status(500).json({ message: "Server error during aggregation" });
  }
};

const getChingus = async (req, res) => {
  try {
    const {
      country,
      countryCode,
      gender,
      roleType,
      role,
      soloProjectTier,
      voyageTier,
      voyage, // exact match
      yearJoined,
      page = 1,
      limit = 20,
      sort = "-timestamp",
    } = req.query;

    //  Pagination validation
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 20)); // cap at 100

    const query = {};

    // SAFE regex searches (fuzzy for most fields, exact for gender)
    if (country) {
      const countries = Array.isArray(country) ? country : [country];

      query.$or = countries.map((c) => ({
        countryName: {
          $regex: escapeRegex(String(c).trim()),
          $options: "i",
        },
      }));
    }

    if (gender) {
      query.gender = { $regex: `^${escapeRegex(gender)}$`, $options: "i" };
    }

    if (countryCode) {
      query.countryCode = {
        $regex: `^${escapeRegex(countryCode)}$`,
        $options: "i",
      };
    }

    if (roleType)
      query.roleType = { $regex: escapeRegex(roleType), $options: "i" };

    if (role) query.role = { $regex: escapeRegex(role), $options: "i" };

    if (soloProjectTier)
      query.soloProjectTier = {
        $regex: escapeRegex(soloProjectTier),
        $options: "i",
      };

    if (voyageTier)
      query.voyageTier = { $regex: escapeRegex(voyageTier), $options: "i" };

    // Exact match for voyage IDs
    if (voyage) query.voyage = voyage;

    // Exact numeric match
    if (yearJoined) query.yearJoined = Number(yearJoined);

    // Pagination
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Chingu.find(query).sort(sort).skip(skip).limit(limitNum),
      Chingu.countDocuments(query),
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      data,
    });
  } catch (error) {
    console.error("Error fetching chingus:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  aggregateByCountry,
  getChingus,
};
