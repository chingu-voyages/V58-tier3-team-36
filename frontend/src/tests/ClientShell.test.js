// frontend/src/tests/components/ClientShell.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ClientShell from "@/components/ClientShell";

// Mock ChatToggleButton to control click behavior
jest.mock("@/components/chat/ChatToggleButton", () => ({
  ChatToggleButton: ({ onClick }) => (
    <button type="button" onClick={onClick}>
      toggle
    </button>
  ),
}));

// Mock ChatAssistantDialog to observe open/close state
jest.mock("@/components/chat/ChatAssistantDialog", () => ({
  ChatAssistantDialog: ({ isOpen, onClose }) => (
    <div>
      <div data-testid="chat-open">{String(isOpen)}</div>
      <button type="button" onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

describe("ClientShell unit tests (true / false / success / failure)", () => {
  test("false: chat dialog is closed by default", () => {
    render(<ClientShell />);
    expect(screen.getByTestId("chat-open")).toHaveTextContent("false");
  });

  test("success: clicking toggle opens the chat (true)", () => {
    render(<ClientShell />);

    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("chat-open")).toHaveTextContent("true");
  });

  test("success: clicking close closes the chat (false)", () => {
    render(<ClientShell />);

    fireEvent.click(screen.getByRole("button", { name: /toggle/i }));
    expect(screen.getByTestId("chat-open")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.getByTestId("chat-open")).toHaveTextContent("false");
  });

  test("true: chat toggle button is always rendered", () => {
    render(<ClientShell />);
    expect(screen.getByRole("button", { name: /toggle/i })).toBeInTheDocument();
  });
});
