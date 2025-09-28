import type { Request, Response } from "express";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

function readPkgVersion(): string | undefined {
  try {
    // I transpilet kode blir dette dist/src/http/version.js → ../../package.json = dist/package.json
    // Mangler filen, returner undefined (ingen crash).
    // @ts-ignore - type narrowing ved runtime
    return (require("../../package.json").version as string) || undefined;
  } catch {
    return undefined;
  }
}

export function versionHandler(_req: Request, res: Response) {
  const envVersion =
    process.env.APP_VERSION ||
    process.env.BACKEND_VERSION ||
    undefined;

  const sha =
    process.env.GIT_SHA ||
    process.env.COMMIT_SHA ||
    undefined;

  const version = envVersion ?? readPkgVersion() ?? "unknown";
  res.json({ version, sha });
}
