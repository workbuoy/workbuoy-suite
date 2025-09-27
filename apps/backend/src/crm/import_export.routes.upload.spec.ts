import express from 'express';
import request from 'supertest';

describe('crm import upload', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('accepts multipart JSON files and processes records', async () => {
    const wbImportTotal = { inc: jest.fn<(value?: number) => void>() };
    const wbImportFailTotal = { inc: jest.fn<(value?: number) => void>() };
    const wbExportTotal = { inc: jest.fn<(value?: number) => void>() };

    type MockModule = (moduleName: string, factory: () => unknown) => Promise<void>;
    const unstableMockModule = (jest as unknown as { unstable_mockModule?: MockModule }).unstable_mockModule;
    if (!unstableMockModule) {
      throw new Error('jest.unstable_mockModule is not available');
    }

    await unstableMockModule('../metrics/metrics.js', () => ({
      __esModule: true,
      wb_import_total: wbImportTotal,
      wb_import_fail_total: wbImportFailTotal,
      wb_export_total: wbExportTotal,
    }));

    const { importExportRouter } = await import('./import_export_routes.js');

    const app = express();
    app.use(express.json());
    app.use('/crm', importExportRouter);

    const response = await request(app)
      .post('/crm/import')
      .field('entity', 'contacts')
      .attach('file', Buffer.from(JSON.stringify([{ name: 'Test Contact' }])), 'data.json');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      entity: 'contacts',
      imported: 1,
      failed: 0,
      dry_run: false,
    });
    expect(Array.isArray(response.body.failures)).toBe(true);
  });
});
