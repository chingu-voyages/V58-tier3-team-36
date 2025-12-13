/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import MapPage from "@/components/map/MapComponent";
import { getChingus } from "@/api/chingus";
import { FilterProvider } from "@/context/FilterProvider";

// Mock API
jest.mock("@/api/chingus", () => ({
  getChingus: jest.fn(),
}));

// Mock react-leaflet to avoid ESM issues
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => <div></div>,
  Marker: () => <div></div>,
  Tooltip: ({ children }) => <div>{children}</div>,
  useMap: () => ({ setView: jest.fn() }),
}));

describe("MapPage", () => {
  test("renders loading state", () => {
    getChingus.mockResolvedValue([]);

    render(
      <FilterProvider>
        <MapPage />
      </FilterProvider>
    );

    expect(screen.getByText("Loading map...")).toBeInTheDocument();
  });

  test("mounts the map container after loading", async () => {
    getChingus.mockResolvedValue([
      {
        countryName: "Test",
        countryCode: "TS",
        count: 5,
        coordinates: { lat: 10, lng: 20 },
      },
    ]);

    render(
      <FilterProvider>
        <MapPage />
      </FilterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("map")).toBeInTheDocument();
    });
  });
});
