export type AutonomyMode = "passiv" | "proaktiv" | "ambisiøs" | "kraken";

export const AUTONOMY_LABELS: Record<AutonomyMode, string> = {
  passiv: "Passiv",
  proaktiv: "Proaktiv",
  ambisiøs: "Ambisiøs",
  kraken: "Kraken",
};

export type UiPolicy = {
  canShowSuggestions: boolean;
  canShowActions: boolean;
  canAutoDraft: boolean;
  canAutoExecute: boolean; // UI hint only; backend still guards
};

export const POLICY: Record<AutonomyMode, UiPolicy> = {
  passiv:   { canShowSuggestions: true,  canShowActions: false, canAutoDraft: false, canAutoExecute: false },
  proaktiv: { canShowSuggestions: true,  canShowActions: true,  canAutoDraft: false, canAutoExecute: false },
  ambisiøs: { canShowSuggestions: true,  canShowActions: true,  canAutoDraft: true,  canAutoExecute: false },
  kraken:   { canShowSuggestions: true,  canShowActions: true,  canAutoDraft: true,  canAutoExecute: true  },
};