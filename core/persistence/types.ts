export interface Repository<T> {
  create(data: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  find(opts?: { limit?: number; offset?: number; q?: string }): Promise<T[]>;
  delete(id: string): Promise<void>;
}
