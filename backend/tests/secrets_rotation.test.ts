import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { getSecret } from '../src/security/secrets';

describe('Secrets rotation', () => {
  const dir = path.join(process.cwd(), '.secrets');
  const file = path.join(dir, 'secrets.json');
  beforeAll(()=>{
    mkdirSync(dir, { recursive: true });
    process.env.SECRET_FILE = file;
  });

  it('reads secret from file and reflects rotation', async () => {
    writeFileSync(file, JSON.stringify({ FOO: 'v1' }));
    const s1 = getSecret('FOO');
    expect(s1).toBe('v1');
    // rotate
    await new Promise(r=>setTimeout(r, 10));
    writeFileSync(file, JSON.stringify({ FOO: 'v2' }));
    const s2 = getSecret('FOO');
    expect(s2).toBe('v2');
  });
});
