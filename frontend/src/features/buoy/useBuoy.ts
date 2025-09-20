import { useState } from "react";
import type { UserMessage, AssistantMessage, Suggestion } from "./types";
export function useBuoy() {
  const [messages, setMessages] = useState<(UserMessage|AssistantMessage)[]>([
    { id: "a0", role: "assistant", text: "Hei! Jeg er Buoy. Hva ønsker du å gjøre?" }
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  async function send(text: string) {
    const userMsg: UserMessage = { id: crypto.randomUUID(), role:"user", text };
    setMessages(m => [...m, userMsg]);
    const a: AssistantMessage = {
      id: crypto.randomUUID(), role: "assistant", text: "Her er et forslag basert på meldingen din.",
      why: ["Kilde: demo-datasett", "Mønster: stub response"], viz: { type:"spark", values:[1,3,2,5,4] },
      actions: [{ id:"1", label:"Godkjenn forslag" }]
    };
    setTimeout(()=> setMessages(m=>[...m, a]), 400);
  }
  function addSuggestion(suggestion: Suggestion) {
    setSuggestions((current) => {
      if (current.some((item) => item.id === suggestion.id)) {
        return current;
      }
      return [...current, suggestion];
    });
  }
  return { messages, send, suggestions, addSuggestion };
}