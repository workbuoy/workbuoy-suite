export function requireString(value: string | undefined, name: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing or empty required string: ${name}`);
  }
  return value;
}

export function requireEnv(name: string): string {
  return requireString(process.env[name], `process.env.${name}`);
}

export function requireParam<T extends Record<string, unknown>>(params: T, key: keyof T & string): string {
  const v = params[key];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`Missing required route param: ${key}`);
  }
  return v;
}

export function requireHeader(headers: Record<string, unknown>, key: string): string {
  const v = headers[key.toLowerCase()] as string | undefined;
  return requireString(v, `header ${key}`);
}
