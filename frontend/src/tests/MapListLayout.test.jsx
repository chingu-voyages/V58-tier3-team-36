/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapListLayout from "@/app/(map-list)/layout";

// 🔹 mock router
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// 🔹 mock auth hook
jest.mock("@/hooks/useBackendAuth", () => ({
  useBackendAuth: jest.fn(),
}));

// 🔹 mock Filter component
jest.mock("@/components/filter/Filter", () => () => (
  <div data-testid="filter">Filter Component</div>
));

// 🔹 mock FilterProvider
jest.mock("@/context/FilterProvider", () => ({
  FilterProvider: ({ children }) => (
    <div data-testid="filter-provider">{children}</div>
  ),
}));

import { useBackendAuth } from "@/hooks/useBackendAuth";

describe("MapListLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. Unauthenticated user
  it("shows authentication required screen when user is not authenticated", async () => {
    useBackendAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <MapListLayout>
        <div>Protected Content</div>
      </MapListLayout>
    );

    expect(
      screen.getByText("Authentication Required")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Protected Content")
    ).not.toBeInTheDocument();
  });

  // ✅ 2. Redirect to login
  it("redirects to login when clicking Go to Login button", async () => {
    const user = userEvent.setup();

    useBackendAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(<MapListLayout />);

    await user.click(
      screen.getByRole("button", { name: /go to login/i })
    );

    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  // ✅ 3. Authenticated user
  it("renders filter and children when authenticated", () => {
    useBackendAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    render(
      <MapListLayout>
        <div data-testid="children">Map Content</div>
      </MapListLayout>
    );

    expect(screen.getByTestId("filter-provider")).toBeInTheDocument();
    expect(screen.getByTestId("filter")).toBeInTheDocument();
    expect(screen.getByTestId("children")).toBeInTheDocument();
  });

  // ✅ 4. Loading state
  it("does not show authentication error while auth is loading", () => {
    useBackendAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });

    render(
      <MapListLayout>
        <div>Loading Content</div>
      </MapListLayout>
    );

    expect(
      screen.queryByText("Authentication Required")
    ).not.toBeInTheDocument();
  });
});
