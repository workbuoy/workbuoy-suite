export function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing or empty required string: ${name}`);
  }
  return value;
}

export function requireHeader(headers: Record<string, unknown>, key: string): string {
  const v = (headers[key.toLowerCase()] ?? headers[key]) as string | undefined;
  return requireString(v, `header ${key}`);
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  return requireString(value, `process.env.${name}`);
}

export function assertDefined<T>(value: T | null | undefined, name: string): T {
  if (value === undefined || value === null) {
    throw new Error(`${name} is undefined`);
  }
  return value;
}
