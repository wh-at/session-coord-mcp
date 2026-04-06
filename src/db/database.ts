import fs from "node:fs";
import path from "node:path";

import BetterSqlite3, { type Database as BetterSqliteDatabase } from "better-sqlite3";

const migrations = [
  `
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      root_path TEXT NOT NULL UNIQUE,
      repo_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      host_type TEXT NOT NULL,
      role TEXT,
      worktree_path TEXT NOT NULL,
      branch TEXT,
      status TEXT NOT NULL,
      current_task_id TEXT,
      started_at TEXT NOT NULL,
      last_heartbeat_at TEXT NOT NULL,
      metadata_json TEXT,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      owner_session_id TEXT,
      parent_task_id TEXT,
      depends_on_json TEXT NOT NULL,
      planned_paths_json TEXT NOT NULL,
      labels_json TEXT NOT NULL,
      acceptance_criteria TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY (owner_session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS path_claims (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      task_id TEXT,
      session_id TEXT NOT NULL,
      path_pattern TEXT NOT NULL,
      claim_mode TEXT NOT NULL,
      reason TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE TABLE IF NOT EXISTS updates (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      task_id TEXT,
      kind TEXT NOT NULL,
      message TEXT NOT NULL,
      details_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      scope_key TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      details TEXT,
      created_by_session_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY (created_by_session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_workspace ON sessions(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_last_heartbeat ON sessions(last_heartbeat_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_workspace_status ON tasks(workspace_id, status);
    CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_session_id);
    CREATE INDEX IF NOT EXISTS idx_claims_workspace_session ON path_claims(workspace_id, session_id);
    CREATE INDEX IF NOT EXISTS idx_claims_expires_at ON path_claims(expires_at);
    CREATE INDEX IF NOT EXISTS idx_updates_workspace_created ON updates(workspace_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_decisions_workspace_created ON decisions(workspace_id, created_at);
  `,
  `
    ALTER TABLE sessions ADD COLUMN team_id TEXT;

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
    );

    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      workspace_id TEXT NOT NULL,
      team_id TEXT NOT NULL,
      session_id TEXT NOT NULL,
      member_role TEXT,
      joined_at TEXT NOT NULL,
      FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (session_id) REFERENCES sessions(id)
    );

    CREATE INDEX IF NOT EXISTS idx_teams_workspace ON teams(workspace_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_session ON team_members(session_id);
  `,
];

export function createDatabase(dbPath: string): BetterSqliteDatabase {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new BetterSqlite3(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const currentVersion = Number(db.pragma("user_version", { simple: true }) ?? 0);

  for (let index = currentVersion; index < migrations.length; index += 1) {
    try {
      db.exec(migrations[index]);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        !message.includes("duplicate column name") &&
        !message.includes("already exists")
      ) {
        throw error;
      }
    }
    db.pragma(`user_version = ${index + 1}`);
  }

  return db;
}
