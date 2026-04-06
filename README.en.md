# session-coord-mcp

[![CI](https://github.com/wh-at/session-coord-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/wh-at/session-coord-mcp/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/wh-at/session-coord-mcp)](./LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-wh--at%2Fsession--coord--mcp-181717?logo=github)](https://github.com/wh-at/session-coord-mcp)

[English](./README.en.md) | [简体中文](./README.zh-CN.md)

A local-first MCP server for coordinating parallel coding sessions across Claude Code, Codex, and other MCP clients.

Author: Lingfeng

Repository:
https://github.com/wh-at/session-coord-mcp

## What you get

When multiple AI coding sessions work in the same repository, the real failure mode is usually not model quality. It is coordination failure:

- nobody knows who is editing what
- overlapping edits happen silently
- one session changes an interface while another still builds against outdated assumptions
- progress, blockers, and decisions stay trapped in separate chat windows

`session-coord-mcp` is meant to provide a shared coordination layer for that workflow.

## Intended workflow

This project already supports a low-friction onboarding flow:

1. Run one bootstrap command in the repository
2. Send one prepared message to your coding agent
3. Let the agent finish setup
4. Let the agent check team status
5. If no team exists, the agent asks whether to create one
6. If one or more teams exist, the agent asks which team to join
7. After team selection, the session continues with task and path coordination

Current scope note:

- `v0.1.0` teams are workspace-level
- there is no cross-repository global team directory yet
- cross-repository team management is planned for a later version

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Bootstrap the repository

```bash
npm run init:repo
```

This generates:

- `.mcp.json`
- `.codex/config.toml`
- `.session-coord/AGENT_BOOTSTRAP.zh-CN.md`
- `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md`
- `AGENTS.md`

### 4. Send the prepared message to your coding agent

Send this directly to Claude Code or Codex:

> Please read `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md` and follow it strictly to complete setup and start using session-coord-mcp.

Or directly ask the agent to read:

```text
.session-coord/ONE_CLICK_MESSAGE.zh-CN.md
```

## How the agent is expected to work

When the agent follows the one-click message, the expected flow is:

1. Read `.session-coord/AGENT_BOOTSTRAP.zh-CN.md`
2. Register the current session
3. Check the current repository team state
4. If there is no team, ask whether to create one
5. If there is one team, ask whether to join it
6. If there are multiple teams, ask which team to join
7. After team selection, continue with task and path coordination

Relevant MCP tools:

- `coord_register_session`
- `coord_onboarding_status`
- `coord_list_teams`
- `coord_create_team`
- `coord_join_team`

## Security boundary

This project runs locally by default and does not introduce its own hosted cloud backend.

The default state is stored in:

```text
.session-coord/state.db
```

That said, local-first does not mean zero leak risk. Data can still leak if:

- the user's machine is compromised
- the user installs untrusted extensions or scripts
- the generated configuration is changed to point to third-party services
- the host coding tool itself sends context to a remote model provider

In other words:

- this project does not add its own cloud relay layer
- this project does not add its own hosted repository sync layer
- this project cannot replace host-machine security or upstream platform policy

## Currently implemented

- session registration and heartbeat
- team listing, creation, joining, and onboarding status
- task creation, querying, claiming, updating, and completion
- path claiming and conflict checks
- progress updates and decision records
- simple shared context search
- Git-based changed-file scope validation
- local SQLite persistence
- repository bootstrap and template generation

## Design principles

- `Local-first`: state is stored in `.session-coord/state.db`
- `Session-aware`: the core object is a session, not just an abstract agent name
- `Team-aware`: determine team membership before deeper collaboration
- `Conflict-first`: detect scope conflicts before edits instead of cleaning them up later
- `Git-aware`: compare actual Git changes against claimed scope

## Common commands

### Start the MCP server

```bash
node dist/index.js --workspace-root .
```

### Initialize the current repository

```bash
node dist/index.js init --target .
```

### Check repository bootstrap status

```bash
node dist/index.js doctor --target .
```

### Print version

```bash
node dist/index.js --version
```

## MCP tools

### Sessions and teams

- `coord_register_session`
- `coord_heartbeat`
- `coord_list_sessions`
- `coord_list_teams`
- `coord_create_team`
- `coord_join_team`
- `coord_onboarding_status`

### Tasks

- `coord_create_task`
- `coord_list_tasks`
- `coord_claim_task`
- `coord_update_task`
- `coord_complete_task`

### Paths

- `coord_claim_paths`
- `coord_release_paths`
- `coord_check_conflicts`

### Shared context

- `coord_post_update`
- `coord_get_updates`
- `coord_record_decision`
- `coord_search_context`

### Validation

- `coord_validate_scope`

## Documentation

- [Architecture](./docs/architecture.md)
- [Configuration](./docs/configuration.md)
- [Development](./docs/development.md)
- [Tools](./docs/tools.md)
- [Roadmap](./docs/roadmap.md)
- [v0.1.0 Release Copy](./docs/github-release-v0.1.0.md)
- [v0.1.1 Plan](./docs/v0.1.1-plan.md)
- [Initial Design Draft](./docs/session-coordination-mcp-design.md)
- [Security](./SECURITY.md)
- [Publishing Guide](./docs/publishing.md)
- [中文 README](./README.zh-CN.md)

## License

MIT. See [LICENSE](./LICENSE).
