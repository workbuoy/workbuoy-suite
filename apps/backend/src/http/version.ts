import type { Request, Response } from "express";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

type PackageJson = { version?: string; name?: string };

type PackageMetadata = {
  name?: string;
  version?: string;
};

function readPackageMetadata(): PackageMetadata {
  try {
    const pkg = require("../../package.json") as PackageJson;
    const name = typeof pkg?.name === "string" ? pkg.name : undefined;
    const version = typeof pkg?.version === "string" ? pkg.version : undefined;
    return { name, version };
  } catch {
    return {};
  }
}

export function versionHandler(_req: Request, res: Response) {
  const pkg = readPackageMetadata();
  const version =
    process.env.APP_VERSION ??
    process.env.BACKEND_VERSION ??
    pkg.version ??
    "unknown";
  const name = process.env.APP_NAME ?? process.env.BACKEND_NAME ?? pkg.name ?? "workbuoy-backend";

  const sha = process.env.GIT_SHA ?? process.env.COMMIT_SHA ?? "dev";

  res.json({ name, version, sha });
}
