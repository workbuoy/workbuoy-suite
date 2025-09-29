import type { Request, Response } from "express";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type PackageJson = { version?: string };

function readPackageVersion(): string | undefined {
  try {
    const pkg = require("../../package.json") as PackageJson;
    return typeof pkg?.version === "string" ? pkg.version : undefined;
  } catch {
    return undefined;
  }
}

export function versionHandler(_req: Request, res: Response) {
  const version =
    process.env.APP_VERSION ??
    process.env.BACKEND_VERSION ??
    readPackageVersion() ??
    "unknown";

  const sha = process.env.GIT_SHA ?? process.env.COMMIT_SHA ?? "dev";

  res.json({ version, sha });
}
