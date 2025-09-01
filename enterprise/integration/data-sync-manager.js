export class DataSyncManager {
  constructor(connectorManager) {
    this.connectors = connectorManager;
    this.syncStrategies = new Map();
    this.conflictResolvers = new Map();
  }

  registerSyncStrategy(entityType, strategy) {
    this.syncStrategies.set(entityType, strategy);
  }

  async syncEntity(entityType, entityId, sources = null) {
    const strategy = this.syncStrategies.get(entityType);
    if (!strategy) {
      throw new Error(`No sync strategy for entity type: ${entityType}`);
    }

    const availableSources = sources || await this.getAvailableSources(entityType);
    const syncResults = [];

    // Parallel fetch from all available sources
    const fetchPromises = availableSources.map(async (source) => {
      try {
        const data = await this.connectors.execute(source, 'getEntity', entityType, entityId);
        return { source, data, success: true };
      } catch (error) {
        return { source, error: error.message, success: false };
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const successfulFetches = results
      .filter(r => r.status === 'fulfilled' && r.value.success)
      .map(r => r.value);

    if (successfulFetches.length === 0) {
      throw new Error(`Failed to sync ${entityType}:${entityId} from any source`);
    }

    // Detect and resolve conflicts
    const conflicts = this.detectConflicts(successfulFetches);
    const resolvedData = await this.resolveConflicts(entityType, conflicts);

    // Apply master data record
    const masterRecord = await strategy.buildMasterRecord(resolvedData, successfulFetches);
    
    return {
      entity_id: entityId,
      entity_type: entityType,
      master_record: masterRecord,
      sources_synced: successfulFetches.map(f => f.source),
      conflicts_resolved: conflicts.length,
      sync_timestamp: new Date().toISOString()
    };
  }

  detectConflicts(fetches) {
    if (fetches.length <= 1) return [];

    const conflicts = [];
    const fieldValues = {};

    // Group values by field across sources
    fetches.forEach(({ source, data }) => {
      Object.entries(data).forEach(([field, value]) => {
        if (!fieldValues[field]) fieldValues[field] = [];
        fieldValues[field].push({ source, value });
      });
    });

    // Find fields with different values
    Object.entries(fieldValues).forEach(([field, values]) => {
      const uniqueValues = [...new Set(values.map(v => JSON.stringify(v.value)))];
      
      if (uniqueValues.length > 1) {
        conflicts.push({
          field,
          values: values,
          conflict_type: this.classifyConflict(field, values)
        });
      }
    });

    return conflicts;
  }

  async resolveConflicts(entityType, conflicts) {
    const resolver = this.conflictResolvers.get(entityType) || this.defaultConflictResolver;
    const resolved = {};

    for (const conflict of conflicts) {
      try {
        const resolution = await resolver(conflict);
        resolved[conflict.field] = resolution.value;
      } catch (error) {
        console.error(`Failed to resolve conflict for ${conflict.field}:`, error);
        // Use first available value as fallback
        resolved[conflict.field] = conflict.values[0].value;
      }
    }

    return resolved;
  }

  defaultConflictResolver = async (conflict) => {
    const { field, values } = conflict;

    // Source priority rules
    const sourcePriority = {
      'salesforce': 10,
      'hubspot': 8,
      'd365': 9,
      'manual_entry': 15, // Highest priority for manual entries
      'data_enrichment': 5
    };

    // Timestamp-based resolution for time-sensitive fields
    const timestampFields = ['modified_date', 'last_activity', 'status_change_date'];
    if (timestampFields.includes(field)) {
      return this.resolveByStaleness(values);
    }

    // Quality-based resolution for critical fields
    const criticalFields = ['email', 'phone', 'amount', 'close_date'];
    if (criticalFields.includes(field)) {
      return this.resolveByQuality(values);
    }

    // Default: resolve by source priority
    const sorted = values.sort((a, b) => 
      (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0)
    );

    return {
      value: sorted[0].value,
      reason: `source_priority:${sorted[0].source}`,
      confidence: 0.8
    };
  }

  resolveByStaleness(values) {
    // Prefer most recently updated value
    const withTimestamps = values.filter(v => v.value && v.modified_date);
    if (withTimestamps.length > 0) {
      const latest = withTimestamps.sort((a, b) => 
        new Date(b.modified_date) - new Date(a.modified_date)
      )[0];
      return {
        value: latest.value,
        reason: 'most_recent',
        confidence: 0.9
      };
    }
    return { value: values[0].value, reason: 'fallback', confidence: 0.5 };
  }

  resolveByQuality(values) {
    // Use data quality scores if available
    const withQuality = values.filter(v => v.quality_score);
    if (withQuality.length > 0) {
      const highest = withQuality.sort((a, b) => b.quality_score - a.quality_score)[0];
      return {
        value: highest.value,
        reason: `quality_score:${highest.quality_score}`,
        confidence: highest.quality_score
      };
    }
    return { value: values[0].value, reason: 'no_quality_data', confidence: 0.6 };
  }
}
