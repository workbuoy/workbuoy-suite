
export interface Task { id:string; title:string; status:'todo'|'doing'|'done'; assignee?:string; dueDate?:string; createdAt:string }
export interface TasksRepository {
  list(): Promise<Task[]>;
  create(input: Omit<Task,'id'|'createdAt'>): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<Task|undefined>;
  remove(id: string): Promise<void>;
}
const data: Task[] = [];
export const InMemoryTasksRepo: TasksRepository = {
  async list(){ return data.slice(); },
  async create(i){ const row = { id: (globalThis.crypto?.randomUUID?.() || String(Date.now())), createdAt: new Date().toISOString(), ...i }; data.push(row); return row; },
  async update(id, patch){ const t = data.find(x=>x.id===id); if (t) Object.assign(t, patch); return t; },
  async remove(id){ const ix = data.findIndex(x=>x.id===id); if (ix>=0) data.splice(ix,1); }
};
