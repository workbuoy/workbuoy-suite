import { promises as fs, existsSync } from 'fs';
import path from 'path';
import { AnalysisResult } from '../types.js';

export interface SelfAnalysisOptions {
  projectRoot?: string;
  maxFiles?: number;
}

interface FileInsight {
  lines: number;
  complexity: number;
  patterns: string[];
  opportunities: string[];
}

const DEFAULT_SKIP_DIRECTORIES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.turbo',
  'coverage',
  '.next',
  '.cache',
  'tmp',
  'temp'
]);

const SUPPORTED_EXTENSIONS = new Set(['.ts', '.tsx']);

export class SelfAnalyzer {
  private readonly projectRoot: string;
  private readonly maxFiles: number;
  private currentRoot: string;

  constructor(options: SelfAnalysisOptions = {}) {
    const defaultRoot = options.projectRoot && existsSync(options.projectRoot)
      ? options.projectRoot
      : this.resolveDefaultRoot();
    this.projectRoot = defaultRoot;
    this.maxFiles = Math.max(1, options.maxFiles ?? 250);
    this.currentRoot = this.projectRoot;
  }

  async analyze(projectRoot?: string): Promise<AnalysisResult> {
    const rootToAnalyze = projectRoot && existsSync(projectRoot)
      ? path.resolve(projectRoot)
      : this.projectRoot;
    this.currentRoot = rootToAnalyze;
    const budget = { remaining: this.maxFiles };
    return this.walk(rootToAnalyze, budget);
  }

  private async walk(dir: string, budget: { remaining: number }): Promise<AnalysisResult> {
    const aggregatePatterns = new Set<string>();
    const aggregateOpportunities = new Set<string>();
    let fileCount = 0;
    let linesOfCode = 0;
    let totalComplexity = 0;

    let entries: path.Dirent[] = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return {
        fileCount,
        linesOfCode,
        totalComplexity,
        patterns: [],
        opportunities: []
      };
    }

    for (const entry of entries) {
      if (budget.remaining <= 0) {
        break;
      }

      const absolutePath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (DEFAULT_SKIP_DIRECTORIES.has(entry.name)) {
          continue;
        }
        const childResult = await this.walk(absolutePath, budget);
        fileCount += childResult.fileCount;
        linesOfCode += childResult.linesOfCode;
        totalComplexity += childResult.totalComplexity;
        childResult.patterns.forEach((pattern) => aggregatePatterns.add(pattern));
        childResult.opportunities.forEach((opportunity) => aggregateOpportunities.add(opportunity));
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
        continue;
      }

      budget.remaining -= 1;
      const insight = await this.inspectFile(absolutePath);
      fileCount += 1;
      linesOfCode += insight.lines;
      totalComplexity += insight.complexity;
      insight.patterns.forEach((pattern) => aggregatePatterns.add(pattern));
      insight.opportunities.forEach((opportunity) => aggregateOpportunities.add(opportunity));
    }

    return {
      fileCount,
      linesOfCode,
      totalComplexity,
      patterns: Array.from(aggregatePatterns).sort(),
      opportunities: Array.from(aggregateOpportunities).sort()
    };
  }

  private async inspectFile(filePath: string): Promise<FileInsight> {
    let content = '';
    try {
      content = await fs.readFile(filePath, 'utf8');
    } catch {
      return { lines: 0, complexity: 0, patterns: [], opportunities: [] };
    }

    const lines = content.split(/\r?\n/);
    const relativePath = path.relative(this.currentRoot, filePath);

    const conditionalMatches = content.match(/\b(if|else if|switch|case)\b/g) ?? [];
    const loopMatches = content.match(/\b(for|while)\b/g) ?? [];
    const functionMatches = content.match(/\b(async\s+)?function\b/g) ?? [];
    const complexity = conditionalMatches.length + loopMatches.length + Math.ceil(functionMatches.length / 2);

    const patterns = new Set<string>();
    if (content.includes('Router(') || content.includes("from 'express'")) {
      patterns.add('express-routing');
    }
    if (content.includes('React.') || content.includes('useState(')) {
      patterns.add('react-component');
    }
    if (content.includes('class ')) {
      patterns.add('class-oriented');
    }

    const opportunities = new Set<string>();
    if (lines.length > 400) {
      opportunities.add(`refactor:${relativePath}:long-file`);
    }
    if (content.includes('TODO') || content.includes('FIXME')) {
      opportunities.add(`review:${relativePath}:todo-present`);
    }
    if (complexity > 60) {
      opportunities.add(`complexity:${relativePath}:high`);
    }

    return {
      lines: lines.length,
      complexity,
      patterns: Array.from(patterns),
      opportunities: Array.from(opportunities)
    };
  }

  private resolveDefaultRoot(): string {
    const candidates = [
      path.resolve(process.cwd(), 'src'),
      path.resolve(process.cwd(), 'backend', 'src'),
      path.resolve(process.cwd())
    ];

    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return process.cwd();
  }
}
