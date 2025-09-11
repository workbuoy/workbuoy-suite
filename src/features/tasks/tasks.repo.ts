import { prisma } from "../../core/db/prisma";

export async function listTasks(status?: string) {
  return prisma.task.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" }
  });
}

export async function createTask(data: { title: string; status?: string; dueAt?: string; assignee?: string }) {
  return prisma.task.create({ data: {
    title: data.title,
    status: data.status ?? "todo",
    dueAt: data.dueAt ? new Date(data.dueAt) : undefined,
    assignee: data.assignee
  }});
}

export async function patchTask(id: string, patch: Partial<{ title: string; status: string; dueAt: string; assignee: string }>) {
  return prisma.task.update({ where: { id }, data: {
    title: patch.title,
    status: patch.status,
    dueAt: patch.dueAt ? new Date(patch.dueAt) : undefined,
    assignee: patch.assignee
  }});
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
}
