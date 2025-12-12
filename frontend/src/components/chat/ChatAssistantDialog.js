"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ChatAssistantDialog({ isOpen, onClose }) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text:
        "Hi! I’m your in-app assistant for **Chingu Demographics App**. Ask me about the map, filters, or list.",
    },
  ]);

  const handleOpenChange = (open) => {
    if (!open) onClose && onClose();
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: Date.now(),
      role: "user",
      text: trimmed,
    };

    const thinkingMsg = {
      id: Date.now() + 1,
      role: "ai",
      text: "Thinking…",
      meta: "loading",
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          context: {},
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message ||
            `Chat request failed (${res.status} ${res.statusText})`
        );
      }

      const answer =
        typeof data.answer === "string" && data.answer.trim()
          ? data.answer
          : "I didn’t get a response. Please try again.";

      // Replace the "Thinking…" message with the real answer
      setMessages((prev) =>
        prev.map((msg) =>
          msg.meta === "loading"
            ? { ...msg, text: answer, meta: undefined }
            : msg
        )
      );
    } catch (err) {
      const errorText =
        err?.message || "Something went wrong while contacting the assistant.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.meta === "loading"
            ? { ...msg, text: `⚠️ ${errorText}`, meta: "error" }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="
          w-[92vw] max-w-[92vw] h-[80vh]
          sm:w-[32rem] sm:max-w-[32rem] sm:h-[70vh]
          lg:w-[38rem] lg:max-w-[38rem] lg:h-[75vh]
          flex flex-col min-h-0
        "
      >
        <DialogHeader>
          <DialogTitle className="text-[rgb(var(--color-chingublue))]">
            AI Help
          </DialogTitle>
          <DialogDescription>
            Ask how to use filters, the map, or the list.
          </DialogDescription>
        </DialogHeader>

        {/* Messages (scrollable) */}
        <div className="mt-3 flex-1 min-h-0">
          <ScrollArea className="h-full rounded-md border border-border bg-card">
            <div className="p-3 space-y-2">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                const isError = msg.meta === "error";

                return (
                  <div
                    key={msg.id}
                    className={
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed " +
                      (isUser
                        ? "ml-auto bg-[rgb(var(--color-chingublue))] text-white"
                        : isError
                        ? "mr-auto bg-destructive text-white"
                        : "mr-auto bg-muted text-muted-foreground")
                    }
                  >
                    <div
                      className={
                        "prose prose-sm max-w-none prose-p:my-0 prose-ul:my-0 prose-ol:my-0 " +
                        (msg.role === "user" ? "prose-invert" : "")
                      }
                    >
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Ask a question about the app..."
            value={inputValue}
            disabled={isLoading}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-[rgb(var(--color-chingublue))] hover:bg-[rgb(var(--color-chingublue)/0.9)] text-white"
          >
            {isLoading ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
