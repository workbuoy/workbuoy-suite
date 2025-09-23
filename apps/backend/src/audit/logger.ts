import fs from 'fs';
import path from 'path';

const AUDIT_EXPORT_S3 = process.env.AUDIT_EXPORT_S3 === 'true';
const AUDIT_FILE = process.env.AUDIT_FILE || path.join(process.cwd(), 'audit.log');

export function audit(event: string, data: any){
  const entry = { ts: new Date().toISOString(), event, data };
  const line = JSON.stringify(entry);
  fs.appendFileSync(AUDIT_FILE, line+"\n");
  if(AUDIT_EXPORT_S3){
    // stub: push to S3 bucket
    console.log('Would export to S3', entry);
  }
}
