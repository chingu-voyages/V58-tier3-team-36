"use client";
import Filter from "@/components/filter/Filter";
import { FilterProvider } from "@/context/FilterProvider";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function MapListLayout({ children }) {
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setError("authentication");
      
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
   else if(isAuthenticated) {
    return (
      <FilterProvider>
        <div className="space-y-4">
          <Filter />
          {children}
        </div>
      </FilterProvider>
    );
  }else{
    <div>Something happened </div>
  }
}

export default MapListLayout;
