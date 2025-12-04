const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authController = require('../controllers/authController');
const User = require('../models/User');

// Create a test app
const app = express();
app.use(express.json());
app.post('/api/auth/google', authController.googleAuth);

// Mock the User model
jest.mock('../models/User');

describe('Auth Controller - Google Auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/google', () => {
    it('should create a new user when user does not exist', async () => {
      const mockUser = {
        _id: 'mockUserId123',
        email: 'newuser@example.com',
        name: 'New User',
        image: 'https://example.com/avatar.jpg',
        googleId: 'google123',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(null);
      User.mockImplementation(() => mockUser);

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          image: 'https://example.com/avatar.jpg',
          googleId: 'google123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toEqual({
        _id: 'mockUserId123',
        email: 'newuser@example.com',
        name: 'New User',
        image: 'https://example.com/avatar.jpg',
      });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should update existing user when user exists', async () => {
      const mockUser = {
        _id: 'existingUserId',
        email: 'existing@example.com',
        name: 'Old Name',
        image: 'https://example.com/old-avatar.jpg',
        googleId: 'google456',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'existing@example.com',
          name: 'Updated Name',
          image: 'https://example.com/new-avatar.jpg',
          googleId: 'google456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.image).toBe('https://example.com/new-avatar.jpg');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      User.findOne.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          googleId: 'google789',
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication failed');
    });

    it('should add googleId to existing user without one', async () => {
      const mockUser = {
        _id: 'existingUserId',
        email: 'existing@example.com',
        name: 'Existing User',
        image: 'https://example.com/avatar.jpg',
        googleId: null,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'existing@example.com',
          name: 'Existing User',
          image: 'https://example.com/avatar.jpg',
          googleId: 'newGoogleId123',
        });

      expect(response.status).toBe(200);
      expect(mockUser.googleId).toBe('newGoogleId123');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'test@example.com',
          // missing name and googleId
        });

      // Depending on your validation, this might return 400 or 500
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
