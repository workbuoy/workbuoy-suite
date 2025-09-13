export type VizKind = "spark" | "bar" | "donut";
export type VisualizationAttachment = { type: VizKind; values: number[]; label?: string };
export type TargetSystem = "hubspot"|"salesforce"|"superoffice"|"dynamics";
export type Entity = "contact"|"company"|"deal"|"activity";
export type Operation = "create"|"update"|"note"|"email"|"task";
export type ActionProposal = {
  id: string; target: TargetSystem; entity: Entity; operation: Operation; entityId?: string;
  payload: Record<string, any>;
  preview?: { before?: any; after?: any; diff?: any };
  provenance?: string[];
  idempotencyKey: string;
};
export type ActionResult = { ok: boolean; externalId?: string; version?: string; link?: string; errors?: string[]; };
export type AssistantMessage = {
  id:string; role:"assistant"; text:string; why?:string[];
  viz?:VisualizationAttachment;
  actions?: { id:string; label:string; proposal?: ActionProposal }[];
};
export type UserMessage = { id:string; role:"user"; text:string };