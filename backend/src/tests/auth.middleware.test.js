const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Mock response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Mock request object
const mockRequest = (authHeader = null) => {
  const req = {
    header: jest.fn(),
  };
  req.header.mockReturnValue(authHeader);
  return req;
};

// Mock next function
const mockNext = jest.fn();

// Helper to generate valid JWT token
const generateToken = (payload = {}, secret = process.env.JWT_SECRET || 'THE_SECRET_KEY', options = {}) => {
  const defaultPayload = {
    userId: 'testUserId123',
    email: 'test@example.com',
    ...payload,
  };
  return jwt.sign(defaultPayload, secret, { expiresIn: '24h', ...options });
};

describe('Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid Token Scenarios', () => {
    it('should allow requests with valid token', async () => {
      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('testUserId123');
      expect(req.user.email).toBe('test@example.com');
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should correctly attach user info to request object', async () => {
      const customPayload = {
        userId: 'user456',
        email: 'custom@example.com',
        role: 'admin',
      };
      const token = generateToken(customPayload);
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('user456');
      expect(req.user.email).toBe('custom@example.com');
      expect(req.user.role).toBe('admin');
      expect(next).toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      const token = generateToken();
      const req = mockRequest(token);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
    });

    it('should verify token with correct secret', async () => {
      const customSecret = 'CUSTOM_SECRET_KEY';
      const token = generateToken({}, customSecret);
      
      // Temporarily set JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      process.env.JWT_SECRET = customSecret;

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();

      // Restore original secret
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      } else {
        delete process.env.JWT_SECRET;
      }
    });
  });

  describe('Missing Token Scenarios', () => {
    it('should reject requests without Authorization header', async () => {
      const req = mockRequest(null);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with empty Authorization header', async () => {
      const req = mockRequest('');
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with "Bearer " but no token', async () => {
      const req = mockRequest('Bearer ');
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access denied. No token provided.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with undefined Authorization header', async () => {
      const req = mockRequest(undefined);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Token Scenarios', () => {
    it('should reject requests with malformed token', async () => {
      const req = mockRequest('Bearer invalid.token.here');
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject requests with completely invalid token format', async () => {
      const req = mockRequest('Bearer randomstring123');
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject tokens signed with wrong secret', async () => {
      const token = generateToken({}, 'WRONG_SECRET');
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject tokens with tampered payload', async () => {
      const token = generateToken();
      // Tamper with the token by modifying part of it
      const tamperedToken = token.slice(0, -10) + 'tampered12';
      const req = mockRequest(`Bearer ${tamperedToken}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Expired Token Scenarios', () => {
    it('should reject expired tokens', async () => {
      // Create a token that expires immediately
      const token = generateToken({}, process.env.JWT_SECRET || 'THE_SECRET_KEY', { expiresIn: '0s' });
      
      // Wait a tiny bit to ensure it expires
      await new Promise(resolve => setTimeout(resolve, 100));

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject tokens with past expiration date', async () => {
      // Create a token that's already expired
      const token = jwt.sign(
        {
          userId: 'testUser',
          email: 'test@example.com',
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
        },
        process.env.JWT_SECRET || 'THE_SECRET_KEY'
      );

      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock jwt.verify to throw an unexpected error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn(() => {
        throw new Error('Unexpected error');
      });

      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication failed.',
        error: undefined,
      });
      expect(next).not.toHaveBeenCalled();

      // Restore original jwt.verify
      jwt.verify = originalVerify;
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Mock jwt.verify to throw an unexpected error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn(() => {
        throw new Error('Development error');
      });

      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication failed.',
        error: 'Development error',
      });

      // Restore
      jwt.verify = originalVerify;
      process.env.NODE_ENV = originalEnv;
    });

    it('should not leak error details in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      // Mock jwt.verify to throw an unexpected error
      const originalVerify = jwt.verify;
      jwt.verify = jest.fn(() => {
        throw new Error('Production error');
      });

      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Authentication failed.',
        error: undefined,
      });

      // Restore
      jwt.verify = originalVerify;
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Token Payload Verification', () => {
    it('should preserve all token payload fields in req.user', async () => {
      const payload = {
        userId: 'abc123',
        email: 'user@test.com',
        name: 'Test User',
        role: 'user',
        permissions: ['read', 'write'],
      };
      const token = generateToken(payload);
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(req.user.userId).toBe('abc123');
      expect(req.user.email).toBe('user@test.com');
      expect(req.user.name).toBe('Test User');
      expect(req.user.role).toBe('user');
      expect(req.user.permissions).toEqual(['read', 'write']);
      expect(next).toHaveBeenCalled();
    });

    it('should include token metadata (iat, exp) in req.user', async () => {
      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(req.user).toHaveProperty('iat'); // Issued at
      expect(req.user).toHaveProperty('exp'); // Expiration
      expect(typeof req.user.iat).toBe('number');
      expect(typeof req.user.exp).toBe('number');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Integration with Express Routes', () => {
    it('should work correctly in middleware chain', async () => {
      const token = generateToken();
      const req = mockRequest(`Bearer ${token}`);
      const res = mockResponse();
      let nextCalled = false;
      const next = jest.fn(() => { nextCalled = true; });

      await auth(req, res, next);

      expect(nextCalled).toBe(true);
      expect(req.user).toBeDefined();
    });

    it('should not proceed to next middleware on authentication failure', async () => {
      const req = mockRequest('Bearer invalid_token');
      const res = mockResponse();
      const next = mockNext;

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
