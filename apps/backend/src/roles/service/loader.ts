import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SERVICE_RELATIVE_PATH = '../../../../../src/roles/service.ts';

type ServiceModule = Record<string, unknown>;

let modulePromise: Promise<ServiceModule> | null = null;

export async function loadServiceModule(): Promise<ServiceModule> {
  if (!modulePromise) {
    const target = pathToFileURL(path.resolve(__dirname, SERVICE_RELATIVE_PATH)).href;
    modulePromise = import(target) as Promise<ServiceModule>;
  }
  try {
    return await modulePromise;
  } catch (err) {
    modulePromise = null;
    throw err;
  }
}
