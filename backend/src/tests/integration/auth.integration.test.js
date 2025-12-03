const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/test_auth_db';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('Complete Auth Flow', () => {
    it('should handle complete user creation and update flow', async () => {
      // Step 1: Create new user
      const newUserData = {
        email: 'integration@example.com',
        name: 'Integration User',
        image: 'https://example.com/avatar.jpg',
        googleId: 'google_integration_123',
      };

      const createResponse = await request(app)
        .post('/api/auth/google')
        .send(newUserData);

      expect(createResponse.status).toBe(200);
      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.user.email).toBe(newUserData.email);
      
      const userId = createResponse.body.user._id;

      // Step 2: Verify user exists in database
      const dbUser = await User.findById(userId);
      expect(dbUser).toBeDefined();
      expect(dbUser.email).toBe(newUserData.email);
      expect(dbUser.googleId).toBe(newUserData.googleId);

      // Step 3: Update user (simulate login again)
      const updatedData = {
        email: 'integration@example.com',
        name: 'Updated Integration User',
        image: 'https://example.com/new-avatar.jpg',
        googleId: 'google_integration_123',
      };

      const updateResponse = await request(app)
        .post('/api/auth/google')
        .send(updatedData);

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.user._id).toBe(userId);
      expect(updateResponse.body.user.name).toBe('Updated Integration User');

      // Step 4: Verify update in database
      const updatedDbUser = await User.findById(userId);
      expect(updatedDbUser.name).toBe('Updated Integration User');
      expect(updatedDbUser.image).toBe('https://example.com/new-avatar.jpg');
    });

    it('should handle multiple users correctly', async () => {
      const user1Data = {
        email: 'user1@example.com',
        name: 'User One',
        googleId: 'google1',
      };

      const user2Data = {
        email: 'user2@example.com',
        name: 'User Two',
        googleId: 'google2',
      };

      // Create first user
      const response1 = await request(app)
        .post('/api/auth/google')
        .send(user1Data);

      // Create second user
      const response2 = await request(app)
        .post('/api/auth/google')
        .send(user2Data);

      expect(response1.body.user._id).not.toBe(response2.body.user._id);

      const users = await User.find({});
      expect(users).toHaveLength(2);
    });
  });
});
