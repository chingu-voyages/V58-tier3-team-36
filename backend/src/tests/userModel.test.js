const mongoose = require('mongoose');
const User = require('../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    // Use in-memory database for testing
    await mongoose.connect('mongodb://localhost:27017/test_db');
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('User Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        googleId: 'google123',
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.image).toBe(userData.image);
      expect(savedUser.googleId).toBe(userData.googleId);
      expect(savedUser.createdAt).toBeDefined();
    });

    it('should convert email to lowercase', async () => {
      const user = new User({
        email: 'TEST@EXAMPLE.COM',
        name: 'Test User',
        googleId: 'google123',
      });

      const savedUser = await user.save();
      expect(savedUser.email).toBe('test@example.com');
    });

    it('should fail when email is missing', async () => {
      const user = new User({
        name: 'Test User',
        googleId: 'google123',
      });

      let error;
      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.email).toBeDefined();
    });

    it('should fail when name is missing', async () => {
      const user = new User({
        email: 'test@example.com',
        googleId: 'google123',
      });

      let error;
      try {
        await user.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.errors.name).toBeDefined();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'duplicate@example.com',
        name: 'User One',
        googleId: 'google1',
      };

      await new User(userData).save();

      const duplicateUser = new User({
        email: 'duplicate@example.com',
        name: 'User Two',
        googleId: 'google2',
      });

      let error;
      try {
        await duplicateUser.save();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB duplicate key error
    });

    it('should allow user without image', async () => {
      const user = new User({
        email: 'noimage@example.com',
        name: 'No Image User',
        googleId: 'google456',
      });

      const savedUser = await user.save();
      expect(savedUser.image).toBeUndefined();
    });

    it('should set createdAt timestamp automatically', async () => {
      const user = new User({
        email: 'timestamp@example.com',
        name: 'Timestamp User',
        googleId: 'google789',
      });

      const before = new Date();
      const savedUser = await user.save();
      const after = new Date();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(savedUser.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
