export type VizKind = "spark" | "bar" | "donut";
export type VisualizationAttachment = { type: VizKind; values: number[]; label?: string };
export type ActionSuggestion = { id: string; label: string; proposal?: Record<string, any> };
export type UserMessage = { id: string; role: "user"; text: string };
export type AssistantMessage = {
  id: string; role: "assistant"; text: string;
  why?: string[]; viz?: VisualizationAttachment; actions?: ActionSuggestion[];
};