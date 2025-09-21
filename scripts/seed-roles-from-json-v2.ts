import { PrismaClient } from '@prisma/client';
import roles from '../roles/roles.json';

const prisma = new PrismaClient();

async function main() {
  for (const role of roles) {
    await prisma.role.upsert({
      where: { role_id: role.role_id },
      update: { ...role },
      create: { ...role },
    });
  }
  console.log("Seeded roles.json");
}

main().finally(async () => await prisma.$disconnect());
