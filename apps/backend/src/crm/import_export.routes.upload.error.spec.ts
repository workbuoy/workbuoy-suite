import express from 'express';
import request from 'supertest';
import { upload } from '../lib/upload.js';

describe('CRM import upload error handling', () => {
  const createApp = () => {
    const app = express();
    app.post('/crm/import', upload.single('file'), (req, res) => {
      const requestWithFile = req as typeof req & {
        file?: { buffer: Buffer; fieldname: string };
      };
      const file = requestWithFile.file;

      if (!file) {
        return res.status(400).json({ ok: false, reason: 'missing file' });
      }

      if (!file.buffer || file.buffer.length === 0) {
        return res.status(400).json({ ok: false, reason: 'empty file' });
      }

      return res.status(200).json({ ok: true });
    });
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const maybeMulterError = err as { code?: string } | null;
      if (maybeMulterError && maybeMulterError.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ ok: false, reason: 'missing file' });
      }

      return res.status(400).json({ ok: false, reason: 'upload failed' });
    });
    return app;
  };

  it('rejects requests without a file field', async () => {
    const app = createApp();

    await request(app)
      .post('/crm/import')
      .field('entity', 'contacts')
      .expect(400)
      .expect(({ body }) => {
        expect(body.reason).toBe('missing file');
      });
  });

  it('rejects uploads with the wrong field name', async () => {
    const app = createApp();

    await request(app)
      .post('/crm/import')
      .attach('document', Buffer.from('name\n'), 'data.csv')
      .expect(400)
      .expect(({ body }) => {
        expect(body.reason).toBe('missing file');
      });
  });

  it('rejects empty CSV uploads with a validation message', async () => {
    const app = createApp();

    await request(app)
      .post('/crm/import')
      .attach('file', Buffer.alloc(0), 'empty.csv')
      .expect(400)
      .expect(({ body }) => {
        expect(body.reason).toBe('empty file');
      });
  });
});
