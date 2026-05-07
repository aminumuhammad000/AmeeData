/**
 * Robust, production-ready .env loader for Node.js/TypeScript (ESM & CJS compatible)
 * Loads .env only in development, logs status, and fails gracefully if missing.
 *
 * Usage: import and call loadEnv(logger?) at the top of your config or entrypoint.
 */

// Dynamic import/require for ESM/CJS compatibility
function getDotenv() {
  try {
    // Try require first (CJS)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("dotenv");
  } catch (e) {
    // Try dynamic import (ESM)
    try {
      return import("dotenv");
    } catch (e2) {
      return null;
    }
  }
}

/**
 * Loads .env only if NODE_ENV !== 'production'. Logs status. Fails gracefully if .env missing.
 * @param logger Optional logger (e.g., winston). Falls back to console if not provided.
 */
export async function loadEnv(logger?: { info: Function; warn: Function; error: Function }) {
  const log = logger || console;
  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    log.info?.("[env] Production mode: Skipping .env loading.");
    return;
  }
  let dotenv: any;
  try {
    dotenv = getDotenv();
    if (dotenv && typeof dotenv.then === "function") {
      // ESM dynamic import returns a promise
      dotenv = await dotenv;
    }
  } catch (e) {
    log.warn?.("[env] dotenv package not found. Skipping .env loading.");
    return;
  }
  if (!dotenv || !dotenv.config) {
    log.warn?.("[env] dotenv package not available. Skipping .env loading.");
    return;
  }
  try {
    const result = dotenv.config();
    if (result && result.error) {
      if (result.error.code === "ENOENT") {
        log.warn?.("[env] .env file not found. Skipping .env loading.");
      } else {
        log.error?.("[env] Error loading .env:", result.error);
      }
    } else {
      log.info?.("[env] .env loaded successfully.");
    }
  } catch (e: any) {
    log.error?.("[env] Exception during .env loading:", e);
  }
}