
// lib/crypto/kms.js
// Pluggable KMS providers: aws-kms, gcp-kms, local-dev
const __crypto_mod = await import('crypto'); const crypto = __crypto_mod.default || __crypto_mod;
const { kmsIncrement } = require('../metrics');

async function awsEncrypt(keyId, plaintext){
  const { KMSClient, EncryptCommand, DecryptCommand } = require('@aws-sdk/client-kms');
  const client = new KMSClient({ endpoint: process.env.KMS_ENDPOINT });
  const out = await client.send(new EncryptCommand({ KeyId: keyId, Plaintext: plaintext }));
  return out.CiphertextBlob;
}
async function awsDecrypt(ciphertext){
  const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');
  const client = new KMSClient({ endpoint: process.env.KMS_ENDPOINT });
  const out = await client.send(new DecryptCommand({ CiphertextBlob: ciphertext }));
  return out.Plaintext;
}

async function gcpEncrypt(keyId, plaintext){
  const { KeyManagementServiceClient } = require('@google-cloud/kms');
  const [location, keyRing, keyName] = keyId.split('/');
  const client = new KeyManagementServiceClient();
  const name = keyId;
  const [result] = await client.encrypt({ name, plaintext });
  return result.ciphertext;
}
async function gcpDecrypt(ciphertext){
  const { KeyManagementServiceClient } = require('@google-cloud/kms');
  const client = new KeyManagementServiceClient();
  const [result] = await client.decrypt({ name: process.env.KMS_KEY_ID, ciphertext });
  return result.plaintext;
}

async function localEncrypt(_keyId, plaintext){
  // Dev only: XChaCha20-Poly1305 with a local master key
  const master = process.env.LOCAL_MASTER_KEY || crypto.createHash('sha256').update('dev').digest();
  const nonce = crypto.randomBytes(24);
  const __cipher_mod = await import('crypto'); const cipher = __cipher_mod.default || __cipher_mod.createCipheriv('chacha20-poly1305', master, nonce, { authTagLength: 16 });
  const ct = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([Buffer.from('LOCAL'), nonce, tag, ct]);
}
async function localDecrypt(blob){
  const buf = Buffer.isBuffer(blob) ? blob : Buffer.from(blob);
  const nonce = buf.subarray(5, 29);
  const tag = buf.subarray(29, 45);
  const ct = buf.subarray(45);
  const master = process.env.LOCAL_MASTER_KEY || crypto.createHash('sha256').update('dev').digest();
  const decipher = crypto.createDecipheriv('chacha20-poly1305', master, nonce, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]);
}

async function wrap(keyId, dek){
  const provider = process.env.KMS_PROVIDER || 'local-dev';
  try{
    let wrapped;
    if(provider === 'aws-kms') wrapped = await awsEncrypt(keyId, dek);
    else if(provider === 'gcp-kms') wrapped = await gcpEncrypt(keyId, dek);
    else wrapped = await localEncrypt(keyId, dek);
    kmsIncrement('wrap', true);
    return wrapped;
  }catch(e){
    kmsIncrement('wrap', false);
    throw e;
  }
}
async function unwrap(_keyId, cek){
  const provider = process.env.KMS_PROVIDER || 'local-dev';
  try{
    let dek;
    if(provider === 'aws-kms') dek = await awsDecrypt(cek);
    else if(provider === 'gcp-kms') dek = await gcpDecrypt(cek);
    else dek = await localDecrypt(cek);
    kmsIncrement('unwrap', true);
    return dek;
  }catch(e){
    kmsIncrement('unwrap', false);
    throw e;
  }
}

module.exports = { wrap, unwrap };
