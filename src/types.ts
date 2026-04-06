export type SessionStatus = "active" | "idle" | "blocked" | "offline";
export type TaskStatus =
  | "todo"
  | "claimed"
  | "in_progress"
  | "blocked"
  | "done"
  | "cancelled";
export type ClaimMode = "exclusive" | "shared" | "review-only";
export type UpdateKind =
  | "progress"
  | "blocker"
  | "decision"
  | "handoff"
  | "warning";

export interface ServerConfig {
  workspaceRoot: string;
  dbPath: string;
  defaultTtlMinutes: number;
  offlineAfterMinutes: number;
  updatesLimit: number;
}
