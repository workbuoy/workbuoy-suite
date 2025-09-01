#!/usr/bin/env node
import { mkdirSync } from 'fs';
import path from 'path';
import { SecureDb } from '../src/storage/secureDb.js';

function usage() {
  console.log(`wb-keytool
Usage:
  wb-keytool rotate --dir <dir> --old <oldpass> --new <newpass>
  wb-keytool check --dir <dir> --pass <pass>
`);
}

async function main() {
  const args = new Map<string,string>();
  for (let i=2;i<process.argv.length;i+=2) {
    const k = process.argv[i]; const v = process.argv[i+1];
    if (!k || !v) break; args.set(k.replace(/^--/,''), v);
  }
  const cmd = process.argv[2];
  if (!cmd || cmd==='--help' || cmd==='-h') return usage();

  const dir = args.get('dir') || '.wb_secure';
  mkdirSync(dir, { recursive: true });

  if (cmd === 'check') {
    const pass = args.get('pass') || '';
    const db = new SecureDb(dir, pass);
    console.log('OK: opened DB and key derived. Cached items:', db.listCache('contact', 5).length);
    return;
  }
  if (cmd === 'rotate') {
    const oldp = args.get('old') || '';
    const newp = args.get('new') || '';
    const db = new SecureDb(dir, oldp);
    db.rotatePassphrase(newp);
    console.log('OK: rotated passphrase');
    return;
  }
  usage();
}

main().catch(e=>{ console.error(e); process.exit(1); });
