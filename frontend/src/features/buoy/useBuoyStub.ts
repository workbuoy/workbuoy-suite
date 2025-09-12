import { useState } from "react";
export type VizAttachment = { type: "spark"|"bar"; values: number[] };
export type AssistantMessage = { id:string; role:"assistant"; text:string; why?:string[]; viz?:VizAttachment };
export type UserMessage = { id:string; role:"user"; text:string };
export function useBuoyStub() {
  const [messages, setMessages] = useState<(UserMessage|AssistantMessage)[]>([
    { id:"a1", role:"assistant", text:"Hei! Hva vil du gjøre i dag?" }
  ]);
  const send = (text:string) => {
    const u: UserMessage = { id: crypto.randomUUID(), role: "user", text };
    setMessages(m => [...m, u]);
    setTimeout(() => {
      const a: AssistantMessage = {
        id: crypto.randomUUID(), role: "assistant",
        text: "Her er et raskt overblikk – og hvorfor jeg foreslår det.",
        why: ["Mønster: Mandagsrapporter kl 09:00", "Kilde: CRM + Faktura"],
        viz: { type: Math.random() > 0.5 ? "spark" : "bar", values: [4,6,8,6,9,12,10] }
      };
      setMessages(m => [...m, a]);
    }, 400);
  };
  return { messages, send };
}