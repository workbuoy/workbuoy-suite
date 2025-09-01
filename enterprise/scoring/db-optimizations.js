export class DatabaseOptimizations {
  static createOptimalIndexes(db) {
    const indexes = [
      // Composite indexes for scoring queries
      'CREATE INDEX IF NOT EXISTS idx_signals_user_type_created ON signals(user_id, type, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_signals_entity_created ON signals(entity_id, created_at)',
      
      // User context indexes
      'CREATE INDEX IF NOT EXISTS idx_user_goals_user_role ON user_goals(user_id, role)',
      'CREATE INDEX IF NOT EXISTS idx_entities_tier_industry ON entities(tier, industry)',
      
      // Performance-critical lookups
      'CREATE INDEX IF NOT EXISTS idx_facts_entity_date ON facts_latest(entity_id, date)',
      'CREATE INDEX IF NOT EXISTS idx_cohort_stats_role_type ON cohort_stats(role, signal_type)',
      
      // Calendar context
      'CREATE INDEX IF NOT EXISTS idx_calendar_user_entity ON calendar_context(user_id, entity_id)',
    ];

    indexes.forEach(sql => {
      try {
        db.exec(sql);
      } catch (error) {
        console.warn('Index creation warning:', error.message);
      }
    });
  }

  static createMaterializedViews(db) {
    // Pre-computed scoring context view
    const scoringContextView = `
      CREATE VIEW IF NOT EXISTS scoring_context_v AS
      SELECT 
        s.id as signal_id,
        s.user_id,
        s.entity_id,
        s.type,
        s.created_at,
        ug.role_weights,
        ug.kpi_preferences,
        e.tier as customer_tier,
        e.industry,
        e.last_interaction_date,
        cs.acted_ratio as cohort_acted_ratio,
        f.ytd_value,
        f.target_value
      FROM signals s
      LEFT JOIN user_goals ug ON ug.user_id = s.user_id
      LEFT JOIN entities e ON e.id = s.entity_id
      LEFT JOIN cohort_stats cs ON cs.role = ug.role AND cs.signal_type = s.type
      LEFT JOIN facts_latest f ON f.entity_id = s.entity_id
    `;
    
    try {
      db.exec(scoringContextView);
    } catch (error) {
      console.warn('View creation warning:', error.message);
    }
  }
}
