import { selectRepo } from '../../core/persist/select';

export type UserRoleRow = { user_id: string; primary_role?: string; secondary_roles?: string[] };

export class UserRoleRepoV2 {
  static async open(){
    try {
      if (process.env.FF_PERSISTENCE === 'true') {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        return {
          async set(user_id: string, primary_role: string, secondary_roles: string[] = []){
            return prisma.userRole.upsert({ where:{ user_id }, update:{ primary_role, secondary_roles }, create:{ user_id, primary_role, secondary_roles } });
          },
          async get(user_id: string){
            return prisma.userRole.findUnique({ where:{ user_id } });
          }
        };
      }
    } catch {}
    const repo = selectRepo<UserRoleRow>('user_roles');
    return {
      async set(user_id: string, primary_role: string, secondary_roles: string[] = []){
        const row: UserRoleRow = { user_id, primary_role, secondary_roles };
        await repo.upsert(row as any); return row;
      },
      async get(user_id: string){
        return repo.get(user_id) as any;
      }
    };
  }
}
