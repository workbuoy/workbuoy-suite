export type TaskStatus = 'todo'|'doing'|'done';
export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}
