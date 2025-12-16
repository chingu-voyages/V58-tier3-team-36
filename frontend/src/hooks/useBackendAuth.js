import { useSession } from 'next-auth/react';

/**
 * Custom hook to access backend authentication token
 * @returns {Object} { backendToken: string | null, isAuthenticated: boolean, isLoading: boolean }
 */
export function useBackendAuth() {
  const { data: session, status } = useSession();
  
  return {
    backendToken: session?.backendToken || null,
    isAuthenticated: !!session?.backendToken,
    isLoading: status === 'loading',
    session,
  };
}
