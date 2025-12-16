"use client";

import { useState } from "react";
import { ChatToggleButton } from "./chat/ChatToggleButton";
import { ChatAssistantDialog } from "./chat/ChatAssistantDialog";

export default function ClientShell() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Floating chat button (always visible) */}
      <ChatToggleButton onClick={() => setIsChatOpen(true)} />

      {/* Chat dialog */}
      <ChatAssistantDialog
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
