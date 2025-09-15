// src/core/audit/audit.repo.ts
import { FileRepo } from '../persist/fileRepo';
export type AuditEntry = { id:string; prevHash:string|null; hash:string; ts:number; action:string; data:any };
export const auditRepo = new FileRepo<AuditEntry>('audit.json');
