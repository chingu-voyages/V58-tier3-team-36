// frontend/src/tests/chat/ChatToggleButton.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatToggleButton } from "@/components/chat/ChatToggleButton";

// Mock shadcn Button to a plain button for predictable behavior
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, className, "aria-label": ariaLabel }) => (
    <button
      type={type || "button"}
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  ),
}));

// Mock lucide icon to avoid SVG complexity
jest.mock("lucide-react", () => ({
  MessageCircle: (props) => <svg data-testid="message-icon" {...props} />,
}));

describe("ChatToggleButton unit tests (true / false / success / failure)", () => {
  test("true: renders chat toggle button with label", () => {
    render(<ChatToggleButton onClick={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: /open ai chat assistant/i })
    ).toBeInTheDocument();

    expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    expect(screen.getByTestId("message-icon")).toBeInTheDocument();
  });

  test("success: calls onClick handler when button is clicked", () => {
    const onClick = jest.fn();

    render(<ChatToggleButton onClick={onClick} />);

    fireEvent.click(
      screen.getByRole("button", { name: /open ai chat assistant/i })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("true: button has fixed positioning classes applied", () => {
    render(<ChatToggleButton onClick={jest.fn()} />);

    const button = screen.getByRole("button", {
      name: /open ai chat assistant/i,
    });

    expect(button.className).toEqual(expect.stringContaining("fixed"));
    expect(button.className).toEqual(expect.stringContaining("bottom-4"));
    expect(button.className).toEqual(expect.stringContaining("right-4"));
  });

  test("true: button uses Chingu blue background styling", () => {
    render(<ChatToggleButton onClick={jest.fn()} />);

    const button = screen.getByRole("button", {
      name: /open ai chat assistant/i,
    });

    expect(button.className).toContain("bg-[rgb(var(--color-chingublue))]");
  });

  test("false: does not throw when onClick is undefined", () => {
    expect(() =>
      render(<ChatToggleButton onClick={undefined} />)
    ).not.toThrow();
  });
});
