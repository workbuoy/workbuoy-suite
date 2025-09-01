export class QualityDashboard {
  constructor(db) {
    this.db = db;
  }

  async getQualityMetrics(timeRange = '7d') {
    const metrics = await this.db.query(`
      SELECT 
        source,
        entity_type,
        AVG(quality_score) as avg_quality,
        COUNT(*) as total_records,
        SUM(CASE WHEN quality_score < 0.7 THEN 1 ELSE 0 END) as low_quality_count,
        json_extract(quality_issues, '$') as common_issues
      FROM data_quality_log 
      WHERE created_at >= datetime('now', '-${timeRange}')
      GROUP BY source, entity_type
    `);

    return {
      overall_health: this.calculateHealthScore(metrics),
      by_source: metrics,
      trending_issues: await this.getTrendingIssues(timeRange),
      auto_fixes_applied: await this.getAutoFixCount(timeRange)
    };
  }

  async generateCleanupSuggestions() {
    return {
      merge_candidates: await this.findMergeCandidates(),
      missing_data_opportunities: await this.findEnrichmentOpportunities(),
      stale_records: await this.findStaleRecords(),
      data_consistency_issues: await this.findConsistencyIssues()
    };
  }
}

// Auto-cleanup workflows
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
    }

    return results;
  }
}
