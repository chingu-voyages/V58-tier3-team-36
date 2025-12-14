require("dotenv").config();

const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("../../routes/authRoutes");
const User = require("../../models/User");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const uniqueId = (prefix = "google") =>
  `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const MONGO_URI =
  process.env.MONGO_TEST_URI || "mongodb+srv://chinguv58team36tier3:PXWI353WNL2Qvxay@cluster0.a0yctt7.mongodb.net/test_auth_db";

describe("Authentication Integration Tests", () => {
  beforeAll(async () => {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET missing for integration tests");
    }

    await mongoose.connect(MONGO_URI);

    const dbName = mongoose.connection.name;
    if (!dbName.includes("test")) {
      throw new Error("❌ Refusing to run tests on non-test database");
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /**
   * ⚠️ IMPORTANT
   * We clean the DB BEFORE each test,
   * not AFTER (to avoid mid-test deletion).
   */
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("Complete Auth Flow", () => {
    it("should create a user and update the same user on repeat Google login", async () => {
      const googleId = uniqueId("google_integration");

      const createResponse = await request(app).post("/api/auth/google").send({
        email: "integration@example.com",
        name: "Integration User",
        image: "https://example.com/avatar.jpg",
        googleId,
      });

      expect(createResponse.status).toBe(200);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.user.email).toBe("integration@example.com");

      const createdUser = await User.findOne({ googleId });
      expect(createdUser).not.toBeNull();

      const updateResponse = await request(app).post("/api/auth/google").send({
        email: "integration@example.com",
        name: "Updated Integration User",
        image: "https://example.com/new-avatar.jpg",
        googleId,
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.user.name).toBe("Updated Integration User");

      const users = await User.find({ googleId });
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe("Updated Integration User");
    });

    it("should handle multiple users correctly", async () => {
      const user1 = {
        email: "user1@example.com",
        name: "User One",
        googleId: uniqueId("google_user1"),
      };

      const user2 = {
        email: "user2@example.com",
        name: "User Two",
        googleId: uniqueId("google_user2"),
      };

      const r1 = await request(app).post("/api/auth/google").send(user1);
      const r2 = await request(app).post("/api/auth/google").send(user2);

      expect(r1.status).toBe(200);
      expect(r2.status).toBe(200);

      const u1 = await User.findOne({ googleId: user1.googleId });
      const u2 = await User.findOne({ googleId: user2.googleId });

      expect(u1).not.toBeNull();
      expect(u2).not.toBeNull();

      const users = await User.find({});
      expect(users).toHaveLength(2);
    });
  });
});
