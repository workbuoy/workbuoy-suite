import fetch from 'node-fetch';

type SpanAttributes = Record<string, any>;

const DEFAULT_ENDPOINT = 'http://127.0.0.1:4318/v1/traces';
let configuredEndpoint: string | undefined;
let telemetryInitialised = false;

function resolveEndpoint() {
  return configuredEndpoint ?? process.env.OTLP_HTTP_URL ?? DEFAULT_ENDPOINT;
}

export function initTelemetry(options?: { endpoint?: string }) {
  configuredEndpoint = options?.endpoint ?? configuredEndpoint;
  telemetryInitialised = true;
}

export async function span(name: string, attributes: SpanAttributes = {}) {
  const endpoint = resolveEndpoint();
  const normalised = Object.entries(attributes).map(([key, value]) => ({
    key,
    value: { stringValue: typeof value === 'string' ? value : JSON.stringify(value) },
  }));

  const body = {
    resourceSpans: [
      {
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: 'workbuoy-desktop' } },
            { key: 'telemetry.initialised', value: { stringValue: telemetryInitialised ? 'true' : 'false' } },
          ],
        },
        scopeSpans: [
          {
            scope: { name: 'custom' },
            spans: [
              {
                name,
                attributes: normalised,
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function startSpan(name: string, attributes: SpanAttributes = {}) {
  const start = Date.now();
  return {
    end: (extra: SpanAttributes = {}) => span(name, { ...attributes, ...extra, duration_ms: Date.now() - start }),
  };
}

export function crashCounter() {
  let value = 0;
  return {
    add(delta = 1) {
      value += delta;
      return value;
    },
    get value() {
      return value;
    },
  };
}
