/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from "@testing-library/react";
import MapPage from "@/components/map/MapComponent";
import { getChingus } from "@/api/chingus";

// Mock the API to avoid calling real backend
jest.mock("@/api/chingus", () => ({
  getChingus: jest.fn(),
}));

// VERY SIMPLE: mock react-leaflet to avoid ESM errors
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

    render(<MapPage />);

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

    render(<MapPage />);

    await waitFor(() => {
      expect(screen.getByTestId("map")).toBeInTheDocument();
    });
  });
});
