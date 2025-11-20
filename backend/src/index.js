require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middlewares
app.use(express.json());

// Routes
const chinguRoutes = require('./routes/chingumember');
app.use('/api/chingus', chinguRoutes);


async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🚀 MongoDB connected");

    app.listen(5000, () => {
      console.log("🔥 Server running on port 5000");
    });
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

startServer();
