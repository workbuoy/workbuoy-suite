import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

/**
 * @typedef {{ stop: () => Promise<void>, url: string }} BackendRunner
 */

const SPAWN_CMD = process.execPath;
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "../../../..");
const ENTRYPOINT = "apps/backend/src/index.ts";
const SPAWN_ARGS = ["--import", "tsx", ENTRYPOINT];

function createTimeout(ms, onTimeout) {
  let timer;
  const promise = new Promise((resolve) => {
    timer = setTimeout(() => {
      Promise.resolve(onTimeout()).finally(resolve);
    }, ms);
    if (typeof timer?.unref === "function") {
      timer.unref();
    }
  });

  return {
    promise,
    cancel() {
      if (typeof timer !== "undefined") {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Starts the backend on the provided port and waits until /api/health responds.
 * @param {number} [port] Optional port override. Defaults to SMOKE_PORT or 3100.
 * @returns {Promise<BackendRunner>}
 */
export async function startBackend(port) {
  const resolvedPort = Number(port ?? process.env.SMOKE_PORT ?? 3100);
  const env = {
    ...process.env,
    PORT: String(resolvedPort),
    WB_SKIP_OPTIONAL_ROUTES: "1",
    WB_CHAOS_READY: "0",
    FF_PERSISTENCE: process.env.FF_PERSISTENCE ?? "0",
    NODE_ENV: "test",
  };

  const child = spawn(SPAWN_CMD, SPAWN_ARGS, {
    stdio: "inherit",
    env,
    cwd: REPO_ROOT,
  });

  let exitInfo = null;
  child.on("exit", (code, signal) => {
    exitInfo = { code, signal };
  });

  const url = `http://127.0.0.1:${resolvedPort}`;
  const deadline = Date.now() + 25_000;
  let healthy = false;

  while (Date.now() < deadline) {
    if (exitInfo) {
      break;
    }

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 2_000);
    try {
      const response = await fetch(`${url}/api/health`, {
        signal: abortController.signal,
      });
      if (response.ok) {
        healthy = true;
        break;
      }
    } catch (error) {
      // Swallow fetch/abort errors and retry until deadline
    } finally {
      clearTimeout(timeoutId);
    }

    await delay(500);
  }

  if (!healthy) {
    if (exitInfo) {
      throw new Error(
        `Backend process exited before becoming healthy (code=${exitInfo.code}, signal=${exitInfo.signal})`,
      );
    }

    await terminateChild(child);
    throw new Error(`Backend did not become healthy at ${url} within 25s`);
  }

  if (exitInfo) {
    throw new Error(
      `Backend process exited unexpectedly after reporting healthy (code=${exitInfo.code}, signal=${exitInfo.signal})`,
    );
  }

  return {
    url,
    async stop() {
      if (exitInfo) {
        return;
      }

      const waitForExit = new Promise((resolve) => {
        child.once("exit", () => {
          exitInfo = exitInfo ?? { code: child.exitCode, signal: child.signalCode };
          resolve();
        });
      });

      try {
        child.kill("SIGINT");
      } catch (error) {
        // ignore kill errors
      }

      const timeout = createTimeout(2_000, async () => {
        if (!exitInfo) {
          try {
            child.kill("SIGKILL");
          } catch (error) {
            // ignore
          }
        }
      });

      await Promise.race([waitForExit, timeout.promise]);
      timeout.cancel();
    },
  };
}

async function terminateChild(child) {
  const waitForExit = new Promise((resolve) => {
    child.once("exit", () => resolve());
  });

  try {
    child.kill("SIGINT");
  } catch (error) {
    // ignore
  }

  const termTimeout = createTimeout(500, () => {});
  await Promise.race([waitForExit, termTimeout.promise]);
  termTimeout.cancel();

  if (child.exitCode === null && child.signalCode === null) {
    try {
      child.kill("SIGKILL");
    } catch (error) {
      // ignore
    }
    const killTimeout = createTimeout(500, () => {});
    await Promise.race([waitForExit, killTimeout.promise]);
    killTimeout.cancel();
  }
}
