import { after } from "node:test";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const PORT = process.env.SMOKE_PORT || "3100";
const BASE = `http://127.0.0.1:${PORT}`;
const BACKEND_ROOT = fileURLToPath(new URL("../..", import.meta.url));

let serverInstance;
let serverProcess;
let bootLog = "";
let cleanupRegistered = false;
let serverReadyPromise;

export async function startServer() {
  if (serverInstance) {
    return serverInstance;
  }

  if (!serverReadyPromise) {
    serverReadyPromise = bootServer();
  }

  return serverReadyPromise;
}

async function bootServer() {
  bootLog = "";
  serverProcess = spawn(
    "npx",
    ["tsx", "src/index.ts"],
    {
      env: {
        ...process.env,
        PORT,
        FF_PERSISTENCE: "0",
        WB_CHAOS_READY: "0",
        WB_SKIP_OPTIONAL_ROUTES: "1",
        NODE_ENV: "test",
      },
      stdio: ["ignore", "pipe", "pipe"],
      cwd: BACKEND_ROOT,
    },
  );

  serverProcess.stdout?.on("data", (chunk) => {
    bootLog += chunk.toString();
  });
  serverProcess.stderr?.on("data", (chunk) => {
    bootLog += chunk.toString();
  });

  const started = await waitForHealthy(`${BASE}/api/health`, 30_000);
  if (!started) {
    stopServer();
    throw new Error(`Backend did not become healthy on ${BASE}. Logs:\n${bootLog}`);
  }

  registerCleanup();

  serverInstance = {
    baseUrl: BASE,
    stop: stopServer,
  };

  return serverInstance;
}

export function stopServer() {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (error) {
      // ignore cleanup errors
    }
    serverProcess = undefined;
    serverInstance = undefined;
  }
  serverReadyPromise = undefined;
}

after(() => {
  stopServer();
});

function registerCleanup() {
  if (cleanupRegistered) {
    return;
  }
  cleanupRegistered = true;
  const cleanup = () => {
    stopServer();
  };
  process.once("exit", cleanup);
  process.once("SIGINT", cleanup);
  process.once("SIGTERM", cleanup);
}

async function waitForHealthy(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        return true;
      }
    } catch (error) {
      // ignore transient errors
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}
