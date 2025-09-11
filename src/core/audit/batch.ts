type Entry = { ts: string; msg: string; meta?: any };
const buffer: Entry[] = [];
let FLUSH_MS = Number(process.env.AUDIT_BATCH_MS || 50);
let flushing = false;

function tryRequire<T=any>(m:string):T|null { try { return require(m); } catch { return null; } }
const audit = tryRequire<any>("./index") || tryRequire<any>("../audit");

async function flush() {
  if (flushing || buffer.length === 0) return;
  flushing = true;
  const chunk = buffer.splice(0, buffer.length);
  try {
    for (const e of chunk) {
      await audit?.append?.(e);
    }
  } finally {
    flushing = false;
  }
}

let timer: NodeJS.Timeout | null = null;
function schedule() {
  if (timer) return;
  timer = setTimeout(() => {
    timer = null;
    void flush();
  }, FLUSH_MS);
}

export async function appendBatched(e: Entry) {
  buffer.push(e);
  schedule();
}

export async function flushNow() { await flush(); }

function shutdown() {
  const stop = new Promise<void>((resolve) => {
    const id = setInterval(async () => {
      if (buffer.length === 0 && !flushing) { clearInterval(id); resolve(); }
      else { await flush(); }
    }, 10);
  });
  setTimeout(()=>process.exit(0), 500).unref();
  stop.then(()=>process.exit(0));
}

process.once("SIGTERM", shutdown);
process.once("uncaughtException", shutdown);
