# Session Coordination MCP Design

## 1. Problem Statement

Current coding-agent workflows break down when multiple independent sessions work on the same repository at the same time.

Typical failure modes:

- two sessions edit the same files without knowing it
- one session changes an interface while another session is implementing against the old version
- progress, blockers, and decisions stay trapped inside separate chat histories
- task ownership is unclear, so duplicate work and late integration conflicts appear

The goal of this project is to build a local-first MCP server that lets Claude Code, Codex, and other MCP clients coordinate across separate terminal or editor sessions.

This is not only "multi-agent orchestration inside one chat". It is "multi-session coordination across many chat windows".

## 2. Existing Landscape

Relevant existing projects already cover parts of this problem:

- `agent-hub-mcp`
  - strong on cross-agent messaging, registration, task delegation, and shared history
  - weaker on file-scope ownership and repo-conflict prevention
- `MACP` / `macp-agent-mcp`
  - strongest match to this project direction
  - includes a shared SQLite bus, advisory file claims, shared memory, tasks, goals, and session awareness
  - still broad and protocol-oriented rather than narrowly optimized for code-edit conflict control
- `tick-md`
  - strong on task coordination, dependency tracking, local-first workflows, and Git-backed history
  - less suitable as the authoritative real-time coordination layer for fine-grained path locking
- `Agent-MCP`
  - strong on orchestration, shared memory, and visualization
  - heavier than needed for a practical local coding coordination server
- `BeadHub`
  - productized workflow with worktrees, chat, issue claims, and status visibility
  - useful product reference, but not the local-first open MCP server shape you described

Conclusion:

- this is not an empty space
- there is still room for a focused MCP server specifically for "parallel coding sessions in one repo"
- the most relevant technical reference is MACP
- the most relevant workflow reference is tick-md plus BeadHub

## 3. Product Positioning

Working name: `session-coord-mcp`

Primary promise:

"Before any session edits code, it can discover current ownership, claim a safe scope, understand active dependencies, and broadcast progress without leaving the MCP workflow."

Target users:

- solo developers using multiple Claude Code / Codex windows
- small teams mixing humans and coding agents
- monorepo or multi-package projects where parallel work regularly overlaps

Non-goals for v1:

- replacing Git hosting platforms
- full project management software
- autonomous agent spawning or workflow engines
- semantic code merge resolution

## 4. Core Design Principles

### 4.1 Local-first

The source of truth should live in the project directory, not in a hosted service.

Recommended storage:

- `./.session-coord/state.db` as authoritative state
- SQLite in WAL mode
- optional exported snapshots such as `./.session-coord/board.json`

Why SQLite:

- safe concurrent access from many local processes
- transactions for claims and task updates
- simple deployment
- fast enough for frequent polling and heartbeats

### 4.2 Advisory plus enforceable workflow

The server cannot physically stop a user from editing files in another terminal, but it can make the safe path obvious and machine-checkable.

So the system should combine:

- advisory path claims
- task ownership
- git-based validation
- stale-lock cleanup
- explicit handoff flow

### 4.3 Session-aware, not just agent-aware

The key identity should be a session in a workspace, not an abstract agent name.

Each session should carry:

- `session_id`
- `agent_name`
- `host_type` such as `claude-code` or `codex`
- `workspace_root`
- `worktree_path`
- `branch`
- `role`
- `last_heartbeat_at`

### 4.4 Conflict prevention before editing

The system should optimize for pre-conflict prevention, not post-conflict cleanup.

That means:

- claim task first
- claim paths second
- validate current ownership before editing
- post decision notes when changing shared interfaces

## 5. Architecture

## 5.1 High-level components

1. MCP Server
   - built with the official `@modelcontextprotocol/sdk`
   - supports `stdio` first
   - optional `Streamable HTTP` later for dashboard or remote observers

2. Coordination Core
   - owns SQLite access
   - applies business rules for claims, tasks, heartbeats, and conflict checks

3. Git Integration Layer
   - reads repo root, branch, worktree path, changed files, and diff summaries
   - validates whether actual edits stayed within the claimed scope

4. Event Feed
   - stores progress notes, blockers, handoffs, and decisions
   - supports polling by sessions

5. Optional Dashboard
   - read-only web UI for active sessions, locks, tasks, and conflict alerts

## 5.2 Suggested filesystem layout

```text
.session-coord/
  state.db
  board.json
  config.json
  logs/
  snapshots/
```

## 5.3 Deployment model

For v1, keep it simple:

- one server instance per project
- every Claude Code / Codex session points at the same project-local database
- no external broker
- no cloud dependency

## 6. Data Model

Recommended core tables:

### `workspaces`

- `id`
- `root_path`
- `repo_name`
- `created_at`

### `sessions`

- `id`
- `workspace_id`
- `agent_name`
- `host_type`
- `role`
- `worktree_path`
- `branch`
- `status` (`active`, `idle`, `blocked`, `offline`)
- `started_at`
- `last_heartbeat_at`
- `metadata_json`

### `tasks`

- `id`
- `workspace_id`
- `title`
- `description`
- `status` (`todo`, `claimed`, `in_progress`, `blocked`, `done`, `cancelled`)
- `priority`
- `owner_session_id`
- `parent_task_id`
- `depends_on_json`
- `planned_paths_json`
- `labels_json`
- `created_at`
- `updated_at`

### `path_claims`

- `id`
- `workspace_id`
- `task_id`
- `session_id`
- `path_pattern`
- `claim_mode` (`exclusive`, `shared`, `review-only`)
- `reason`
- `expires_at`
- `created_at`

### `updates`

- `id`
- `workspace_id`
- `session_id`
- `task_id`
- `kind` (`progress`, `blocker`, `decision`, `handoff`, `warning`)
- `message`
- `details_json`
- `created_at`

### `decisions`

- `id`
- `workspace_id`
- `scope_key`
- `title`
- `summary`
- `details`
- `created_by_session_id`
- `created_at`

### `handoffs`

- `id`
- `workspace_id`
- `from_session_id`
- `to_session_id`
- `task_id`
- `status` (`open`, `accepted`, `closed`)
- `summary`
- `acceptance_criteria`
- `created_at`

## 7. MCP Tool Surface

Keep the tool set small and opinionated in v1.

### 7.1 Session tools

#### `coord_register_session`

Input:

- `agent_name`
- `host_type`
- `role`
- `workspace_root`
- `worktree_path`
- `branch`

Output:

- `session_id`
- current workspace summary
- active warnings
- suggested next actions

#### `coord_heartbeat`

Input:

- `session_id`
- optional `status`
- optional `current_task_id`

Output:

- heartbeat accepted
- stale items detected

#### `coord_list_sessions`

Returns active sessions with role, task, branch, worktree, and freshness.

### 7.2 Task tools

#### `coord_create_task`

Input:

- `title`
- `description`
- `priority`
- `planned_paths`
- `depends_on`
- optional `owner_session_id`

#### `coord_list_tasks`

Supports filters:

- `status`
- `owner_session_id`
- `label`
- `path`

#### `coord_claim_task`

Input:

- `task_id`
- `session_id`

Rules:

- fail if another session owns it exclusively
- allow override only with explicit `force_reason`

#### `coord_update_task`

Supports:

- status changes
- planned path updates
- blocker notes
- acceptance criteria

#### `coord_complete_task`

Completes the task, releases related claims if requested, and creates a completion update.

### 7.3 Path ownership tools

#### `coord_claim_paths`

Input:

- `session_id`
- `task_id`
- `paths`
- `claim_mode`
- `ttl_minutes`
- `reason`

Behavior:

- detects overlapping claims
- returns conflicts with owner session, task, and expiry
- supports dry-run mode

#### `coord_release_paths`

Releases selected claims early.

#### `coord_check_conflicts`

Input:

- `paths`
- optional `session_id`

Returns:

- matching claims
- active owners
- related tasks
- recent decisions for those paths

### 7.4 Communication and context tools

#### `coord_post_update`

Input:

- `session_id`
- `task_id`
- `kind`
- `message`
- optional `details`

Used for:

- progress notes
- blockers
- interface changes
- requests for help

#### `coord_get_updates`

Supports filters:

- `since`
- `kind`
- `session_id`
- `task_id`
- `paths`

#### `coord_record_decision`

Stores architecture or interface changes that other sessions need to see.

#### `coord_search_context`

Searches tasks, updates, decisions, and current claims.

### 7.5 Validation tools

#### `coord_validate_scope`

Input:

- `session_id`
- optional `git_diff_base`

Returns:

- actual changed paths
- whether they are inside claimed paths
- warnings for unclaimed edits
- recommended remediation

This tool is important. It turns the coordination layer from "chatty memory" into something that can actually reduce repo chaos.

## 8. Required Workflow Contract

The MCP server alone will not solve the problem if client behavior is inconsistent.

Every session should follow the same contract:

1. register on startup
2. inspect active tasks, sessions, and claimed paths
3. claim or create a task before editing
4. claim relevant paths before editing
5. send heartbeat periodically
6. post updates when blocked, when changing interfaces, and when finishing major milestones
7. validate actual edits against claimed scope before handoff or merge
8. release claims when done

Recommended host instructions:

- "Before editing any file, call the coordination MCP to check or claim scope."
- "If scope conflicts exist, do not proceed silently."
- "If you change a shared interface, record a decision note and notify related sessions."

This workflow convention matters as much as the server implementation.

## 9. Conflict-Control Strategy

This is the core of the product.

### 9.1 Path claims with TTL

Claims should expire automatically if a session disappears.

Rules:

- default TTL: 30 minutes
- heartbeat extends TTL
- stale claims become reclaimable

### 9.2 Claim modes

- `exclusive`
  - one session owns active edits for the path
- `shared`
  - multiple sessions may read or coordinate within the path
- `review-only`
  - session is observing or reviewing, not editing

### 9.3 Planned paths plus actual edits

A task should declare its intended paths. Later, `coord_validate_scope` compares Git changes against those claims.

This catches the common failure mode:

- session starts in `apps/web`
- touches `packages/api-types`
- silently breaks another session

### 9.4 Interface boundaries

Not every conflict is a same-file conflict.

Many real conflicts happen at:

- API schemas
- TypeScript shared types
- component props
- database migrations
- environment variables

So the system should support "decision notes" and "shared boundary paths" such as:

- `packages/contracts/**`
- `db/migrations/**`
- `openapi.yaml`

Changes in those areas should always trigger an update event.

### 9.5 Worktree support

For sessions that use separate Git worktrees, store:

- worktree path
- branch name

This improves visibility and makes coordination safer.

Later, the server can add:

- `coord_create_worktree`
- `coord_assign_branch_name`

But this is optional for v1.

## 10. Recommended Implementation Stack

Recommended v1 stack:

- TypeScript
- Node.js
- `@modelcontextprotocol/sdk`
- `better-sqlite3` or `sqlite3` with a thin repository layer
- `simple-git` or direct Git CLI calls for repo inspection
- `zod` for tool schemas

Why this stack:

- fastest path to a practical MCP server
- easiest compatibility with Claude Code and Codex local MCP configs
- clean JSON schema generation for tool inputs

## 11. MVP Scope

If you try to build the whole vision at once, the project will get heavy fast.

MVP should include only:

- session registration
- heartbeat
- task CRUD
- path claim and release
- progress updates
- recent updates feed
- context search
- scope validation from Git status or diff

Do not build yet:

- dashboard UI
- semantic embeddings
- autonomous coordination planner
- remote multi-user auth
- branch automation

## 12. Suggested Build Order

### Phase 1: Core state and MCP shell

- initialize MCP server
- add SQLite schema migration system
- implement `coord_register_session`
- implement `coord_heartbeat`
- implement `coord_list_sessions`

### Phase 2: Task coordination

- implement task tables and indexes
- add task create, list, claim, update, complete
- add dependency storage

### Phase 3: Path claims

- implement overlap detection
- implement TTL handling
- implement claim release
- implement conflict query

### Phase 4: Updates and decisions

- add update feed
- add decision recording
- add path-aware update search

### Phase 5: Git validation

- read changed files from `git status --porcelain` and `git diff --name-only`
- map changes to claims
- emit warnings for out-of-scope edits

### Phase 6: Client ergonomics

- write startup instructions for Claude Code
- write startup instructions for Codex
- add suggested prompts / slash-command equivalents

## 13. Compatibility Strategy for Claude Code and Codex

Both clients can talk to MCP servers, but safe collaboration depends on behavior shaping.

So provide:

1. the MCP server
2. a short bootstrap prompt for each host
3. a standard session lifecycle

Example behavioral instruction:

"You are part of a shared coding workspace. Before editing, check active tasks and path claims. Claim your intended scope first. If another session owns the scope, coordinate through updates or ask for reassignment."

Without this layer, the tools will exist but usage will remain inconsistent.

## 14. Recommended Differentiators

To stand out from existing tools, focus on these three differentiators:

### 14.1 Repo-safe coordination

Not just tasks and chat. Actual path ownership plus Git validation.

### 14.2 Cross-session coding workflow

Optimized for many independent chat windows, not only a centralized orchestrator.

### 14.3 Local-first operations

No hosted dependency, no external broker, no required web app.

## 15. Risks

### Risk: agents ignore the coordination workflow

Mitigation:

- make tools small and obvious
- provide startup instructions
- add validation tools that expose drift

### Risk: path locks are too coarse

Mitigation:

- support globs
- allow shared claims
- let tasks declare planned paths separately from active locks

### Risk: path locks are too fine

Mitigation:

- claim by directory or boundary file first
- add decision notes for shared interfaces

### Risk: SQLite contention

Mitigation:

- use WAL mode
- keep writes short
- use indexes on active claims and active sessions

## 16. Best Strategic Choice

If the goal is fastest validation:

- study MACP closely
- copy the useful ideas: shared SQLite bus, session awareness, file claims, shared memory
- build a narrower developer-focused MCP instead of a generic protocol layer

If the goal is fastest shipping:

- build the MVP above
- defer protocol generalization
- optimize for actual Claude Code and Codex behavior in one repo

## 17. First Release Definition

Version `0.1.0` is successful if:

- two or more sessions can register into the same workspace
- each session can see who is working on what
- path claim conflicts are visible before edits
- sessions can publish progress and blockers
- a session can validate whether it edited outside its claimed scope

At that point, the system already solves the biggest source of chaos in parallel AI-assisted development.
