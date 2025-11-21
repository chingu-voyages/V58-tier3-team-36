require('dotenv').config();
const mongoose = require('mongoose');
const Chingu = require('../models/Chingu'); 


const MONGO_URI = process.env.MONGO_URI;
const CHINGU_DEMOGRAPHICS_DATA = "https://raw.githubusercontent.com/chingu-voyages/voyage-project-chingu-map/refs/heads/main/src/assets/chingu_info.json";

function normalizeEntry(rawEntry) {
  let timestamp = new Date(rawEntry.Timestamp);
  
  // Handle empty or invalid timestamps with default year 2010
  if (!rawEntry.Timestamp || isNaN(timestamp.getTime())) {
    timestamp = new Date('2010-01-01');
  }

  return {
    timestamp,
    yearJoined: timestamp.getFullYear(),
    gender: rawEntry.Gender || 'N/A',
    countryCode: rawEntry['Country Code'] || 'N/A',
    countryName: rawEntry['Country name (from Country)'] || 'N/A',
    goal: rawEntry.Goal || 'N/A',
    source: rawEntry.Source || 'N/A',
    roleType: rawEntry['Role Type'] || 'N/A',
    voyageRole: rawEntry['Voyage Role'] || 'N/A',
    soloProjectTier: rawEntry['Solo Project Tier'] || 'N/A',
    voyageTier: rawEntry['Voyage Tier'] || 'N/A',
    voyage: rawEntry['Voyage (from Voyage Signups)'] || 'N/A',
  };
}

async function fetchData() {
  const response = await fetch(CHINGU_DEMOGRAPHICS_DATA);
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  return await response.json();
}

async function seedDatabase() {
  if (!MONGO_URI || MONGO_URI.includes('localhost') || MONGO_URI.includes('chingu_demographics')) {
    console.warn(`Warning: Using local or test database URI: ${MONGO_URI}`);
  }

  try {
    // Connect to the database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully.');

    // Fetch and parse the remote JSON data
    console.log(`Fetching data from: ${CHINGU_DEMOGRAPHICS_DATA}`);
    const rawEntries = await fetchData();
    console.log(`Found ${rawEntries.length} raw entries.`);

    // Normalize the data
    const normalizedEntries = rawEntries
      .map(normalizeEntry)
      .filter(entry => entry !== null);
      
    if (normalizedEntries.length === 0) {
      console.log('No valid entries to insert. Exiting.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Inserting ${normalizedEntries.length} normalized entries...`);

    // Clear existing data and insert new data
    await Chingu.deleteMany({});
    console.log('🗑️ Existing Chingu collection cleared.');

    const result = await Chingu.insertMany(normalizedEntries, { ordered: false });
    
    console.log(`🎉 SUCCESS! Inserted ${result.length} Chingu documents.`);

  } catch (error) {
    console.error('❌ Database seeding failed:', error.message);
    if (error.writeErrors) {
      console.error('Write Errors:', error.writeErrors);
    }
    process.exit(1); 
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seedDatabase();