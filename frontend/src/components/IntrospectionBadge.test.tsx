import { render, screen } from '@testing-library/react';
import { IntrospectionBadge } from './IntrospectionBadge';
import type { IntrospectionResponse } from '@/api/introspection';

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

const successResponse: IntrospectionResponse = {
  ok: true,
  awarenessScore: 0.42,
  introspectionReport: {
    generatedAt: '2024-06-01T12:00:00.000Z',
    summary: 'System status: green',
    signals: [],
    recommendations: [],
  },
};

test('renders Awareness score after introspection succeeds via fallback', async () => {
  const calls: string[] = [];
  global.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : (input as any).url ?? input.toString();
    calls.push(url);

    if (url.endsWith('/api/introspection')) {
      return createMockResponse(404);
    }

    if (url.endsWith('/genesis/introspection-report')) {
      return createMockResponse(200, successResponse);
    }

    return createMockResponse(500);
  }) as typeof fetch;

  render(<IntrospectionBadge />);

  expect(await screen.findByText('Awareness score: 42%')).toBeInTheDocument();
  expect(calls).toEqual([
    '/api/introspection',
    '/genesis/introspection-report',
  ]);
});

function createMockResponse(
  status: number,
  body?: unknown,
  contentType = 'application/json',
): Response {
  const ok = status >= 200 && status < 300;
  const headers = {
    get: (name: string) =>
      body !== undefined && name.toLowerCase() === 'content-type'
        ? contentType
        : null,
  };

  return {
    ok,
    status,
    headers: headers as Headers,
    json: async () => body as any,
    text: async () =>
      typeof body === 'string' ? body : JSON.stringify(body ?? ''),
  } as unknown as Response;
}
