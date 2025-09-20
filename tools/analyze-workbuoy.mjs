#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const skipDirNames = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.cache',
  '.venv',
  'venv',
  'coverage',
  'out',
  'tmp',
  'temp',
  '__pycache__',
  '.idea',
  '.vscode',
  '.DS_Store'
]);

const pillarConfig = {
  CORE: {
    indicators: [
      'backend',
      'core',
      'services',
      'src',
      'types',
      'db',
      'database',
      'prisma',
      'api',
      'data'
    ]
  },
  FLEX: {
    indicators: [
      'integrations',
      'integration',
      'connectors',
      'connector',
      'sdk',
      'automation',
      'automations',
      'workflow',
      'workflows',
      'examples',
      'prototypes',
      'plugins',
      'extensions'
    ]
  },
  SECURE: {
    indicators: [
      'secure',
      'security',
      'roles',
      'policy',
      'governance',
      'auth',
      'rbac',
      'abac',
      'compliance',
      'meta_route',
      'meta-route',
      'meta_route',
      'meta-route'
    ]
  },
  NAVI: {
    indicators: [
      'frontend',
      'ui',
      'desktop',
      'desktop_demo',
      'navi',
      'ux',
      'client',
      'web',
      'cards',
      'ui-kit'
    ]
  },
  BUOY_AI: {
    indicators: [
      'ai',
      'assistant',
      'llm',
      'chat',
      'prompt',
      'meta',
      'openai',
      'buoy'
    ]
  },
  ROLES: {
    indicators: [
      'roles',
      'role',
      'rbac',
      'abac',
      'authz',
      'access'
    ]
  },
  PROACTIVITY: {
    indicators: [
      'proactivity',
      'proactive',
      'proaktiv',
      'assistive',
      'automated',
      'tsunami',
      'kraken',
      'rolig',
      'usynlig',
      'ambisi',
      'nudges'
    ]
  },
  META: {
    indicators: [
      'meta',
      '.evolution',
      'evolution',
      'genesis',
      'autonomous',
      'gatekeeper'
    ]
  },
  INFRA: {
    indicators: [
      'deploy',
      'deployment',
      'manifests',
      'manifest',
      'ops',
      'infra',
      'helm',
      'k8s',
      'kubernetes',
      'docker',
      'observability',
      'grafana',
      'alert',
      'telemetry',
      'monitoring'
    ]
  },
  ADOPTION: {
    indicators: [
      'adoption',
      'onboarding',
      'templates',
      'template',
      'nudges',
      'playbooks',
      'samples',
      'examples',
      'starter',
      'tutorial',
      'guides'
    ]
  }
};

const docExtensions = new Set(['.md', '.mdx', '.txt', '.rst', '.adoc']);
const codeExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.go',
  '.java',
  '.rb',
  '.rs',
  '.cs',
  '.php',
  '.kt',
  '.swift',
  '.scala',
  '.sql',
  '.prisma',
  '.sh',
  '.ps1'
]);
const configExtensions = new Set([
  '.json',
  '.yml',
  '.yaml',
  '.toml',
  '.ini',
  '.env',
  '.cfg',
  '.conf',
  '.xml',
  '.properties',
  '.proto',
  '.graphql'
]);

const httpMethodRegex = /(app|router|route|server|fastify|express|koa|h3|handler)\s*[\.\[]\s*(get|post|put|delete|patch|options|head)/i;
const nextRouteRegex = /export\s+async\s+function\s+(GET|POST|PUT|DELETE|PATCH)/i;
const httpPathSegments = new Set(['api', 'routes', 'route', 'router', 'controllers', 'handlers', 'endpoints']);
const httpRouteFileNames = new Set([
  'route.ts',
  'route.tsx',
  'route.js',
  'route.jsx',
  'route.mjs',
  'route.cjs'
]);
const fsWriteRegex = /\bfs(?:\.promises)?\.(writeFile|appendFile|createWriteStream|writeFileSync|appendFileSync|rm|rmdir|mkdir|unlink|rename|copyFile|cp|mv|chmod|chown|outputFile|outputJson)\b/;
const fsExtraWriteRegex = /\bfsExtra\.(write|output|ensure|copy|move|mkdirp)/i;
const childProcessGitRegex = /(exec|spawn|execSync|spawnSync)\([^\)]*git/i;

const signalRegexes = {
  META_SAFEGUARDS: [
    /genesis\/[a-z0-9_-]*introspection-report/i,
    /genesis\/[a-z0-9_-]*autonomous/i,
    /genetics\/[a-z0-9_-]*evolution/i,
    /\.evolution\/?approved/i,
    /evolution\s+gatekeeper/i,
    /approval[_-]?required/i,
    /meta[_-]?evolution/i,
    /no\s+git/i,
    /no\s+fs/i,
    /http\s+merge/i
  ],
  FLIPCARD: [
    /flip\s*-?card/i,
    /flipcard/i,
    /flipkort/i,
    /front\s*=\s*buoy/i,
    /back\s*=\s*navi/i,
    /card\s+flip/i
  ],
  PROACTIVITY: [
    /proactiv/i,
    /usynlig/i,
    /rolig/i,
    /ambisi[øo]s/i,
    /kraken/i,
    /tsunami/i,
    /silent\s+mode/i,
    /suggestive/i,
    /advisory/i,
    /assistive/i,
    /automated/i
  ],
  ROLES: [
    /\bRBAC\b/i,
    /\bABAC\b/i,
    /role-based/i,
    /role\s+library/i,
    /role\s+map/i,
    /role\s+guard/i,
    /role\s+check/i,
    /\bRole[A-Z][A-Za-z0-9_]*/
  ],
  SECURE_RAILS: [
    /approval\s+gate/i,
    /approval[_-]?required/i,
    /guardrail/i,
    /guard\s*rail/i,
    /governance/i,
    /policy\s+(engine|enforcement|check|guard)/i,
    /meta\s+route/i,
    /evolution\s+gatekeeper/i,
    /role\s+guard/i,
    /no\s+git/i,
    /no\s+fs/i
  ]
};

const pluralAssistantRegexes = [
  /\bassistants\b/i,
  /multiple\s+assistants/i,
  /multi-?assistant/i,
  /assistant\s+pool/i
];
const singularAssistantRegexes = [
  /buoy\s+ai/i,
  /single\s+assistant/i,
  /the\s+assistant/i
];

const pillarState = {};
for (const key of Object.keys(pillarConfig)) {
  pillarState[key] = {
    dirs: new Set(),
    code: new Set(),
    docs: new Set()
  };
}

const signals = {
  META_SAFEGUARDS: [],
  FLIPCARD: [],
  PROACTIVITY: [],
  ROLES: [],
  SECURE_RAILS: [],
  BUOY_ASSISTANT_SINGULAR: {
    singular_mentions: [],
    plural_hits: []
  }
};

const signalSeen = {};
for (const key of Object.keys(signalRegexes)) {
  signalSeen[key] = new Set();
}

const violations = {
  http_write_ops: [],
  missing_approval_gate: []
};

function matchesIndicator(relPath, indicator) {
  const lower = relPath.toLowerCase();
  const key = indicator.toLowerCase();
  if (lower === key) return true;
  if (lower.endsWith('/' + key)) return true;
  if (lower.includes('/' + key + '/')) return true;
  if (lower.startsWith(key + '/')) return true;
  if (lower.includes('/' + key + '-')) return true;
  if (lower.includes('/' + key + '_')) return true;
  if (lower.includes('-' + key + '/')) return true;
  if (lower.includes('_' + key + '/')) return true;
  if (lower.includes('/' + key + '.')) return true;
  if (lower.includes('/' + key + '\\')) return true;
  return lower.includes(key) && key.length > 3;
}

function isDocFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (docExtensions.has(ext)) return true;
  const base = path.basename(relPath).toLowerCase();
  if (base.startsWith('readme')) return true;
  if (base === 'license' || base === 'changelog' || base === 'contributing') return true;
  if (base.endsWith('.md')) return true;
  return false;
}

function isCodeFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (codeExtensions.has(ext)) return true;
  const base = path.basename(relPath).toLowerCase();
  if (base === 'dockerfile' || base === 'makefile' || base.endsWith('.make')) return true;
  if (ext === '.tsconfig') return true;
  return false;
}

function isConfigFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (configExtensions.has(ext)) return true;
  const base = path.basename(relPath).toLowerCase();
  if (base === 'dockerfile' || base === 'makefile') return true;
  if (base.endsWith('.config') || base.endsWith('.conf')) return true;
  return false;
}

function trackPillar(pillar, type, relPath) {
  if (!pillarState[pillar]) return;
  if (type === 'dir') {
    pillarState[pillar].dirs.add(relPath);
  } else if (type === 'code') {
    pillarState[pillar].code.add(relPath);
  } else if (type === 'doc') {
    pillarState[pillar].docs.add(relPath);
  }
}

function addSignal(signal, relPath, lineNumber, lineText) {
  if (!signals[signal]) return;
  const snippet = lineText.trim().slice(0, 240);
  signals[signal].push({ file: relPath, line: lineNumber, match: snippet });
}

function addAssistantSignal(type, relPath, lineNumber, lineText) {
  if (relPath === 'tools/analyze-workbuoy.mjs') {
    return;
  }
  const snippet = lineText.trim().slice(0, 240);
  signals.BUOY_ASSISTANT_SINGULAR[type].push({ file: relPath, line: lineNumber, match: snippet });
}

function walk(currentDir) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);
    const relPath = path.relative(repoRoot, fullPath);
    if (entry.isDirectory()) {
      if (skipDirNames.has(entry.name)) continue;
      for (const [pillar, config] of Object.entries(pillarConfig)) {
        for (const indicator of config.indicators) {
          if (matchesIndicator(relPath, indicator)) {
            trackPillar(pillar, 'dir', relPath + '/');
            break;
          }
        }
      }
      walk(fullPath);
    } else if (entry.isFile()) {
      processFile(fullPath, relPath);
    }
  }
}

function processFile(fullPath, relPath) {
  const doc = isDocFile(relPath);
  const code = isCodeFile(relPath) || isConfigFile(relPath);

  for (const [pillar, config] of Object.entries(pillarConfig)) {
    for (const indicator of config.indicators) {
      if (matchesIndicator(relPath, indicator)) {
        if (code) {
          trackPillar(pillar, 'code', relPath);
        } else if (doc) {
          trackPillar(pillar, 'doc', relPath);
        }
        break;
      }
    }
  }

  const stats = fs.statSync(fullPath);
  if (stats.size > 2 * 1024 * 1024) {
    return;
  }

  let buffer;
  try {
    buffer = fs.readFileSync(fullPath);
  } catch (err) {
    return;
  }

  if (buffer.includes(0)) {
    return;
  }

  let content;
  try {
    content = buffer.toString('utf8');
  } catch (err) {
    return;
  }

  const lowerPath = relPath.toLowerCase();
  const pathSegments = lowerPath.split(/[\\/]/).filter(Boolean);
  const isTestLike =
    pathSegments.includes('__tests__') ||
    pathSegments.includes('__mocks__') ||
    /\.test\./.test(lowerPath) ||
    /\.spec\./.test(lowerPath);

  let httpByPath = false;
  for (let i = 0; i < pathSegments.length; i += 1) {
    const segment = pathSegments[i];
    if (httpPathSegments.has(segment)) {
      httpByPath = true;
      break;
    }
    const next = pathSegments[i + 1];
    if ((segment === 'pages' || segment === 'app') && next === 'api') {
      httpByPath = true;
      break;
    }
  }

  const baseLower = path.basename(lowerPath);
  if (!httpByPath && httpRouteFileNames.has(baseLower)) {
    httpByPath = true;
  }

  let httpByContent = false;

  const lines = content.split(/\r?\n/);
  const pendingWriteOps = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();

    if (
      !httpByContent &&
      (httpMethodRegex.test(line) ||
        nextRouteRegex.test(line) ||
        /\bcreateRouter\b/i.test(line) ||
        /\bNextApiRequest\b/i.test(line) ||
        /\bRequestHandler\b/i.test(line) ||
        /router\.use\(/i.test(line) ||
        /export\s+const\s+GET\s*=\s*/i.test(line))
    ) {
      httpByContent = true;
    }

    if (fsWriteRegex.test(line) || fsExtraWriteRegex.test(line) || childProcessGitRegex.test(line)) {
      pendingWriteOps.push({ line: i + 1, snippet: trimmed.slice(0, 200) });
    }

    for (const [signal, regexList] of Object.entries(signalRegexes)) {
      for (let idx = 0; idx < regexList.length; idx += 1) {
        const regex = regexList[idx];
        if (regex.test(line)) {
          const key = `${relPath}:${i + 1}:${idx}`;
          if (!signalSeen[signal].has(key)) {
            signalSeen[signal].add(key);
            if (signal === 'ROLES' && doc) {
              continue;
            }
            addSignal(signal, relPath, i + 1, line);
          }
        }
      }
    }

    for (const regex of singularAssistantRegexes) {
      if (regex.test(line)) {
        addAssistantSignal('singular_mentions', relPath, i + 1, line);
        break;
      }
    }

    for (const regex of pluralAssistantRegexes) {
      if (regex.test(line)) {
        addAssistantSignal('plural_hits', relPath, i + 1, line);
        break;
      }
    }
  }

  const isHttpFile = !isTestLike && (httpByPath || httpByContent);

  if (isHttpFile) {
    for (const op of pendingWriteOps) {
      violations.http_write_ops.push({ file: relPath, line: op.line, snippet: op.snippet });
    }
  }
}

walk(repoRoot);

const summary = {};
const files = {};

for (const [pillar, state] of Object.entries(pillarState)) {
  const hasCode = state.code.size > 0;
  const hasDocs = state.docs.size > 0;
  const hasDirs = state.dirs.size > 0;
  let status = 'missing';
  if (hasCode) {
    status = 'present';
  } else if (hasDirs || hasDocs) {
    status = 'partial';
  }
  summary[pillar] = status;
  const combined = new Set([...state.dirs, ...state.code, ...state.docs]);
  files[pillar] = Array.from(combined).sort().slice(0, 120);
}

const approvalPatterns = [/\.evolution\/?approved/i, /approval[_-]?required/i, /evolution\s+gatekeeper/i];
const hasApprovalSignal = signals.META_SAFEGUARDS.some((entry) => approvalPatterns.some((regex) => regex.test(entry.match)));
if (!hasApprovalSignal) {
  violations.missing_approval_gate.push({ file: null, reason: 'No approval gate references detected (.evolution/APPROVED, approval_required, or evolution gatekeeper).' });
}

let head = null;
try {
  head = execSync('git rev-parse --short HEAD', { cwd: repoRoot }).toString().trim();
} catch (err) {
  head = null;
}

const result = {
  head,
  summary,
  files,
  signals,
  violations
};

console.log(JSON.stringify(result, null, 2));
