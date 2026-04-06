import path from "node:path";

import type { ServerConfig } from "./types.js";

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export interface CliOptions {
  workspaceRoot?: string;
  dbPath?: string;
  defaultTtlMinutes?: number;
  offlineAfterMinutes?: number;
  updatesLimit?: number;
}

export function createConfig(cliOptions: CliOptions): ServerConfig {
  const workspaceRoot = path.resolve(
    cliOptions.workspaceRoot ??
      process.env.SESSION_COORD_WORKSPACE_ROOT ??
      process.cwd(),
  );

  const dbPath = path.resolve(
    cliOptions.dbPath ??
      process.env.SESSION_COORD_DB_PATH ??
      path.join(workspaceRoot, ".session-coord", "state.db"),
  );

  return {
    workspaceRoot,
    dbPath,
    defaultTtlMinutes:
      cliOptions.defaultTtlMinutes ??
      readNumber(process.env.SESSION_COORD_DEFAULT_TTL_MINUTES, 30),
    offlineAfterMinutes:
      cliOptions.offlineAfterMinutes ??
      readNumber(process.env.SESSION_COORD_OFFLINE_AFTER_MINUTES, 60),
    updatesLimit:
      cliOptions.updatesLimit ??
      readNumber(process.env.SESSION_COORD_UPDATES_LIMIT, 50),
  };
}
