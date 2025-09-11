export type Task = { id: string; title: string; status: "todo"|"doing"|"done"; dueAt?: string; assignee?: string; createdAt: string };
export function validateNewTask(b:any): asserts b is { title: string; status?: Task["status"]; dueAt?: string; assignee?: string } {
  if (!b || typeof b !== "object" || typeof b.title !== "string") throw new Error("invalid_task");
}
export function validatePatch(b:any): asserts b is Partial<{ title: string; status: Task["status"]; dueAt: string; assignee: string }> {
  if (!b || typeof b !== "object") throw new Error("invalid_patch");
}
