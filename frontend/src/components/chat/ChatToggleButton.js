"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatToggleButton({ onClick }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="
        fixed bottom-4 right-4 z-50
        flex items-center gap-2
        rounded-full shadow-lg
        px-4 py-3
        bg-[rgb(var(--color-chingublue))]
        hover:bg-[rgb(var(--color-chingublue)/0.9)]
        text-white
      "
      aria-label="Open AI chat assistant"
    >
      <MessageCircle className="h-5 w-5 shrink-0" />
      <span className="text-sm sm:text-base font-medium">Chat Assistant</span>
    </Button>
  );
}
