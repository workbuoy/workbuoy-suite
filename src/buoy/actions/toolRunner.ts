import { v4 as uuidv4 } from "uuid";

type RunToolOptions = {
  baseUrl: string;
  apiKey?: string;
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

type ToolResponse = {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  body: unknown;
};

function buildUrl(baseUrl: string, path: string): string {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    const normalisedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const normalisedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalisedBase}${normalisedPath}`;
  }
}

export async function runTool(options: RunToolOptions): Promise<ToolResponse> {
  const { baseUrl, method, path, body, headers = {}, apiKey } = options;
  const url = buildUrl(baseUrl, path);

  const requestHeaders = new Headers();
  requestHeaders.set("content-type", "application/json");
  requestHeaders.set("idempotency-key", uuidv4());
  if (apiKey) {
    requestHeaders.set("x-api-key", apiKey);
  }
  for (const [key, value] of Object.entries(headers)) {
    requestHeaders.set(key, value);
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const headerEntries = Object.fromEntries(response.headers.entries());
  const text = await response.text();
  let parsed: unknown = text;
  if (text.length) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  } else {
    parsed = null;
  }

  return {
    status: response.status,
    ok: response.ok,
    headers: headerEntries,
    body: parsed,
  };
}
