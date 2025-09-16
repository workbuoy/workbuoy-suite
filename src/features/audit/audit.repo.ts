// src/features/audit/audit.repo.ts
import { FileRepo } from '../../core/persist/fileRepo';
export type AuditEntry = { id:string; prevHash:string|null; hash:string; ts:number; action:string; targetId?:string; data?:any };
export const auditRepo = new FileRepo<AuditEntry>('audit.json');
