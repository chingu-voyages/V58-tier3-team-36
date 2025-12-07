"use client";
import { useState, useEffect, useCallback } from "react";
import { getChingusList } from "@/api/chingus";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ListPage() {
  const [chingus, setChingus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filter states
  const [searchBy, setSearchBy] = useState("country");
  const [searchValue, setSearchValue] = useState("");
  
  // Initial empty filters state
  const emptyFilters = {
    country: "",
    countryCode: "",
    gender: "",
    roleType: "",
    voyageRole: "",
    soloProjectTier: "",
    voyageTier: "",
    voyage: "",
    yearJoined: "",
  };
  
  const [filters, setFilters] = useState(emptyFilters);

  const searchOptions = [
    { value: "country", label: "Country" },
    { value: "countryCode", label: "Country Code" },
    { value: "voyageTier", label: "Voyage Tier" },
    { value: "yearJoined", label: "Year Joined" },
    { value: "voyageRole", label: "Role" },
    { value: "roleType", label: "Role Type" , type: "select", options: ["Web", "Python", "N/A"] },
    { value: "soloProjectTier", label: "Solo Project Tier" },
    { value: "voyage", label: "Voyage" },
    { value: "gender", label: "Gender", type: "select", options: ["Male", "Female", "Other"] },
  ];

  const fetchChingus = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const params = {
        ...activeFilters,
        page,
        limit: pagination.limit,
        sort: "-timestamp",
      };

      const response = await getChingusList(params);
      setChingus(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err.message || "Failed to fetch Chingu members");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Load all members on initial mount
  useEffect(() => {
    fetchChingus(1);
  }, [fetchChingus]);

  // Refetch when filters change
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(value => value !== "");
    if (hasActiveFilters) {
      fetchChingus(1);
    }
  }, [filters, fetchChingus]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({
      ...emptyFilters,
      [searchBy]: searchValue,
    });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    setFilters(emptyFilters);
  };
  fetchChingus(1);

  const handlePageChange = (newPage) => {
    fetchChingus(newPage);
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

      {/* Search Section */}
      <Card className="p-6 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchBy">Search By</Label>
              <select
                id="searchBy"
                value={searchBy}
                onChange={(e) => setSearchBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {searchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="searchValue">Search Value</Label>
              {searchBy === "roleType" ? (
                <select
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Role</option>
                  <option value="Web">Web</option>
                  <option value="Python">Python</option>
                  <option value="N/A">N/A</option>
                </select>
              ) : searchBy === "gender" ? (
                <select
                  id="searchValue"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <Input
                  id="searchValue"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={`Enter ${
                    searchOptions.find((opt) => opt.value === searchBy)?.label
                  }`}
                />
              )}
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                className="flex-1"
              >
                Clear
              </Button>
            </div>
          </div>
        </form>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([_, value]) => value !== "") && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters)
                .filter(([_, value]) => value !== "")
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {key}: {value}
                  </span>
                ))}
            </div>
          </div>
        )}
      </Card>

      {/* Results Section */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
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

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {chingus.map((chingu) => (
              <Card key={chingu._id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {chingu.yearJoined}
                    </span>
                  </div>

                  <div className="text-sm space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {chingu.countryName} ({chingu.countryCode})
                    </p>
                    {chingu.gender && (
                      <p>
                        <span className="font-medium">Gender:</span> {chingu.gender}
                      </p>
                    )}
                    {chingu.voyageRole && (
                      <p>
                        <span className="font-medium">Role:</span> {chingu.voyageRole}
                      </p>
                    )}
                    {chingu.roleType && (
                      <p>
                        <span className="font-medium">Role Type:</span>{" "}
                        {chingu.roleType}
                      </p>
                    )}
                    {chingu.voyageTier && (
                      <p>
                        <span className="font-medium">Voyage Tier:</span>{" "}
                        {chingu.voyageTier}
                      </p>
                    )}
                    {chingu.soloProjectTier && (
                      <p>
                        <span className="font-medium">Solo Project Tier:</span>{" "}
                        {chingu.soloProjectTier}
                      </p>
                    )}
                    {chingu.voyage && (
                      <p>
                        <span className="font-medium">Voyage:</span>{" "}
                        {chingu.voyage}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {chingus.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No members found matching your criteria.
              </p>
            </div>
          )}

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
