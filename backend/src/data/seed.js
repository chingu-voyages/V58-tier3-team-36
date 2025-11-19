require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Chingu = require('../models/Chingu'); 


const MONGO_URI = process.env.MONGO_URI;
const RAW_DATA_PATH = path.join(__dirname, 'chingu_demographics.json');

function normalizeEntry(rawEntry) {
  const timestamp = new Date(rawEntry.Timestamp);
  
  // Guard against invalid dates
  if (isNaN(timestamp.getTime())) {
    console.error(`Skipping entry due to invalid Timestamp: ${rawEntry.Timestamp}`);
    return null;
  }

  return {
    timestamp,
    yearJoined: timestamp.getFullYear(),
    gender: rawEntry.Gender,
    countryCode: rawEntry['Country Code'],
    countryName: rawEntry['Country name (from Country)'],
    goal: rawEntry.Goal,
    source: rawEntry.Source,
    roleType: rawEntry['Role Type'],
    voyageRole: rawEntry['Voyage Role'],
    soloProjectTier: rawEntry['Solo Project Tier'],
    voyageTier: rawEntry['Voyage Tier'],
    voyage: rawEntry['Voyage (from Voyage Signups)'],
  };
}

async function seedDatabase() {
  if (!MONGO_URI || MONGO_URI.includes('localhost') || MONGO_URI.includes('chingu_demographics')) {
    console.warn(MONGO_URI);
  }

  try {
    // Connect to the database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully.');

    // Read and parse the raw JSON data
    console.log(`Reading data from: ${RAW_DATA_PATH}`);
    const rawData = fs.readFileSync(RAW_DATA_PATH, 'utf-8');
    const rawEntries = JSON.parse(rawData);
    console.log(`Found ${rawEntries.length} raw entries.`);

    //Normalize the data
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