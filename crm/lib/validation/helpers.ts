import type { NextApiResponse } from 'next';
import { ZodSchema } from 'zod';

export function validateOr400<T>(res: NextApiResponse, schema: ZodSchema<T>, data: unknown): T | null {
  const r = schema.safeParse(data);
  if (!r.success) {
    res.status(400).json({ error: 'validation_failed', details: r.error.flatten() });
    return null;
  }
  return r.data;
}
