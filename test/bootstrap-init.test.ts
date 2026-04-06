import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { initializeRepository, inspectRepositorySetup } from "../src/bootstrap/init.js";

test("initializeRepository creates one-click bootstrap files", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "session-coord-init-"));

  const result = initializeRepository(tempDir, false);
  const inspection = inspectRepositorySetup(tempDir);

  assert.equal(result.ok, true);
  assert.ok(result.created.some((file) => file.endsWith(".mcp.json")));
  assert.ok(
    inspection.files.every((file) => file.exists),
    "expected init to create all onboarding files",
  );

  const oneClickPath = path.join(tempDir, ".session-coord", "ONE_CLICK_MESSAGE.zh-CN.md");
  const oneClickMessage = fs.readFileSync(oneClickPath, "utf8");
  assert.match(oneClickMessage, /coord_onboarding_status/);
  assert.match(oneClickMessage, /加入哪个团队/);
});
