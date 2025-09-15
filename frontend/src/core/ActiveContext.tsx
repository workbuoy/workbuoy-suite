import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
export type ActiveContext = {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  selectedEntity?: { type: "contact" | "deal" | "invoice" | "task"; id: string; name?: string } | null;
  recentIntents: string[];
  setSelectedEntity: (e: ActiveContext["selectedEntity"]) => void;
  pushIntent: (intent: string) => void;
};
const Ctx = createContext<ActiveContext | null>(null);
function toTimeOfDay(d = new Date()): ActiveContext["timeOfDay"] {
  const h = d.getHours();
  if (h < 5) return "night"; if (h < 12) return "morning"; if (h < 17) return "afternoon"; if (h < 22) return "evening"; return "night";
}
export function ActiveContextProvider({ children }:{ children: React.ReactNode }) {
  const [selectedEntity, setSelectedEntity] = useState<ActiveContext["selectedEntity"]>(null);
  const [recentIntents, setRecentIntents] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<ActiveContext["timeOfDay"]>(toTimeOfDay());
  useEffect(()=>{ const id = setInterval(()=> setTimeOfDay(toTimeOfDay()), 60_000); return ()=> clearInterval(id); }, []);
  function pushIntent(intent: string){ setRecentIntents(prev => [...prev, intent].slice(-10)); }
  const value = useMemo<ActiveContext>(() => ({ timeOfDay, selectedEntity, recentIntents, setSelectedEntity, pushIntent }), [timeOfDay, selectedEntity, recentIntents]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useActiveContext(){
  const v = useContext(Ctx);
  if (!v) throw new Error("useActiveContext must be used within ActiveContextProvider");
  return v;
}