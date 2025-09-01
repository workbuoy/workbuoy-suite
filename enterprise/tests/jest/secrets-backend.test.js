/* @jest-environment node */
test('Local secrets backend stores and retrieves secret', async () => {
  process.env.WB_SECRETS_BACKEND='local';
  const mod = await import('../../lib/secrets/index.js');
  const ref = await mod.putSecret('t1','email.api_key','xyz');
  expect(ref).toMatch(/local:\/\//);
  const v = await mod.getSecret('t1','email.api_key');
  expect(v).toBe('xyz');
});
