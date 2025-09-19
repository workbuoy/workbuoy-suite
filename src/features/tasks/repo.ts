import { randomUUID } from 'crypto';
import { selectRepo } from '../../core/persist/select';

export interface Task {
  id: string;
  title: string;
  status: 'todo'|'doing'|'done';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TasksRepository {
  list(): Promise<Task[]>;
  create(input: Omit<Task,'id'|'createdAt'> & { id?: string }): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<Task | undefined>;
  remove(id: string): Promise<void>;
}

const repo = selectRepo<Task>('tasks');

function ensureId(id?: string) {
  return id && id.trim().length ? id : randomUUID();
}

export const TasksRepo: TasksRepository = {
  async list() {
    return repo.all();
  },
  async create(input) {
    const id = ensureId(input.id);
    const row: Task = {
      id,
      title: input.title,
      status: input.status,
      assignee: input.assignee,
      dueDate: input.dueDate,
      createdAt: new Date().toISOString()
    };
    await repo.upsert(row);
    return row;
  },
  async update(id, patch) {
    const current = await repo.get(id);
    if (!current) return undefined;
    const next: Task = {
      ...current,
      ...patch,
      id,
      createdAt: patch.createdAt ?? current.createdAt
    };
    await repo.upsert(next);
    return next;
  },
  async remove(id) {
    await repo.remove(id);
  }
};
