import React, { createContext, useContext, useMemo, useState } from "react";
import { POLICY, type AutonomyMode, AUTONOMY_LABELS, type UiPolicy } from "./policy";

type Ctx = {
  mode: AutonomyMode;
  setMode: (m: AutonomyMode)=>void;
  ui: UiPolicy;
  label: string;
};

const AutonomyCtx = createContext<Ctx | null>(null);

export function AutonomyProvider({ children }:{ children: React.ReactNode }){
  const [mode, setMode] = useState<AutonomyMode>("proaktiv");
  const ui = POLICY[mode];
  const label = AUTONOMY_LABELS[mode];
  const value = useMemo(()=>({ mode, setMode, ui, label }), [mode, ui, label]);
  return <AutonomyCtx.Provider value={value}>{children}</AutonomyCtx.Provider>;
}

export function useAutonomy(){
  const v = useContext(AutonomyCtx);
  if (!v) throw new Error("useAutonomy must be used inside AutonomyProvider");
  return v;
}