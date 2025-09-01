// tests/e2e/notes-preview.spec.ts
import { test, expect, request } from '@playwright/test';

test.describe('HubSpot notes:preview dry-run', () => {
  test('returns a preview that requires approval', async ({ playwright }) => {
    const baseURL = process.env.PW_BASE_URL || 'http://localhost:3000';
    const api = await request.newContext({ baseURL });

    const res = await api.post('/api/cxm/crm/notes:preview', {
      data: {
        objectType: 'contact',
        objectId: '12345',
        body: 'Followed up with customer about onboarding.'
      }
    });

    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.preview?.action).toBe('create_note');
    expect(json.requiresApproval).toBe(true);
    expect(json.approval?.required).toBe(true);
  });
});
