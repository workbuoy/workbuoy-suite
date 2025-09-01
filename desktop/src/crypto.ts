import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';
export type KeyBundle = { key: Buffer, salt: Buffer };
export function deriveKey(passphrase: string, salt?: Buffer): KeyBundle {
  const s = salt || randomBytes(16);
  const key = pbkdf2Sync(passphrase, s, 200_000, 32, 'sha256');
  return { key, salt: s };
}
export function encrypt(key: Buffer, plaintext: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]);
}
export function decrypt(key: Buffer, payload: Buffer) {
  const iv = payload.subarray(0,12);
  const tag = payload.subarray(12,28);
  const data = payload.subarray(28);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}
