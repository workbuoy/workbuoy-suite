import { Task, TaskStatus } from './tasks.types';
const store: Map<string, Task> = new Map();
function id(){ return Math.random().toString(36).slice(2,10); }

export function list(): Task[]{ return Array.from(store.values()); }
export function create(input: Omit<Task,'id'|'createdAt'>): Task{
  const item: Task = { ...input, id:id(), createdAt: new Date().toISOString() };
  store.set(item.id, item);
  return item;
}
export function update(id: string, patch: Partial<Omit<Task,'id'|'createdAt'>>): Task | null{
  const cur = store.get(id); if (!cur) return null;
  const next = { ...cur, ...patch };
  store.set(id, next as Task);
  return next as Task;
}
export function remove(id: string){ return store.delete(id); }
export function clear(){ store.clear(); }
