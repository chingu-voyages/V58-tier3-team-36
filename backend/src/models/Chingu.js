const mongoose = require('mongoose');

const ChinguSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  yearJoined: {
    type: Number,
    required: true,
    index: true
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'NON-BINARY', 'PREFER NOT TO SAY', 'OTHER'],
    required: true
  },
  countryCode: {
    type: String, // e.g., NZ, IN, US
    required: true,
    index: true // Index for country-based map aggregation
  },
  countryName: {
    type: String, // e.g., New Zealand, India
    required: true
  },
  goal: {
    type: String, // e.g., ACCELERATE LEARNING, GAIN EXPERIENCE
    required: true
  },
  source: {
    type: String, // e.g., PERSONAL NETWORK, GOOGLE SEARCH
    required: true
  },
  roleType: {
    type: String, // e.g., Web, Python, UX/UI
    required: true
  },
  voyageRole: {
    type: String, // e.g., Developer, Designer
    required: true
  },
  soloProjectTier: {
    type: String
  },
  voyageTier: {
    type: String
  },
  voyage: {
    type: String // e.g., V58
  },
}, { 
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Export the model
module.exports = mongoose.model('Chingu', ChinguSchema);