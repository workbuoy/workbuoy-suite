import React, { createContext, useContext, useMemo, useState } from "react";

export type UndoAction =
  | { kind: "create.contact"; id: string; name?: string; email?: string }
  | { kind: "delete.contact"; id: string; name?: string; email?: string }
  | { kind: "update.contact"; id: string; before: any; after: any }
  | { kind: "send.email"; id: string; to: string; subject?: string }
  | { kind: "other"; id: string; label: string; meta?: any };

export type UndoSuggestion = {
  id: string;
  label: string;
  explanation: string[];
  perform: () => Promise<boolean> | boolean; // returns success
};

type CtxType = {
  suggestions: UndoSuggestion[];
  addAction: (action: UndoAction) => void;
  consume: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CtxType | null>(null);

export function SmartUndoProvider({ children }:{ children: React.ReactNode }){
  const [suggestions, setSuggestions] = useState<UndoSuggestion[]>([]);

  function mkLabel(a: UndoAction): string {
    switch(a.kind){
      case "delete.contact": return `Angre sletting${a.name?` av ${a.name}`:""}`;
      case "create.contact": return `Angre opprettelse${a.name?` av ${a.name}`:""}`;
      default: return "Angre siste handling";
    }
  }

  function addAction(action: UndoAction){
    // Heuristikker for "sannsynlig" undo
    const id = `undo-${action.kind}-${action.id}`;
    const label = mkLabel(action);
    const explanation = [
      "Mønster: uvanlig rask etterfølgende klikking (antatt feil) — stub",
      "Kontekst: handling kan reverseres uten datatap — stub"
    ];

    const perform = () => {
      // UI-stub: markér som utført og returner true
      return true;
    };

    setSuggestions(prev => {
      if (prev.find(s => s.id === id)) return prev;
      return [{ id, label, explanation, perform }, ...prev].slice(0, 5);
    });
  }

  function consume(id: string){
    setSuggestions(prev => prev.filter(s => s.id !== id));
  }

  function clear(){ setSuggestions([]); }

  const value = useMemo(()=>({ suggestions, addAction, consume, clear }), [suggestions]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSmartUndo(){
  const v = useContext(Ctx);
  if (!v) throw new Error("useSmartUndo must be used within SmartUndoProvider");
  return v;
}