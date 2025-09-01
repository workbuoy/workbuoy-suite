import { SecureDb } from '../storage/secureDb.js';
import { SyncEngine } from './syncEngine.js';
import { mkdirSync } from 'fs';

async function main() {
  mkdirSync('.wb', { recursive: true });
  const db = new SecureDb('.wb', process.env.WB_PASSPHRASE || 'dev-secret');
  const engine = new SyncEngine(db, {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    apiKey: process.env.API_KEY || 'dev-123',
    tenantId: process.env.TENANT_ID || 'demo-tenant',
  });

  await engine.enqueueCreate('contact', { name: 'Offline Alice' });
  try {
    await engine.syncOnce();
    console.log('Sync ok', engine.getStatus());
  } catch (e) {
    console.error('Sync error', e);
  }
}

main();
