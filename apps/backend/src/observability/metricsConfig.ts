const TRUE_VALUES = new Set(['1', 'true', 'yes']);

export function isMetricsEnabled(): boolean {
  const raw = process.env.METRICS_ENABLED;
  if (!raw) {
    return false;
  }

  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return TRUE_VALUES.has(normalized);
}

export function getMetricsPrefix(): string {
  const raw = process.env.METRICS_PREFIX;
  if (typeof raw !== 'string') {
    return '';
  }
  return raw;
}

export function getDefaultLabels(): Record<string, string> {
  const raw = process.env.METRICS_DEFAULT_LABELS;
  if (!raw) {
    return {};
  }

  const labels: Record<string, string> = {};
  for (const pair of raw.split(',')) {
    if (!pair) {
      continue;
    }

    const [key, ...valueParts] = pair.split('=');
    if (!key) {
      continue;
    }

    const value = valueParts.join('=');
    if (value === undefined) {
      continue;
    }

    const normalizedKey = key.trim();
    if (!normalizedKey) {
      continue;
    }

    labels[normalizedKey] = value.trim();
  }

  return labels;
}

export function getBuckets(): number[] {
  const raw = process.env.METRICS_BUCKETS;
  if (!raw) {
    return [];
  }

  const buckets: number[] = [];
  for (const token of raw.split(',')) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }

    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      continue;
    }
    buckets.push(parsed);
  }

  return buckets;
}
