describe('proposals router import', () => {
  it('does not throw importing proposals router', async () => {
    await expect(import('../routes/proposals.js')).resolves.toBeTruthy();
  });
});
