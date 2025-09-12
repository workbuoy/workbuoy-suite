// This test is intentionally skipped as a placeholder to document expected behavior.
// When the logger exposes a testable hook/output, convert to a live assertion.
describe('logger correlationId', () => {
  it.skip('includes correlationId in structured log entries', () => {
    // Expected:
    // - requestContext middleware sets req.wb.correlationId (uuid v4)
    // - logger.* calls include { correlationId } in the JSON payload
    // Suggested assertion when hook available:
    //   const entry = captureLastLogEntry()
    //   expect(entry).toHaveProperty('correlationId')
    //   expect(entry.correlationId).toMatch(/[0-9a-f-]{36}/)
  });
});
