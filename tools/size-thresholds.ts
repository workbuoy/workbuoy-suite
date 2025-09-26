#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";

type SizeReport = {
  metrics: {
    workingTreeBytes: number;
    workingTreeGiB?: number;
    nodeModulesCount: number;
    filesCount: number;
  };
};

type ThresholdResult = {
  name: string;
  value: number;
  threshold: number;
  unit: string;
  breached: boolean;
};

const DEFAULTS = {
  SIZE_MAX_GB: 2.6,
  NODE_MODULES_MAX: 220,
  FILES_MAX: 150_000,
};

function readThreshold(name: keyof typeof DEFAULTS): number {
  const value = process.env[name];
  if (!value) {
    return DEFAULTS[name];
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : DEFAULTS[name];
}

function formatValue(value: number, unit: string): string {
  if (unit) {
    return `${value.toFixed(2)}${unit}`;
  }
  return `${Math.round(value)}`;
}

function formatWarning(result: ThresholdResult): string {
  const diff = result.value - result.threshold;
  const formattedDiff = diff > 0 ? `+${formatValue(diff, result.unit)}` : formatValue(diff, result.unit);
  return `${result.name}=${formatValue(result.value, result.unit)} threshold=${formatValue(result.threshold, result.unit)} (diff ${formattedDiff})`;
}

async function loadReport(path: string): Promise<SizeReport> {
  const data = await readFile(path, "utf8");
  return JSON.parse(data) as SizeReport;
}

function evaluate(report: SizeReport): ThresholdResult[] {
  const sizeThreshold = readThreshold("SIZE_MAX_GB");
  const nodeModulesThreshold = readThreshold("NODE_MODULES_MAX");
  const filesThreshold = readThreshold("FILES_MAX");

  const workingTreeGiB = report.metrics.workingTreeBytes / 1024 ** 3;

  return [
    {
      name: "repoSize",
      value: workingTreeGiB,
      threshold: sizeThreshold,
      unit: "GiB",
      breached: workingTreeGiB > sizeThreshold,
    },
    {
      name: "nodeModules",
      value: report.metrics.nodeModulesCount,
      threshold: nodeModulesThreshold,
      unit: "",
      breached: report.metrics.nodeModulesCount > nodeModulesThreshold,
    },
    {
      name: "files",
      value: report.metrics.filesCount,
      threshold: filesThreshold,
      unit: "",
      breached: report.metrics.filesCount > filesThreshold,
    },
  ];
}

async function main() {
  const target = process.argv[2] ?? "size-report.json";
  const report = await loadReport(target);
  const results = evaluate(report);

  let warnings = 0;
  for (const result of results) {
    if (result.breached) {
      warnings += 1;
      console.log(`::warning ::${formatWarning(result)}`);
    }
  }

  console.log(
    JSON.stringify(
      {
        results,
        warnings,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("size-thresholds failed", error);
  process.exitCode = 1;
});
