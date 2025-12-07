import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ListPage from "../app/list/page";
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
          sort: "-timestamp",
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

  describe("Search Functionality", () => {
    it("renders search form with dropdown and input", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
        expect(screen.getByLabelText("Search Value")).toBeInTheDocument();
      });
    });

    it("has all search options in the dropdown", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        const searchBySelect = screen.getByLabelText("Search By");
        expect(searchBySelect).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      expect(searchBySelect).toHaveTextContent("Country");
      expect(searchBySelect).toHaveTextContent("Country Code");
      expect(searchBySelect).toHaveTextContent("Voyage Tier");
      expect(searchBySelect).toHaveTextContent("Year Joined");
      expect(searchBySelect).toHaveTextContent("Role");
      expect(searchBySelect).toHaveTextContent("Role Type");
    });

    it("shows role type dropdown when Role Type is selected", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      fireEvent.change(searchBySelect, { target: { value: "roleType" } });

      await waitFor(() => {
        expect(screen.getByText("Select Role")).toBeInTheDocument();
        const webOptions = screen.getAllByText("Web");
        expect(webOptions.length).toBeGreaterThan(0);
        const pythonOptions = screen.getAllByText("Python");
        expect(pythonOptions.length).toBeGreaterThan(0);
      });
    });

    it("shows gender dropdown when Gender is selected", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      fireEvent.change(searchBySelect, { target: { value: "gender" } });

      await waitFor(() => {
        expect(screen.getByText("Select Gender")).toBeInTheDocument();
        const maleOptions = screen.getAllByText("Male");
        expect(maleOptions.length).toBeGreaterThan(0);
        const femaleOptions = screen.getAllByText("Female");
        expect(femaleOptions.length).toBeGreaterThan(0);
        const otherOptions = screen.getAllByText("Other");
        expect(otherOptions.length).toBeGreaterThan(0);
      });
    });

    it("performs search when form is submitted", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchBySelect, { target: { value: "country" } });
      fireEvent.change(searchValueInput, { target: { value: "Canada" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            country: "Canada",
            page: 1,
            limit: 20,
            sort: "-timestamp",
          })
        );
      });
    });

    it("displays active filters after search", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchValueInput, { target: { value: "United States" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Active Filters:")).toBeInTheDocument();
        expect(screen.getByText(/country: United States/i)).toBeInTheDocument();
      });
    });

    it("clears filters when Clear button is clicked", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search Value")).toBeInTheDocument();
      });

      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });
      const clearButton = screen.getByRole("button", { name: /clear/i });

      // Perform a search
      fireEvent.change(searchValueInput, { target: { value: "Canada" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/country: Canada/i)).toBeInTheDocument();
      });

      // Clear filters
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(screen.queryByText(/country: Canada/i)).not.toBeInTheDocument();
        expect(searchValueInput.value).toBe("");
      });
    });
  });

  describe("Member Cards Display", () => {
    it("displays all member information correctly", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByText(/United States/)).toBeInTheDocument();
      });

      // Check for specific member details
      expect(screen.getByText(/United States/)).toBeInTheDocument();
      expect(screen.getByText(/\(US\)/)).toBeInTheDocument();
      expect(screen.getByText("Developer")).toBeInTheDocument();
      const webElements = screen.getAllByText("Web");
      expect(webElements.length).toBeGreaterThan(0);
      expect(screen.getByText("V58")).toBeInTheDocument();
    });

    it("renders member cards with proper structure", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        const cards = screen.getAllByText(/Country:/);
        expect(cards).toHaveLength(3);
      });
    });

    it("displays conditional fields only when available", async () => {
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
        expect(screen.getByText(/Australia/)).toBeInTheDocument();
      });

      // Should not display labels for missing fields
      expect(screen.queryByText("Gender:")).not.toBeInTheDocument();
      expect(screen.queryByText("Role:")).not.toBeInTheDocument();
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

  describe("Filter by Different Fields", () => {
    it("filters by country code", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchBySelect, { target: { value: "countryCode" } });
      fireEvent.change(searchValueInput, { target: { value: "US" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            countryCode: "US",
          })
        );
      });
    });

    it("filters by year joined", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchBySelect, { target: { value: "yearJoined" } });
      fireEvent.change(searchValueInput, { target: { value: "2024" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            yearJoined: "2024",
          })
        );
      });
    });

    it("filters by voyage tier", async () => {
      getChingusList.mockResolvedValue(mockChingusData);
      render(<ListPage />);

      await waitFor(() => {
        expect(screen.getByLabelText("Search By")).toBeInTheDocument();
      });

      const searchBySelect = screen.getByLabelText("Search By");
      const searchValueInput = screen.getByLabelText("Search Value");
      const searchButton = screen.getByRole("button", { name: /search/i });

      fireEvent.change(searchBySelect, { target: { value: "voyageTier" } });
      fireEvent.change(searchValueInput, { target: { value: "Tier 3" } });
      fireEvent.click(searchButton);

      await waitFor(() => {
        expect(getChingusList).toHaveBeenCalledWith(
          expect.objectContaining({
            voyageTier: "Tier 3",
          })
        );
      });
    });
  });
});
