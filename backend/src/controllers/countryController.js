const fs = require("fs");
const path = require("path");

const getCountries = (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "data", "countryCodes.json");
    const raw = fs.readFileSync(filePath, "utf8");
    let countries = JSON.parse(raw);

    // Optional search filter
    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      countries = countries.filter(
        (c) =>
          c.countryName.toLowerCase().includes(q) ||
          c.countryCode.toLowerCase().includes(q)
      );
    }

    // Always limit to 10
    res.status(200).json(countries.slice(0, 10));
  } catch (err) {
    console.error("Error loading countries:", err);
    res.status(500).json({ message: "Failed to load countries" });
  }
};

module.exports = { getCountries };
