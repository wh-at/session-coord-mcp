import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { createConfig } from "../src/config.js";
import { CoordinationService } from "../src/core/coordination-service.js";
import { createDatabase } from "../src/db/database.js";
import { GitService } from "../src/git/git-service.js";

function createTempWorkspace(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "session-coord-workspace-"));
}

test("onboarding_status asks for team creation when workspace has no teams", () => {
  const workspaceRoot = createTempWorkspace();
  const config = createConfig({
    workspaceRoot,
    dbPath: path.join(workspaceRoot, ".session-coord", "state.db"),
  });

  const service = new CoordinationService(createDatabase(config.dbPath), config, new GitService());
  const registered = service.registerSession({
    agent_name: "codex",
    host_type: "codex",
  });

  const onboarding = service.onboardingStatus({
    session_id: registered.session_id,
  });

  assert.equal(onboarding.state, "no_team_found");
  assert.match(onboarding.prompt_for_user, /create a new team/i);
});

test("onboarding_status reports multiple teams and join flow", () => {
  const workspaceRoot = createTempWorkspace();
  const config = createConfig({
    workspaceRoot,
    dbPath: path.join(workspaceRoot, ".session-coord", "state.db"),
  });

  const service = new CoordinationService(createDatabase(config.dbPath), config, new GitService());
  const registered = service.registerSession({
    agent_name: "claude-code",
    host_type: "claude-code",
  });

  const teamA = service.createTeam({ name: "Core" });
  const teamB = service.createTeam({ name: "Frontend" });

  const onboardingBeforeJoin = service.onboardingStatus({
    session_id: registered.session_id,
  });

  assert.equal(onboardingBeforeJoin.state, "multiple_teams_available");
  assert.equal(onboardingBeforeJoin.teams.length, 2);

  const joined = service.joinTeam({
    session_id: registered.session_id,
    team_id: teamB.team.id,
    member_role: "builder",
  });

  assert.equal(joined.team.id, teamB.team.id);
  assert.equal(joined.session.team_id, teamB.team.id);

  const onboardingAfterJoin = service.onboardingStatus({
    session_id: registered.session_id,
  });

  assert.equal(onboardingAfterJoin.state, "already_joined");
  assert.equal(onboardingAfterJoin.current_team_id, teamB.team.id);
  assert.notEqual(teamA.team.id, teamB.team.id);
});
