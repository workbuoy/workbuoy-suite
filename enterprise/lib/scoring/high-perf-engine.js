export class HighPerformanceScoringEngine {
  constructor(database, cache, config) {
    this.db = database;
    this.cache = cache;
    this.config = config;
    
    // Connection pooling for database
    this.connectionPool = this.createConnectionPool();
    
    // Pre-compiled queries for performance
    this.queries = this.compileQueries();
    
    // Batch processing configuration
    this.batchSize = config.batch_size || 500;
    this.maxConcurrency = config.max_concurrency || 10;
    
    // Performance monitoring
    this.metrics = {
      scores_computed: 0,
      batch_times: [],
      cache_hits: 0,
      cache_misses: 0
    };
  }

  // Main entry point - batch score multiple signals efficiently
  async scoreSignalsBatch(signals, userId, options = {}) {
    const startTime = Date.now();
    
    try {
      // Pre-flight optimizations
      const optimizedSignals = await this.optimizeSignalBatch(signals, userId);
      
      // Batch processing with concurrency control
      const scoredSignals = await this.processBatches(optimizedSignals, userId, options);
      
      // Post-processing and caching
      await this.cacheScoredResults(scoredSignals, userId);
      
      const duration = Date.now() - startTime;
      this.recordBatchMetrics(scoredSignals.length, duration);
      
      return {
        signals: scoredSignals,
        performance: {
          total_signals: scoredSignals.length,
          duration_ms: duration,
          signals_per_second: Math.round(scoredSignals.length / (duration / 1000))
        }
      };
    } catch (error) {
      console.error('Batch scoring failed:', error);
      // Fallback to individual scoring if batch fails
      return await this.fallbackToIndividualScoring(signals, userId);
    }
  }

  async optimizeSignalBatch(signals, userId) {
    // 1. Remove signals we can resolve from cache
    const cacheResults = await this.checkBatchCache(signals, userId);
    const uncachedSignals = signals.filter(s => !cacheResults.has(s.id));
    
    // 2. Pre-fetch all required data in minimal queries
    const prefetchData = await this.prefetchScoringData(uncachedSignals, userId);
    
    // 3. Group signals by type for optimized processing
    const groupedSignals = this.groupSignalsByType(uncachedSignals);
    
    return {
      cached: cacheResults,
      uncached: groupedSignals,
      prefetch: prefetchData
    };
  }

  // Single optimized query that fetches all scoring dependencies
  async prefetchScoringData(signals, userId) {
    const entityIds = [...new Set(signals.map(s => s.entity_id))];
    const signalTypes = [...new Set(signals.map(s => s.type))];
    
    // Materialized view approach - pre-computed joins
    const query = `
      WITH scoring_context AS (
        SELECT 
          s.id as signal_id,
          s.entity_id,
          s.type,
          s.created_at,
          s.metadata,
          
          -- User preferences and goals
          ug.kpi_preferences,
          ug.role_weights,
          ug.stakeholder_tags,
          
          -- Entity context (customer/deal/contact)
          e.name as entity_name,
          e.tier as customer_tier,
          e.industry,
          e.last_interaction_date,
          
          -- Historical patterns
          hp.user_action_patterns,
          hp.time_preferences,
          
          -- Cohort stats
          cs.role_cohort_stats,
          
          -- Calendar context
          cc.upcoming_meetings,
          cc.workflow_stage,
          
          -- Facts/metrics
          f.ytd_value,
          f.ly_ytd_value,
          f.target_value,
          f.mtd_value
          
        FROM signals s
        LEFT JOIN user_goals ug ON ug.user_id = ?
        LEFT JOIN entities e ON e.id = s.entity_id  
        LEFT JOIN user_historical_patterns hp ON hp.user_id = ? AND hp.signal_type = s.type
        LEFT JOIN cohort_stats cs ON cs.role = ug.role AND cs.signal_type = s.type
        LEFT JOIN calendar_context cc ON cc.user_id = ? AND cc.entity_id = s.entity_id
        LEFT JOIN facts_latest f ON f.entity_id = s.entity_id
        WHERE s.id IN (${signals.map(() => '?').join(',')})
      )
      SELECT * FROM scoring_context
    `;
    
    const params = [userId, userId, userId, ...signals.map(s => s.id)];
    const results = await this.db.prepare(query).all(...params);
    
    // Transform into lookup structure for fast access
    const lookup = new Map();
    results.forEach(row => {
      lookup.set(row.signal_id, row);
    });
    
    return lookup;
  }

  async processBatches(optimizedSignals, userId, options) {
    const { cached, uncached, prefetch } = optimizedSignals;
    const results = [];
    
    // Add cached results immediately
    cached.forEach(result => results.push(result));
    
    // Process uncached signals in concurrent batches
    const batches = this.createBatches(uncached, this.batchSize);
    const concurrencyControl = new ConcurrencyController(this.maxConcurrency);
    
    await Promise.all(batches.map(batch => 
      concurrencyControl.run(() => this.processSingleBatch(batch, prefetch, userId))
        .then(batchResults => results.push(...batchResults))
    ));
    
    return results;
  }

  async processSingleBatch(signalsBatch, prefetchData, userId) {
    const scoredSignals = [];
    
    // Vectorized scoring - process similar signals together
    for (const [signalType, signals] of Object.entries(signalsBatch)) {
      const typeScorer = this.getTypeScorer(signalType);
      const typeResults = await typeScorer.scoreSignals(signals, prefetchData, userId);
      scoredSignals.push(...typeResults);
    }
    
    return scoredSignals;
  }

  getTypeScorer(signalType) {
    return {
      async scoreSignals(signals, prefetchData, userId) {
        const results = [];
        
        for (const signal of signals) {
          const context = prefetchData.get(signal.id);
          if (!context) continue;
          
          // Optimized scoring calculation
          const score = await this.calculateOptimizedScore(signal, context);
          
          results.push({
            ...signal,
            score,
            context: this.extractScoringExplanation(context, score)
          });
        }
        
        return results;
      }
    };
  }

  async calculateOptimizedScore(signal, context) {
    // Pre-computed weights and factors for speed
    const weights = this.getPrecomputedWeights(context.role_weights);
    
    // Vectorized calculations
    const baseScore = 
      weights.role * this.getRoleAlignment(signal.type, context) +
      weights.kpi * this.getKpiAlignment(signal, context) +
      weights.stakeholder * this.getStakeholderWeight(signal, context) +
      weights.timing * this.getTimingUrgency(signal, context);
    
    // Apply modifiers
    const contextBoost = this.calculateContextBoost(signal, context);
    const agingFactor = this.calculateAgingFactor(signal.created_at);
    const cohortBoost = this.calculateCohortBoost(signal, context);
    
    return Math.max(0, Math.min(1, 
      baseScore * agingFactor + contextBoost + cohortBoost
    ));
  }

  // Caching strategies for different data types
  async checkBatchCache(signals, userId) {
    const cacheKeys = signals.map(s => this.getCacheKey(s, userId));
    const cached = new Map();
    
    // Multi-get from Redis/cache
    const cacheResults = await this.cache.mget(cacheKeys);
    
    cacheResults.forEach((result, index) => {
      if (result) {
        cached.set(signals[index].id, JSON.parse(result));
        this.metrics.cache_hits++;
      } else {
        this.metrics.cache_misses++;
      }
    });
    
    return cached;
  }

  async cacheScoredResults(scoredSignals, userId) {
    const cacheOperations = scoredSignals.map(signal => [
      this.getCacheKey(signal, userId),
      JSON.stringify(signal),
      'EX', 300 // 5 minute TTL
    ]);
    
    if (cacheOperations.length > 0) {
      await this.cache.pipeline(
        cacheOperations.map(op => ['setex', ...op])
      ).exec();
    }
  }

  // Connection pooling and query optimization
  createConnectionPool() {
    return {
      acquire: async () => {
        // Implement connection pooling logic
        return await this.db.getConnection();
      },
      release: (connection) => {
        // Return connection to pool
        this.db.releaseConnection(connection);
      }
    };
  }

  compileQueries() {
    // Pre-compile frequently used queries
    return {
      userGoals: this.db.prepare(`
        SELECT role_weights, kpi_preferences, stakeholder_tags 
        FROM user_goals WHERE user_id = ?
      `),
      entityContext: this.db.prepare(`
        SELECT name, tier, industry, last_interaction_date 
        FROM entities WHERE id IN (${Array(50).fill('?').join(',')})
      `),
      cohortStats: this.db.prepare(`
        SELECT signal_type, acted_ratio, shown_count 
        FROM cohort_stats WHERE role = ? AND signal_type IN (?)
      `)
    };
  }

  // Performance monitoring and auto-tuning
  recordBatchMetrics(signalCount, duration) {
    this.metrics.scores_computed += signalCount;
    this.metrics.batch_times.push(duration);
    
    // Auto-tune batch size based on performance
    if (this.metrics.batch_times.length >= 10) {
      const avgTime = this.metrics.batch_times.reduce((a, b) => a + b, 0) / this.metrics.batch_times.length;
      
      if (avgTime > 100) { // > 100ms average
        this.batchSize = Math.max(100, this.batchSize * 0.8); // Reduce batch size
      } else if (avgTime < 50) { // < 50ms average
        this.batchSize = Math.min(1000, this.batchSize * 1.2); // Increase batch size
      }
      
      // Keep only recent measurements
      this.metrics.batch_times = this.metrics.batch_times.slice(-10);
    }
  }

  async fallbackToIndividualScoring(signals, userId) {
    console.warn('Falling back to individual scoring');
    const results = [];
    
    for (const signal of signals) {
      try {
        const scored = await this.scoreSignalIndividual(signal, userId);
        results.push(scored);
      } catch (error) {
        console.error(`Failed to score signal ${signal.id}:`, error);
        // Include unscored signal with default score
        results.push({ ...signal, score: 0.1, error: error.message });
      }
    }
    
    return { signals: results, fallback: true };
  }

  getMetrics() {
    const cacheHitRate = this.metrics.cache_hits / 
      (this.metrics.cache_hits + this.metrics.cache_misses);
    
    const avgBatchTime = this.metrics.batch_times.length > 0 
      ? this.metrics.batch_times.reduce((a, b) => a + b, 0) / this.metrics.batch_times.length
      : 0;
    
    return {
      total_scores_computed: this.metrics.scores_computed,
      cache_hit_rate: cacheHitRate,
      average_batch_time_ms: Math.round(avgBatchTime),
      current_batch_size: this.batchSize,
      performance_rating: this.calculatePerformanceRating()
    };
  }

  calculatePerformanceRating() {
    const cacheHitRate = this.metrics.cache_hits / 
      (this.metrics.cache_hits + this.metrics.cache_misses);
    const avgTime = this.metrics.batch_times.length > 0 
      ? this.metrics.batch_times.reduce((a, b) => a + b, 0) / this.metrics.batch_times.length
      : 0;
    
    if (cacheHitRate > 0.8 && avgTime < 50) return 'excellent';
    if (cacheHitRate > 0.6 && avgTime < 100) return 'good';
    if (cacheHitRate > 0.4 && avgTime < 200) return 'fair';
    return 'needs_optimization';
  }
}
