import { prisma } from "../../core/db/prisma";

export async function listContacts() {
  return prisma.contact.findMany({ orderBy: { createdAt: "desc" } });
}

export async function createContact(data: { name: string; email?: string; phone?: string }) {
  return prisma.contact.create({ data });
}

export async function deleteContact(id: string) {
  await prisma.contact.delete({ where: { id } });
}
