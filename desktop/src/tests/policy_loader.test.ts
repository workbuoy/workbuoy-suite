import { writeFileSync } from 'fs';
import { loadPolicy, withEnvOverrides } from '../policy/loader.js';
import os from 'os';
import path from 'path';

const tmp = path.join(process.cwd(), 'policy.tmp.json');
writeFileSync(tmp, JSON.stringify({ ApiBaseUrl: 'http://policy.local', TelemetryEnabled: false }, null, 2));

process.env.WB_POLICY_PATH = tmp;
const pol = loadPolicy();
if (pol.ApiBaseUrl !== 'http://policy.local') throw new Error('Policy load failed');

process.env.API_BASE_URL = 'http://env.local';
const merged = withEnvOverrides(pol);
if (merged.ApiBaseUrl !== 'http://env.local') throw new Error('Env override failed');

console.log('policy loader OK');
