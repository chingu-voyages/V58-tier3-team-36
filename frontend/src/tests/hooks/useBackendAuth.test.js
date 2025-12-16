import { renderHook } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useBackendAuth } from '@/hooks/useBackendAuth';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

describe('useBackendAuth Hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Extraction', () => {
    it('should correctly extract backend token from session', () => {
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        backendToken: 'mock-jwt-token-12345',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.backendToken).toBe('mock-jwt-token-12345');
      expect(result.current.session).toEqual(mockSession);
    });

    it('should return null when backend token is not present', () => {
      const mockSession = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        // No backendToken
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.backendToken).toBeNull();
    });

    it('should return null when session is null', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.backendToken).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Authentication Status', () => {
    it('should set isAuthenticated to true when backend token exists', () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        backendToken: 'valid-token',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when backend token is missing', () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        // No backendToken
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set isAuthenticated to false when session is null', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should set isAuthenticated to false when backend token is empty string', () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        backendToken: '',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(false);
      // Empty string is falsy, so || null returns null
      expect(result.current.backendToken).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should set isLoading to true when session status is loading', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to false when session status is authenticated', () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        backendToken: 'token',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading to false when session status is unauthenticated', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Return Value Structure', () => {
    it('should return all expected properties', () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        backendToken: 'token123',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current).toHaveProperty('backendToken');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('session');
    });

    it('should return consistent data types', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(result.current.backendToken === null || typeof result.current.backendToken === 'string').toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined session data gracefully', () => {
      useSession.mockReturnValue({
        data: undefined,
        status: 'unauthenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.backendToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle session with only user data (Google auth without backend token)', () => {
      const mockSession = {
        user: {
          id: 'google123',
          email: 'google@example.com',
          name: 'Google User',
          image: 'https://example.com/avatar.jpg',
        },
        // Google OAuth session without backendToken
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.backendToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.session).toEqual(mockSession);
    });

    it('should handle session update from unauthenticated to authenticated', () => {
      const { result, rerender } = renderHook(() => useBackendAuth());

      // Initially unauthenticated
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
      rerender();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.backendToken).toBeNull();

      // Then authenticated with token
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        backendToken: 'new-token',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });
      rerender();

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.backendToken).toBe('new-token');
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle email/password login with backend token', () => {
      const mockSession = {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'user@chingu.io',
          name: 'Chingu User',
        },
        backendToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJlbWFpbCI6InVzZXJAY2hpbmd1LmlvIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.backendToken).toBe(mockSession.backendToken);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle Google OAuth login with backend token', () => {
      const mockSession = {
        user: {
          id: '507f1f77bcf86cd799439012',
          email: 'google.user@gmail.com',
          name: 'Google OAuth User',
          image: 'https://lh3.googleusercontent.com/a/example',
        },
        backendToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example.token',
      };

      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.backendToken).toBeTruthy();
      expect(result.current.session.user.image).toBeDefined();
    });

    it('should handle loading state during initial page load', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      const { result } = renderHook(() => useBackendAuth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.backendToken).toBeNull();
    });
  });
});
