# session-coord-mcp v0.1.0

🚀 Initial public release of `session-coord-mcp`.

`session-coord-mcp` is a local-first MCP server designed for parallel coding workflows across Claude Code, Codex, and similar MCP clients.

## ✨ Highlights

- Local-first shared coordination state with SQLite
- Session-aware workflow for multi-window AI coding
- Team onboarding flow for create-or-join decisions
- Task claiming and path claiming to reduce edit conflicts
- Progress updates and decision tracking across sessions
- Repository bootstrap for one-click setup with prepared agent prompts

## 🧠 What It Solves

When multiple AI coding sessions work on the same repository, things become messy quickly:

- nobody knows who is editing what
- overlapping file changes happen silently
- one session changes an interface while another still implements against the old version
- progress and blockers stay trapped in separate chat windows

This release establishes the first working coordination layer for that workflow.

## 📦 Included In v0.1.0

- `coord_register_session`
- `coord_heartbeat`
- `coord_list_sessions`
- `coord_list_teams`
- `coord_create_team`
- `coord_join_team`
- `coord_onboarding_status`
- `coord_create_task`
- `coord_list_tasks`
- `coord_claim_task`
- `coord_update_task`
- `coord_complete_task`
- `coord_claim_paths`
- `coord_release_paths`
- `coord_check_conflicts`
- `coord_post_update`
- `coord_get_updates`
- `coord_record_decision`
- `coord_search_context`
- `coord_validate_scope`

## ⚡ Quick Start

```bash
npm install
npm run build
npm run init:repo
```

Then send this to your coding agent:

> 请先阅读 `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md`，然后严格按其中要求完成配置和开始使用。

## 🛡️ Security Boundary

This project runs locally by default and does not introduce its own hosted cloud backend.

That said, local-first does not eliminate all leak risk:

- if the user's machine is compromised, repository data can still leak
- if untrusted extensions or scripts are installed, repository data can still leak
- if the host coding tool itself sends context to a remote model provider, that upstream policy still applies

## 🗺️ Notes

- Team scope in `v0.1.0` is workspace-level
- Cross-repository team management is planned for a later release
- GitHub Actions may require repository billing or plan activation depending on the account state
