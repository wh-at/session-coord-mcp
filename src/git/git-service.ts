import { execFileSync } from "node:child_process";

function runGit(args: string[], cwd: string): string {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export class GitService {
  getCurrentBranch(cwd: string): string | null {
    try {
      const branch = runGit(["branch", "--show-current"], cwd);
      return branch || null;
    } catch {
      return null;
    }
  }

  listChangedFiles(cwd: string, diffBase?: string | null): string[] {
    try {
      const diffFiles = diffBase
        ? runGit(["diff", "--name-only", diffBase], cwd)
        : runGit(["diff", "--name-only"], cwd);

      const statusFiles = runGit(["status", "--porcelain"], cwd)
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => line.slice(3).trim());

      return [...new Set([...diffFiles.split(/\r?\n/), ...statusFiles].filter(Boolean))];
    } catch {
      return [];
    }
  }
}
