import type { RequestHandler } from 'express';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

type MulterFieldConfig = { name: string; maxCount?: number };
type MulterOptions = {
  storage?: unknown;
  limits?: { fileSize?: number };
  fileFilter?: (...args: unknown[]) => void;
  preservePath?: boolean;
};

type MulterInstance = {
  single: (fieldName: string) => RequestHandler;
  array: (fieldName: string, maxCount?: number) => RequestHandler;
  fields: (fields: MulterFieldConfig[]) => RequestHandler;
  none: () => RequestHandler;
  any: () => RequestHandler;
};

type MulterFactory = ((options?: MulterOptions) => MulterInstance) & {
  memoryStorage: () => unknown;
};

const multer = require('multer') as MulterFactory;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  stream?: NodeJS.ReadableStream;
  destination?: string;
  filename?: string;
  path?: string;
  [key: string]: unknown;
}
