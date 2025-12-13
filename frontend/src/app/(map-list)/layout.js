"use client";
import Filter from "@/components/filter/Filter";
import { FilterProvider } from "@/context/FilterProvider";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useEffect, useState } from "react";

function MapListLayout({ children }) {
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth();

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("authentication");
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  // Show authentication error
  if (error === "authentication") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access the component. Please sign in to
            continue.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  // Show general error
  else if (error === "general") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Unable to Load Map
          </h2>
          <p className="text-gray-600 mb-6">
            We're having trouble loading the map data. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <FilterProvider>
        <div className="space-y-4">
          <Filter />
          {children}
        </div>
      </FilterProvider>
    );
  }
}

export default MapListLayout;
