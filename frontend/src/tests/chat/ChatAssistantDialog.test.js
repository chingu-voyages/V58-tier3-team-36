// frontend/src/tests/chat/ChatAssistantDialog.test.js

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChatAssistantDialog } from "@/components/chat/ChatAssistantDialog";

// --- Minimal stable mocks for shadcn/radix wrappers ---
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children, onOpenChange }) =>
    open ? (
      <div data-testid="dialog-root">
        {/* expose a simple close trigger for tests */}
        <button
          type="button"
          aria-label="close"
          onClick={() => onOpenChange(false)}
        >
          close
        </button>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children, className }) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
}));

// ScrollArea is just a wrapper in tests; we validate "scrollable intent" via className
jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props) => <input {...props} />,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, disabled, onClick, type, className }) => (
    <button
      type={type || "button"}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Render markdown as plain text for predictable assertions
jest.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

describe("ChatAssistantDialog unit tests (success / failure / true / false)", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    process.env.NEXT_PUBLIC_BACKEND_URL = "http://backend.test";
  });

  test("true: renders when isOpen=true and shows initial assistant message", () => {
    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    expect(screen.getByTestId("dialog-root")).toBeInTheDocument();
    expect(screen.getByText("AI Help")).toBeInTheDocument();

    expect(
      screen.getByText(
        /Hi! I’m your in-app assistant for \*\*Chingu Demographics App\*\*/i
      )
    ).toBeInTheDocument();
  });

  test("false: does not render when isOpen=false", () => {
    render(<ChatAssistantDialog isOpen={false} onClose={jest.fn()} />);

    expect(screen.queryByTestId("dialog-root")).not.toBeInTheDocument();
    expect(screen.queryByText("AI Help")).not.toBeInTheDocument();
  });

  test("true: onClose is called when dialog closes", () => {
    const onClose = jest.fn();
    render(<ChatAssistantDialog isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("false -> true: Send button disabled when empty, enabled when input has text", () => {
    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const sendBtn = screen.getByRole("button", { name: /^send$/i });
    const input = screen.getByPlaceholderText(/ask a question about the app/i);

    expect(sendBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: "hello" } });
    expect(sendBtn).not.toBeDisabled();
  });

  test("true: messages container uses scrollable sizing (h-full) inside ScrollArea", () => {
    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const scrollArea = screen.getByTestId("scroll-area");
    // In the updated component, ScrollArea gets `h-full`
    expect(scrollArea.className).toEqual(expect.stringContaining("h-full"));
  });

  test("success: sends question to backend and replaces Thinking… with answer", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ success: true, answer: "success answer" }),
    });

    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/ask a question about the app/i);
    const sendBtn = screen.getByRole("button", { name: /^send$/i });

    fireEvent.change(input, { target: { value: "What is this app?" } });
    fireEvent.click(sendBtn);

    // user message appears
    expect(screen.getByText("What is this app?")).toBeInTheDocument();
    // thinking appears
    expect(screen.getByText("Thinking…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("success answer")).toBeInTheDocument();
    });

    // thinking should be replaced
    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      "http://backend.test/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: "What is this app?", context: {} }),
      })
    );
  });

  test("failure: shows error bubble when backend returns success=false", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ success: false, message: "failure message" }),
    });

    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/ask a question about the app/i);
    const sendBtn = screen.getByRole("button", { name: /^send$/i });

    fireEvent.change(input, { target: { value: "trigger failure" } });
    fireEvent.click(sendBtn);

    expect(screen.getByText("Thinking…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/⚠️ failure message/i)).toBeInTheDocument();
    });

    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
  });

  test("failure: shows error bubble when fetch rejects", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("failure network"));

    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/ask a question about the app/i);
    const sendBtn = screen.getByRole("button", { name: /^send$/i });

    fireEvent.change(input, { target: { value: "trigger failure" } });
    fireEvent.click(sendBtn);

    expect(screen.getByText("Thinking…")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/⚠️ failure network/i)).toBeInTheDocument();
    });

    expect(screen.queryByText("Thinking…")).not.toBeInTheDocument();
  });

  test("true: disables input + shows Sending… while loading", async () => {
    let resolveFetch;
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    render(<ChatAssistantDialog isOpen={true} onClose={jest.fn()} />);

    const input = screen.getByPlaceholderText(/ask a question about the app/i);
    const sendBtn = screen.getByRole("button", { name: /^send$/i });

    fireEvent.change(input, { target: { value: "slow request" } });
    fireEvent.click(sendBtn);

    // Button label switches to Sending…
    expect(screen.getByRole("button", { name: /sending/i })).toBeDisabled();
    // Input disabled while loading
    expect(input).toBeDisabled();

    resolveFetch({
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({ success: true, answer: "done success" }),
    });

    await waitFor(() => {
      expect(screen.getByText("done success")).toBeInTheDocument();
    });
  });
});
