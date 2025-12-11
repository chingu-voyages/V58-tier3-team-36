// backend/src/routes/chatRoute.js

const express = require("express");
const { chatController } = require("../controllers/chatController");
// const { chatRateLimiter } = require("../middleware/chatRateLimiter"); // optional

const router = express.Router();

// POST /api/chat
router.post("/", /* chatRateLimiter, */ chatController);

module.exports = router;
