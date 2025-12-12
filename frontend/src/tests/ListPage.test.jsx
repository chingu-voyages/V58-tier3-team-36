import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListPage from "@/app/(map-list)/list/page";
import { getChingusList } from "@/api/chingus";

// Mock the API module
jest.mock("@/api/chingus");

// Mock data
const mockChingusData = {
  page: 1,
  limit: 20,
  total: 50,
  totalPages: 3,
  data: [
    {
      _id: "1",
      countryName: "United States",
      countryCode: "US",
      gender: "Male",
      voyageRole: "Developer",
      roleType: "Web",
      voyageTier: "Tier 3",
      soloProjectTier: "Tier 2",
      voyage: "V58",
      yearJoined: 2024,
    },
    {
      _id: "2",
      countryName: "Canada",
      countryCode: "CA",
      gender: "Female",
      voyageRole: "Designer",
      roleType: "Python",
      voyageTier: "Tier 2",
      soloProjectTier: "Tier 1",
      voyage: "V57",
      yearJoined: 2023,
    },
    {
      _id: "3",
      countryName: "United Kingdom",
      countryCode: "UK",
      gender: "Other",
      voyageRole: "Product Manager",
      roleType: "N/A",
      voyageTier: "Tier 1",
      soloProjectTier: "N/A",
      voyage: "V56",
      yearJoined: 2022,
    },
  ],
};

const mockEmptyData = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  data: [],
};

describe("ListPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console errors in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("Initial Render", () => {
    it("renders the page title", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);
      expect(screen.getByText("Chingu Members")).toBeInTheDocument();
    });

    it("displays loading state initially", () => {
      getChingusList.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      render(<ListPage />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("fetches and displays all members on mount", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          sort: "-yearJoined",
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/United States/)).toBeInTheDocument();
        expect(screen.getByText(/Canada/)).toBeInTheDocument();
        expect(screen.getByText(/United Kingdom/)).toBeInTheDocument();
      });
    });

    it("displays pagination information", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Showing 3 of 50 members")).toBeInTheDocument();
        expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
      });
    });
  });

  describe("Table Display and Sorting", () => {
    it("renders table with all column headers", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Year Joined")).toBeInTheDocument();
      });

      expect(screen.getByText("Country")).toBeInTheDocument();
      expect(screen.getByText("Country Code")).toBeInTheDocument();
      expect(screen.getByText("Gender")).toBeInTheDocument();
      expect(screen.getByText("Voyage Role")).toBeInTheDocument();
      expect(screen.getByText("Role Type")).toBeInTheDocument();
      expect(screen.getByText("Voyage Tier")).toBeInTheDocument();
      expect(screen.getByText("Solo Project Tier")).toBeInTheDocument();
      expect(screen.getByText("Voyage")).toBeInTheDocument();
    });

    it("displays sort indicator on default sorted column", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("↓")).toBeInTheDocument();
      });
    });

    it("changes sort order when column header is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Country")).toBeInTheDocument();
      });

      const countryHeader = screen.getByText("Country").closest("th");
      fireEvent.click(countryHeader);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "countryName",
          })
        );
      });
    });

    it("toggles sort order when same column is clicked again", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Year Joined")).toBeInTheDocument();
      });

      const yearJoinedHeader = screen.getByText("Year Joined").closest("th");
      
      // First click - should toggle to ascending
      fireEvent.click(yearJoinedHeader);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "yearJoined",
          })
        );
      });
    });
  });

  describe("Table Data Display", () => {
    it("displays all member information correctly in table rows", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("United States")).toBeInTheDocument();
      });

      // Check for specific member details in table
      expect(screen.getByText("United States")).toBeInTheDocument();
      expect(screen.getByText("US")).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
      expect(screen.getByText("Web")).toBeInTheDocument();
      expect(screen.getByText("V58")).toBeInTheDocument();
      expect(screen.getByText("2024")).toBeInTheDocument();
    });

    it("renders table rows for all members", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("United States")).toBeInTheDocument();
      });

      expect(screen.getByText("Canada")).toBeInTheDocument();
      expect(screen.getByText("United Kingdom")).toBeInTheDocument();
    });

    it("displays dash for missing fields", async () => {
      const dataWithMissingFields = {
        ...mockChingusData,
        data: [
          {
            _id: "4",
            countryName: "Australia",
            countryCode: "AU",
            yearJoined: 2024,
            // Missing gender, role, roleType, etc.
          },
        ],
      };

      getChingusList.mockResolvedValue(dataWithMissingFields);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Australia")).toBeInTheDocument();
      });

      // Should display dashes for missing fields in table
      const tableCells = screen.getAllByText("-");
      expect(tableCells.length).toBeGreaterThan(0);
    });
  });

  describe("Pagination", () => {
    it("renders pagination controls when totalPages > 1", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
      });
    });

    it("disables Previous button on first page", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        const previousButton = screen.getByRole("button", { name: /previous/i });
        expect(previousButton).toBeDisabled();
      });
    });

    it("navigates to next page when Next button is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole("button", { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });

    it("navigates to specific page when page number is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        const pageButtons = screen.getAllByRole("button", { name: /^[0-9]+$/ });
        expect(pageButtons.length).toBeGreaterThan(0);
      });

      const pageButtons = screen.getAllByRole("button", { name: /^[0-9]+$/ });
      const page2Button = pageButtons.find((btn) => btn.textContent === "2");
      
      if (page2Button) {
        fireEvent.click(page2Button);

        await waitFor(() => {
          expect(getChingusList).toHaveBeenCalledWith(
            expect.objectContaining({
              page: 2,
            })
          );
        });
      }
    });

    it("does not render pagination when totalPages is 1", async () => {
      const singlePageData = {
        ...mockChingusData,
        total: 3,
        totalPages: 1,
      };

      getChingusList.mockResolvedValue(singlePageData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /next/i })).not.toBeInTheDocument();
      });
    });
  });

  describe("Empty States and Error Handling", () => {
    it("displays empty state when no members are found", async () => {
      getChingusList.mockResolvedValue(mockEmptyData);
      render(<ListPage />);

      await waitFor(() => {
        expect(
          screen.getByText("No members found matching your criteria.")
        ).toBeInTheDocument();
      });
    });

    it("displays error message when API call fails", async () => {
      getChingusList.mockRejectedValue(new Error("Network error"));
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });
    });

    it("displays custom error message from API", async () => {
      getChingusList.mockRejectedValue(new Error("Custom error message"));
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Custom error message")).toBeInTheDocument();
      });
    });
  });

  describe("Sorting by Different Columns", () => {
    it("sorts by country code when header is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Country Code")).toBeInTheDocument();
      });

      const countryCodeHeader = screen.getByText("Country Code").closest("th");
      fireEvent.click(countryCodeHeader);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "countryCode",
          })
        );
      });
    });

    it("sorts by gender when header is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Gender")).toBeInTheDocument();
      });

      const genderHeader = screen.getByText("Gender").closest("th");
      fireEvent.click(genderHeader);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "gender",
          })
        );
      });
    });

    it("sorts by voyage tier when header is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText("Voyage Tier")).toBeInTheDocument();
      });

      const voyageTierHeader = screen.getByText("Voyage Tier").closest("th");
      fireEvent.click(voyageTierHeader);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: "voyageTier",
          })
        );
      });
    });
  });
});
