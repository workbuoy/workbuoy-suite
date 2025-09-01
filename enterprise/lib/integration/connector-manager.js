export class ConnectorManager {
  constructor() {
    this.connectors = new Map();
    this.circuitBreakers = new Map();
    this.healthChecks = new Map();
    this.fallbackStrategies = new Map();
  }

  registerConnector(name, connector, options = {}) {
    this.connectors.set(name, connector);
    
    // Create circuit breaker for this connector
    const breaker = new CircuitBreaker(name, {
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 60000
    });
    this.circuitBreakers.set(name, breaker);

    // Register health check
    if (connector.healthCheck) {
      this.healthChecks.set(name, connector.healthCheck.bind(connector));
    }

    // Register fallback strategy
    if (options.fallback) {
      this.fallbackStrategies.set(name, options.fallback);
    }
  }

  async execute(connectorName, operation, ...args) {
    const connector = this.connectors.get(connectorName);
    if (!connector) {
      throw new Error(`Connector ${connectorName} not found`);
    }

    const breaker = this.circuitBreakers.get(connectorName);
    const fallback = this.fallbackStrategies.get(connectorName);

    return await breaker.execute(
      () => connector[operation](...args),
      fallback ? () => fallback(operation, ...args) : null
    );
  }

  // Intelligent fallback strategies
  setupFallbackStrategies() {
    // CRM fallbacks
    this.fallbackStrategies.set('salesforce', async (operation, ...args) => {
      switch (operation) {
        case 'getAccounts':
          // Fallback to cached data
          return await this.getCachedAccounts();
        case 'getOpportunities':
          // Use HubSpot as backup CRM
          if (this.isHealthy('hubspot')) {
            return await this.execute('hubspot', 'getOpportunities', ...args);
          }
          return await this.getCachedOpportunities();
        case 'updateRecord':
          // Queue for later execution
          return await this.queueForLaterExecution('salesforce', operation, args);
        default:
          throw new Error(`No fallback available for ${operation}`);
      }
    });

    // Analytics fallbacks
    this.fallbackStrategies.set('analytics', async (operation, ...args) => {
      switch (operation) {
        case 'getMetrics':
          // Use cached metrics with staleness warning
          const cached = await this.getCachedMetrics();
          return { ...cached, _stale: true, _cached_at: cached.timestamp };
        case 'getReports':
          // Generate simplified reports from CRM data
          return await this.generateFallbackReports(...args);
        default:
          return null;
      }
    });
  }

  async runHealthChecks() {
    const results = new Map();
    
    for (const [name, healthCheck] of this.healthChecks.entries()) {
      try {
        const startTime = Date.now();
        const result = await Promise.race([
          healthCheck(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Health check timeout')), 5000)
          )
        ]);
        
        results.set(name, {
          healthy: true,
          response_time: Date.now() - startTime,
          details: result
        });
      } catch (error) {
        results.set(name, {
          healthy: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    return results;
  }

  isHealthy(connectorName) {
    const breaker = this.circuitBreakers.get(connectorName);
    return breaker && breaker.state === 'CLOSED';
  }

  // Queue management for failed operations
  async queueForLaterExecution(connectorName, operation, args) {
    const queueItem = {
      id: this.generateId(),
      connector: connectorName,
      operation,
      args,
      queued_at: new Date().toISOString(),
      retry_count: 0,
      max_retries: 3
    };

    await this.addToRetryQueue(queueItem);
    
    return {
      queued: true,
      queue_id: queueItem.id,
      message: `Operation queued for retry when ${connectorName} is available`
    };
  }

  async processRetryQueue() {
    const queuedItems = await this.getQueuedItems();
    
    for (const item of queuedItems) {
      if (this.isHealthy(item.connector)) {
        try {
          await this.execute(item.connector, item.operation, ...item.args);
          await this.removeFromQueue(item.id);
          console.info(`Successfully processed queued item ${item.id}`);
        } catch (error) {
          await this.incrementRetryCount(item.id);
          if (item.retry_count >= item.max_retries) {
            await this.moveToDeadLetterQueue(item);
          }
        }
      }
    }
  }
}
