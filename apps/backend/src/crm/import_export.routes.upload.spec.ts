import express from 'express';
import request from 'supertest';
import { upload } from '../lib/upload.js';

describe('CRM import upload', () => {
  const makeApp = () => {
    const app = express();
    app.post('/crm/import', upload.single('file'), (req, res) => {
      const requestWithFile = req as typeof req & { file?: { buffer: Buffer } };
      const file = requestWithFile.file;

      if (!file) {
        return res.status(400).json({ ok: false, reason: 'missing file' });
      }

      const json = JSON.parse(file.buffer.toString('utf8'));
      return res.status(200).json({ ok: true, json });
    });
    return app;
  };

  it('accepts multipart JSON and parses it', async () => {
    const app = makeApp();

    await request(app)
      .post('/crm/import')
      .attach('file', Buffer.from('{"hello":"world"}'), 'data.json')
      .expect(200)
      .expect(({ body }) => {
        expect(body.ok).toBe(true);
        expect(body.json.hello).toBe('world');
      });
  });
});
