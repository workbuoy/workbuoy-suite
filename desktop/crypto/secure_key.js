import os from 'os';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

/**
 * Load or create a 32-byte master key for desktop cache encryption.
 * Priority:
 *  1) WB_SECRETS_KEY env (string -> scrypt-derived 32 bytes)
 *  2) Platform store:
 *     - macOS Keychain (security add/find-generic-password)
 *     - Windows DPAPI (ProtectedData) via powershell helper (file caches protected blob)
 *     - Linux file-based (~/.config/workbuoy/desktop.key, chmod 600)
 */
export function loadMasterKey() {
  const env = process.env.WB_SECRETS_KEY;
  if (env && env.length > 0) {
    const salt = 'workbuoy-desktop-env';
    return crypto.scryptSync(env, salt, 32);
  }
  const platform = process.platform;
  try {
    if (platform === 'darwin') return macosKeychainKey();
    if (platform === 'win32') return windowsDPAPIKey();
  } catch (_) {
    // fallthrough to file key
  }
  return fileKey();
}

function macosKeychainKey() {
  const service = 'WorkBuoyDesktopKey';
  const account = process.env.USER || 'workbuoy';
  try {
    const out = execFileSync('security', ['find-generic-password', '-s', service, '-a', account, '-w'], { stdio: ['ignore','pipe','ignore'] }).toString('utf8').trim();
    if (out) return Buffer.from(out, 'base64');
  } catch (e) {
    // not found -> create
  }
  const key = crypto.randomBytes(32).toString('base64');
  try {
    execFileSync('security', ['add-generic-password', '-U', '-s', service, '-a', account, '-w', key], { stdio: 'ignore' });
  } catch {}
  return Buffer.from(key, 'base64');
}

function windowsDPAPIKey() {
  const cfgDir = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData','Roaming'), 'WorkBuoy');
  const blobPath = path.join(cfgDir, 'desktop.key.protected');
  fs.mkdirSync(cfgDir, { recursive: true });
  if (fs.existsSync(blobPath)) {
    const b64 = fs.readFileSync(blobPath, 'utf8').trim();
    const script = "[System.Text.Encoding]::UTF8.GetString([System.Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String('" + b64 + "'),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser))";
    const keyB64 = execFileSync('powershell', ['-Command', script], { stdio: ['ignore','pipe','ignore'] }).toString('utf8').trim();
    return Buffer.from(keyB64, 'base64');
  }
  const keyB64 = crypto.randomBytes(32).toString('base64');
  const protScript = "[Convert]::ToBase64String([System.Security.Cryptography.ProtectedData]::Protect([System.Text.Encoding]::UTF8.GetBytes('" + keyB64 + "'),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser))";
  const prot = execFileSync('powershell', ['-Command', protScript], { stdio: ['ignore','pipe','ignore'] }).toString('utf8').trim();
  fs.writeFileSync(blobPath, prot);
  return Buffer.from(keyB64, 'base64');
}

// Linux or fallback key file
function fileKey() {
  const cfgDir = path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'), 'workbuoy');
  const keyPath = path.join(cfgDir, 'desktop.key');
  fs.mkdirSync(cfgDir, { recursive: true });
  if (fs.existsSync(keyPath)) {
    const b64 = fs.readFileSync(keyPath, 'utf8').trim();
    return Buffer.from(b64, 'base64');
  }
  const key = crypto.randomBytes(32);
  fs.writeFileSync(keyPath, key.toString('base64'));
  try { fs.chmodSync(keyPath, 0o600); } catch {}
  return key;
}
