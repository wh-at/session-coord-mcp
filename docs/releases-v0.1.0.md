# Release Notes: v0.1.0

## Highlights

- Initial public release of `session-coord-mcp`
- Local-first MCP server for Claude Code, Codex, and similar MCP clients
- Session-aware and team-aware coordination flow
- Task claiming, path claiming, progress updates, and decision tracking
- Repository bootstrap with one-click onboarding templates
- GitHub-ready docs, CI config, tests, and release scaffolding

## Included in v0.1.0

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

## Notes

- The server is local-first and does not introduce its own hosted cloud backend.
- Local-first does not eliminate host-machine or upstream platform risk.
- Team scope in `v0.1.0` is workspace-level, not cross-repository global team management.
