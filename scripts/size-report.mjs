#!/usr/bin/env node
import { execFile } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import process from "node:process";
import path from "node:path";

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const result = {
    output: "size-report.json",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--output" || arg === "-o") {
      result.output = argv[index + 1] ?? result.output;
      index += 1;
    }
  }

  return result;
}

async function measureWorkingTreeBytes() {
  const { stdout } = await execFileAsync("du", ["-sk", "."], { encoding: "utf8" });
  const [sizeKb] = stdout.trim().split(/\s+/);
  return Number.parseInt(sizeKb, 10) * 1024;
}

async function countNodeModules() {
  const { stdout } = await execFileAsync("bash", ["-lc", "find . -type d -name 'node_modules' -prune | wc -l"], {
    encoding: "utf8",
  });
  return Number.parseInt(stdout.trim(), 10);
}

async function countFiles() {
  const { stdout } = await execFileAsync("bash", ["-lc", "find . -type f | wc -l"], { encoding: "utf8" });
  return Number.parseInt(stdout.trim(), 10);
}

function toGiB(bytes) {
  return bytes / 1024 ** 3;
}

async function main() {
  const { output } = parseArgs(process.argv);
  const workingTreeBytes = await measureWorkingTreeBytes();
  const nodeModulesCount = await countNodeModules();
  const filesCount = await countFiles();

  const report = {
    generatedAt: new Date().toISOString(),
    metrics: {
      workingTreeBytes,
      workingTreeGiB: toGiB(workingTreeBytes),
      nodeModulesCount,
      filesCount,
    },
  };

  const destination = path.resolve(process.cwd(), output);
  await writeFile(destination, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Repository size report written to ${destination}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error("size-report failed", error);
  process.exitCode = 1;
});
