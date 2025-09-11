import type { Task } from "./tasks.types";
const items: Task[] = [];

export function list(status?: Task["status"]): Task[] {
  return status ? items.filter(i => i.status === status) : items;
}
export function create(data: { title: string; status?: Task["status"]; dueAt?: string; assignee?: string }): Task {
  const t: Task = { id: Math.random().toString(36).slice(2), title: data.title, status: data.status ?? "todo", dueAt: data.dueAt, assignee: data.assignee, createdAt: new Date().toISOString() };
  items.unshift(t);
  return t;
}
export function patch(id: string, p: Partial<{ title: string; status: Task["status"]; dueAt: string; assignee: string }>): Task | null {
  const i = items.findIndex(x => x.id === id);
  if (i < 0) return null;
  items[i] = { ...items[i], ...p };
  return items[i];
}
export function remove(id: string): boolean {
  const i = items.findIndex(x => x.id === id);
  if (i < 0) return false;
  items.splice(i,1); return true;
}
