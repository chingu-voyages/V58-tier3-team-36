"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { useFilter } from "@/context/FilterProvider";
import { getChingusList } from "@/api/chingus";
import { Button } from "@/components/ui/button";

export default function ListPage() {
  const [chingus, setChingus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(20);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });
  const [sortField, setSortField] = useState("yearJoined");
  const [sortOrder, setSortOrder] = useState("desc");
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useBackendAuth();
  const { filters, searchTrigger } = useFilter();

  const fetchChingus = useCallback(async (page = 1, filterParams = {}) => {
    setLoading(true);
    setError(null);
    try {
      const sortPrefix = sortOrder === "desc" ? "-" : "";
      
      // Build params object with only non-empty filters
      const params = {
        page,
        limit,
        sort: `${sortPrefix}${sortField}`,
      };

      // Add filters only if they have values
      if (filterParams.gender) {
        params.gender = filterParams.gender;
      }
      if (filterParams.yearJoined) {
        params.yearJoined = filterParams.yearJoined;
      }
      if (filterParams.roleType) {
        params.roleType = filterParams.roleType;
      }
      // Backend uses 'role' not 'voyageRole'
      if (filterParams.voyageRole) {
        params.role = filterParams.voyageRole;
      }
      // Send countryCode as array - axios will serialize it properly
      if (filterParams.countryCode && filterParams.countryCode.length > 0) {
        params.countryCode = filterParams.countryCode;
      }
      if (filterParams.soloProjectTier) {
        params.soloProjectTier = filterParams.soloProjectTier;
      }
      if (filterParams.voyageTier) {
        params.voyageTier = filterParams.voyageTier;
      }
      if (filterParams.voyage) {
        params.voyage = filterParams.voyage;
      }

      const response = await getChingusList(params);
      setChingus(response.data);
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
     
        setError(err.message || "Failed to fetch Chingu members");
     
    } finally {
      setLoading(false);
    }
  }, [limit, sortField, sortOrder]);

 

  // Load all members on initial mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchChingus(1, filters);
    }
  }, [isAuthenticated]);

  // Refetch data when filters change (triggered by search button)
  useEffect(() => {
    if (searchTrigger === 0) return;
    if (isAuthenticated) {
      fetchChingus(1, filters);
    }
  }, [searchTrigger, filters, isAuthenticated, fetchChingus]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Re-fetch when sort changes
  useEffect(() => {
    if (isAuthenticated && chingus.length > 0) {
      fetchChingus(pagination.page, filters);
    }
  }, [sortField, sortOrder, fetchChingus, pagination.page, filters]);

  const handlePageChange = (newPage) => {
    fetchChingus(newPage, filters);
  };

  // Helper function to get visible page numbers for pagination
  const getVisiblePages = () => {
    const { page, totalPages } = pagination;
    const pages = [];

    // Always show first page
    if (totalPages >= 1) pages.push(1);

    // Show current page and adjacent pages
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push("ellipsis-1");
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push("ellipsis-2");
    }

    // Always show last page (if it's not already included)
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Chingu Members</h1>

      {/* Results Section */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

    

      {error && error !== "authentication" && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {chingus.length} of {pagination.total} members
            </p>
            <p className="text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </p>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("yearJoined")}
                  >
                    <div className="flex items-center gap-2">
                      Year Joined
                      <span className="text-xs">
                        {sortField === "yearJoined" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("countryName")}
                  >
                    <div className="flex items-center gap-2">
                      Country
                      <span className="text-xs">
                        {sortField === "countryName" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("countryCode")}
                  >
                    <div className="flex items-center gap-2">
                      Country Code
                      <span className="text-xs">
                        {sortField === "countryCode" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("gender")}
                  >
                    <div className="flex items-center gap-2">
                      Gender
                      <span className="text-xs">
                        {sortField === "gender" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("voyageRole")}
                  >
                    <div className="flex items-center gap-2">
                      Voyage Role
                      <span className="text-xs">
                        {sortField === "voyageRole" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("roleType")}
                  >
                    <div className="flex items-center gap-2">
                      Role Type
                      <span className="text-xs">
                        {sortField === "roleType" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("voyageTier")}
                  >
                    <div className="flex items-center gap-2">
                      Voyage Tier
                      <span className="text-xs">
                        {sortField === "voyageTier" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("soloProjectTier")}
                  >
                    <div className="flex items-center gap-2">
                      Solo Project Tier
                      <span className="text-xs">
                        {sortField === "soloProjectTier" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("voyage")}
                  >
                    <div className="flex items-center gap-2">
                      Voyage
                      <span className="text-xs">
                        {sortField === "voyage" && (sortOrder === "asc" ? "↑" : "↓")}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {chingus.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-8 text-center text-gray-600">
                      No members found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  chingus.map((chingu, index) => (
                    <tr 
                      key={chingu._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm border-b">
                        <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {chingu.yearJoined}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.countryName || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.countryCode || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.gender || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.voyageRole || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.roleType || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.voyageTier || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.soloProjectTier || '-'}</td>
                      <td className="px-4 py-3 text-sm border-b">{chingu.voyage || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                variant="outline"
              >
                Previous
              </Button>
              
              <div className="flex gap-1">
                {getVisiblePages().map((page, index) => {
                  // Render ellipsis
                  if (typeof page === "string") {
                    return (
                      <span key={page} className="px-3 py-2">
                        ...
                      </span>
                    );
                  }

                  // Render page button
                  return (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      variant={
                        pagination.page === page ? "default" : "outline"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
