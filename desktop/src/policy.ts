import { existsSync, readFileSync } from 'fs';
import { platform } from 'os';
import { execSync } from 'child_process';

export interface PolicyConfig {
  autoUpdateChannel?: string;
  telemetryEnabled?: boolean;
  apiBaseUrl?: string;
  proxy?: string;
}

export function loadPolicy(): PolicyConfig {
  const plat = platform();
  let cfg: PolicyConfig = {};
  try {
    if (plat === 'win32') {
      try {
        const regOut = execSync('reg query HKLM\\Software\\WorkBuoy').toString();
        if (/autoUpdateChannel/i.test(regOut)) cfg.autoUpdateChannel = 'beta';
      } catch {}
    } else if (plat === 'darwin') {
      const plist = '/Library/Preferences/com.workbuoy.desktop.plist';
      if (existsSync(plist)) {
        // placeholder: parse plist using plutil
        try {
          const val = execSync(`plutil -extract autoUpdateChannel xml1 -o - ${plist}`).toString();
          if (val.includes('beta')) cfg.autoUpdateChannel = 'beta';
        } catch {}
      }
    } else {
      const f = '/etc/workbuoy/policy.json';
      if (existsSync(f)) {
        cfg = { ...cfg, ...JSON.parse(readFileSync(f,'utf8')) };
      }
    }
  } catch {}
  return cfg;
}
