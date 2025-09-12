export type VizKind = "spark" | "bar" | "donut";
export type VisualizationAttachment = { type: VizKind; values: number[]; label?: string };
export type ActionSuggestion = { id: string; label: string };
export type AssistantMessage = {
  id: string;
  role: "assistant";
  text: string;
  why?: string[];
  viz?: VisualizationAttachment;
  actions?: ActionSuggestion[];
};
export type UserMessage = { id: string; role: "user"; text: string };