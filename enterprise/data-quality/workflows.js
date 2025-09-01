export class DataCleanupWorkflows {
  async runNightlyCleanup() {
    const tasks = [
      this.deduplicateRecords,
      this.updateStaleCloseDate,
      this.enrichMissingIndustries,
      this.standardizePhoneNumbers,
      this.validateEmailAddresses
    ];

    const results = [];
    for (const task of tasks) {
      try {
        const result = await task.call(this);
        results.push(result);
      } catch (error) {
        // Log error but continue with other tasks
        console.error(`Cleanup task failed:`, error);
        results.push({ error: error.message });
      }
