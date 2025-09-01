const nacl = require('tweetnacl');
const { sha256 } = require('@noble/hashes/sha256');

function b64ToU8(b64) {
  return Buffer.from(b64, 'base64');
}
function u8ToB64(u8) {
  return Buffer.from(u8).toString('base64');
}
function sha256sum(buf) {
  const h = sha256(new Uint8Array(buf));
  return 'sha256-' + u8ToB64(Buffer.from(h));
}

/**
 * Verify a manifest against a given buffer (adapter source or canonical string).
 * manifest = { key, version, integrity, signature, publicKey }
 */
function verifyManifest(manifest, dataBuffer) {
  try {
    if (!manifest || !manifest.publicKey || !manifest.signature || !manifest.integrity) {
      return { ok:false, reason:'unsigned' };
    }
    const integrity = sha256sum(dataBuffer);
    if (integrity !== manifest.integrity) {
      return { ok:false, reason:'integrity_mismatch' };
    }
    const msg = Buffer.from(`${manifest.key}:${manifest.version}:${manifest.integrity}`);
    const ok = nacl.sign.detached.verify(new Uint8Array(msg), new Uint8Array(b64ToU8(manifest.signature)), new Uint8Array(b64ToU8(manifest.publicKey)));
    return ok ? { ok:true } : { ok:false, reason:'bad_signature' };
  } catch (e) {
    return { ok:false, reason:'error', error: e.message };
  }
}

module.exports = { verifyManifest, sha256sum };
