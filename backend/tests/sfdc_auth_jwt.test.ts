import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { getAccessToken } from '../src/connectors/salesforce/auth';

function genKeyPair() {
  const { generateKeyPairSync } = require('crypto');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return {
    privatePem: privateKey.export({ type:'pkcs1', format:'pem' }).toString(),
    publicPem: publicKey.export({ type:'pkcs1', format:'pem' }).toString()
  };
}

test('JWT auth retrieves token from mock', async () => {
  const { privatePem } = genKeyPair();
  const app = express();
  app.post('/services/oauth2/token', (req,res)=>res.json({ access_token: 'abc123' }));
  const s = app.listen(45810);

  const token = await getAccessToken({
    method: 'jwt',
    clientId: 'cid',
    user: 'user@example.com',
    loginUrl: 'http://localhost:45810',
    privateKeyBase64: Buffer.from(privatePem).toString('base64')
  });
  expect(token).toBe('abc123');
  await new Promise<void>((resolve,reject)=>s.close(e=>e?reject(e):resolve()));
});
