import { useEffect, useState } from "react";
import type { AssistantMessage, Suggestion, UserMessage } from "./types";
import { setBuoyTyping } from "./useBuoyStatus";
import { apiFetch } from "@/api";

type BuoyExplanation = {
  reasoning?: string;
  basis?: string;
  impact?: { summary?: string };
  alternatives?: string[];
};

type BuoyCompletionResponse = {
  result?: unknown;
  explanations?: BuoyExplanation[];
  confidence?: number;
};

function formatOutcome(result: unknown): string {
  if (result == null) return "Jeg fant ingen konkrete handlinger i svaret.";
  if (typeof result === "string") return result;
  if (Array.isArray(result)) {
    return result.length
      ? `Jeg fant ${result.length} forslag du kan jobbe videre med.`
      : "Jeg fant ingen konkrete treff denne gangen.";
  }

  if (typeof result === "object") {
    const typed = result as { ok?: boolean; message?: string };
    if (typed.message) return typed.message;
    if (typed.ok === true) return "Forslaget er klart for gjennomgang.";
    if (typed.ok === false) return "Forslaget ble stoppet av policy eller validering.";
  }

  return "Forslaget er behandlet.";
}

function suggestionFromAlternative(alt: string) {
  const normalized = alt.replace(/[_-]+/g, " ").trim();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    id: `alt-${alt}`,
    label: `Kjør: ${label}`,
    proposal: { intent: normalized },
  };
}

export function useBuoy() {
  const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>([
    { id: "a0", role: "assistant", text: "Hei! Jeg er Buoy. Hva ønsker du å gjøre?" },
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  async function send(text: string) {
    const userMsg: UserMessage = { id: crypto.randomUUID(), role: "user", text };
    setMessages((previous) => [...previous, userMsg]);
    setIsTyping(true);
    setBuoyTyping(true);

    try {
      const body = await apiFetch<BuoyCompletionResponse>("/buoy/complete", {
        method: "POST",
        body: JSON.stringify({ text }),
      });

      const explanations = body.explanations ?? [];
      const assistantMessage: AssistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: formatOutcome(body.result),
        why: explanations.flatMap((item) => [item.reasoning, item.basis, item.impact?.summary].filter(Boolean) as string[]),
        viz: Array.isArray(body.result)
          ? { type: "spark", values: [body.result.length, Math.max(1, Math.round((body.confidence ?? 0.5) * 10)), 5] }
          : undefined,
        actions: explanations[0]?.alternatives?.map(suggestionFromAlternative),
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch {
      setMessages((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "Jeg fikk ikke kontakt med backend. Prøv igjen om litt.",
          why: ["Feil under kall til /buoy/complete"],
        },
      ]);
    } finally {
      setIsTyping(false);
      setBuoyTyping(false);
    }
  }

  function addSuggestion(suggestion: Suggestion) {
    setSuggestions((current) => {
      if (current.some((item) => item.id === suggestion.id)) {
        return current;
      }
      return [...current, suggestion];
    });
  }

  useEffect(() => () => {
    setBuoyTyping(false);
  }, []);

  return { messages, send, suggestions, addSuggestion, isTyping };
}
