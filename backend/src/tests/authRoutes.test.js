const request = require('supertest');
const express = require('express');
const authRoutes = require('../routes/auth');
const authController = require('../controllers/authController');

// Mock the auth controller
jest.mock('../controllers/authController');

describe('Auth Routes', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/google', () => {
    it('should call googleAuth controller', async () => {
      authController.googleAuth.mockImplementation((req, res) => {
        res.status(200).json({ success: true });
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          googleId: 'google123',
        });

      expect(response.status).toBe(200);
      expect(authController.googleAuth).toHaveBeenCalled();
    });

    it('should accept JSON payload', async () => {
      authController.googleAuth.mockImplementation((req, res) => {
        res.status(200).json({ 
          receivedData: req.body 
        });
      });

      const testData = {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        googleId: 'google123',
      };

      const response = await request(app)
        .post('/api/auth/google')
        .send(testData);

      expect(response.status).toBe(200);
    });

    it('should handle controller errors', async () => {
      authController.googleAuth.mockImplementation((req, res) => {
        res.status(500).json({ 
          success: false,
          message: 'Internal server error' 
        });
      });

      const response = await request(app)
        .post('/api/auth/google')
        .send({
          email: 'error@example.com',
          name: 'Error User',
          googleId: 'google456',
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
