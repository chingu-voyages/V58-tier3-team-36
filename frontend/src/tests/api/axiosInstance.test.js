// Mock next-auth BEFORE any imports
const mockGetSession = jest.fn();
jest.mock("next-auth/react", () => ({
  getSession: mockGetSession,
}));

// Create a proper axios mock
const mockInterceptorHandlers = [];
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn((successHandler, errorHandler) => {
        mockInterceptorHandlers.push({ successHandler, errorHandler });
        return 0; // Return mock interceptor ID
      }),
    },
    response: {
      use: jest.fn(),
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock("axios", () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe("Axios Instance and Interceptor", () => {
  let requestInterceptor;
  let errorInterceptor;

  // Import after mocks are set up
  beforeAll(() => {
    // This will trigger the module and register interceptors
    require("@/api/axiosInstance");

    // Get the registered interceptor
    if (mockInterceptorHandlers.length > 0) {
      requestInterceptor = mockInterceptorHandlers[0].successHandler;
      errorInterceptor = mockInterceptorHandlers[0].errorHandler;
    }
  });

  beforeEach(() => {
    mockGetSession.mockClear();
  });

  describe("Axios Instance Configuration", () => {
    it("should create axios instance with correct baseURL", () => {
      const axios = require("axios");
      expect(axios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
        })
      );
    });

    it("should register request interceptor", () => {
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });

  describe("Request Interceptor - Authorization Header", () => {
    it("should attach Authorization header when backend token is present", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
        backendToken: "mock-jwt-token-12345",
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(mockGetSession).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe("Bearer mock-jwt-token-12345");
      expect(result).toBe(mockConfig); // Should return the same config object
    });

    it("should attach Authorization header with Bearer prefix", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
        backendToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token",
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus/aggregate-by-country",
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe(
        `Bearer ${mockSession.backendToken}`
      );
      // Should preserve existing headers
      expect(result.headers["Content-Type"]).toBe("application/json");
    });

    it("should not add Authorization header when session is null", async () => {
      mockGetSession.mockResolvedValue(null);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(mockGetSession).toHaveBeenCalled();
      expect(result.headers.Authorization).toBeUndefined();
      expect(result).toBe(mockConfig);
    });

    it("should not add Authorization header when session has no backendToken", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
        // No backendToken (e.g., Google auth without backend token)
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should not add Authorization header when backendToken is empty string", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
        backendToken: "",
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should not add Authorization header when backendToken is undefined", async () => {
      const mockSession = {
        user: { id: "user123", email: "test@example.com" },
        backendToken: undefined,
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });
  });

  describe("Request Interceptor - Multiple Request Types", () => {
    it("should attach token to GET requests", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should attach token to POST requests", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "POST",
        headers: {},
        data: { name: "Test" },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should attach token to PUT requests", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus/123",
        method: "PUT",
        headers: {},
        data: { name: "Updated" },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should attach token to DELETE requests", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus/123",
        method: "DELETE",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe("Bearer test-token");
    });
  });

  describe("Request Interceptor - Error Handling", () => {
    it("should handle getSession errors gracefully", async () => {
      mockGetSession.mockRejectedValue(new Error("Session retrieval failed"));

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      // Should not throw, should proceed without token
      await expect(requestInterceptor(mockConfig)).rejects.toThrow(
        "Session retrieval failed"
      );
    });

    it("should handle getSession returning undefined", async () => {
      mockGetSession.mockResolvedValue(undefined);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
      expect(result).toBe(mockConfig);
    });

    it("should handle malformed session objects", async () => {
      mockGetSession.mockResolvedValue({
        // Missing user and backendToken
      });

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should propagate interceptor errors correctly", async () => {
      const error = new Error("Request error");

      await expect(errorInterceptor(error)).rejects.toThrow("Request error");
    });
  });

  describe("Request Interceptor - Preserving Existing Configuration", () => {
    it("should preserve existing headers when adding Authorization", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Custom-Header": "custom-value",
        },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe("Bearer test-token");
      expect(result.headers["Content-Type"]).toBe("application/json");
      expect(result.headers["X-Custom-Header"]).toBe("custom-value");
    });

    it("should not override existing Authorization header if present", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {
          Authorization: "Bearer existing-token",
        },
      };

      const result = await requestInterceptor(mockConfig);

      // Should override with session token
      expect(result.headers.Authorization).toBe("Bearer test-token");
    });

    it("should preserve request data and params", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "POST",
        headers: {},
        data: { name: "Test Data" },
        params: { page: 1, limit: 20 },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.data).toEqual({ name: "Test Data" });
      expect(result.params).toEqual({ page: 1, limit: 20 });
      expect(result.headers.Authorization).toBe("Bearer test-token");
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle authenticated user making API call", async () => {
      const mockSession = {
        user: {
          id: "507f1f77bcf86cd799439011",
          email: "user@chingu.io",
          name: "Chingu User",
        },
        backendToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token",
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus/aggregate-by-country",
        method: "GET",
        headers: {},
        params: { country: "US" },
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe(
        `Bearer ${mockSession.backendToken}`
      );
      expect(result.params).toEqual({ country: "US" });
    });

    it("should handle unauthenticated user making API call", async () => {
      mockGetSession.mockResolvedValue(null);

      const mockConfig = {
        url: "/api/public/data",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
      expect(mockGetSession).toHaveBeenCalled();
    });

    it("should handle Google OAuth user with backend token", async () => {
      const mockSession = {
        user: {
          id: "google-user-123",
          email: "google.user@gmail.com",
          name: "Google User",
          image: "https://lh3.googleusercontent.com/a/example",
        },
        backendToken: "google-backend-token-456",
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBe(
        "Bearer google-backend-token-456"
      );
    });

    it("should handle Google OAuth user without backend token", async () => {
      const mockSession = {
        user: {
          id: "google-user-123",
          email: "google.user@gmail.com",
          name: "Google User",
          image: "https://lh3.googleusercontent.com/a/example",
        },
        // No backendToken - older Google auth
      };

      mockGetSession.mockResolvedValue(mockSession);

      const mockConfig = {
        url: "/api/chingus",
        method: "GET",
        headers: {},
      };

      const result = await requestInterceptor(mockConfig);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should handle rapid consecutive requests", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      const requests = [
        { url: "/api/chingus", method: "GET", headers: {} },
        {
          url: "/api/chingus/aggregate-by-country",
          method: "GET",
          headers: {},
        },
        { url: "/api/chingus/123", method: "GET", headers: {} },
      ];

      const results = await Promise.all(
        requests.map((config) => requestInterceptor(config))
      );

      results.forEach((result) => {
        expect(result.headers.Authorization).toBe("Bearer test-token");
      });
      expect(mockGetSession).toHaveBeenCalledTimes(3);
    });
  });

  describe("Interceptor Integration", () => {
    it("should be called for every request made through api instance", async () => {
      const mockSession = { backendToken: "test-token" };
      mockGetSession.mockResolvedValue(mockSession);

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledTimes(
        2
      );

      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function)
      );
    });
  });
});
