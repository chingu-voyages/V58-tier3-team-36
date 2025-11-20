const Chingu = require('../models/Chingu');

const aggregateByCountry = async (req, res) => {
  try {
    const result = await Chingu.aggregate([
      {
        $group: {
          _id: "$countryName",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          countryName: "$_id",
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.json(result);
  } catch (error) {
    console.error("Aggregation error:", error);
    return res.status(500).json({ message: "Server error during aggregation" });
  }
};

const getChingus = async (req, res) => {
  try {
    const {
      country,
      gender,
      roleType,
      voyage,
      yearJoined,
      page = 1,
      limit = 20,
      sort = "-timestamp",
    } = req.query;

    const query = {};

    // Fuzzy contains search (LIKE %value%), case-insensitive
    if (country) query.countryName = { $regex: country, $options: "i" };
    if (gender) query.gender = { $regex: gender, $options: "i" };
    if (roleType) query.roleType = { $regex: roleType, $options: "i" };
    if (voyage) query.voyage = { $regex: voyage, $options: "i" };

    // Exact numeric match
    if (yearJoined) query.yearJoined = Number(yearJoined);

    // Pagination
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Chingu.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Chingu.countDocuments(query),
    ]);

    return res.json({
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
      data,
    });
  } catch (error) {
    console.error("Error fetching chingus:", error);
    return res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  aggregateByCountry,
  getChingus
};
