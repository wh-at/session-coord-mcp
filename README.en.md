# session-coord-mcp

A local-first MCP server for coordinating parallel coding sessions across Claude Code, Codex, and other MCP clients.

Author: Lingfeng

## What it solves

- Multiple AI coding sessions editing the same repo without visibility
- Interface changes happening in one chat while another chat still works on outdated assumptions
- Progress, blockers, and decisions being trapped in separate chat windows

## Intended workflow

1. Run one bootstrap command in the repository
2. Send one prepared message to your coding agent
3. Let the agent finish setup
4. Let the agent check team status
5. If no team exists, the agent asks whether to create one
6. If one or more teams exist, the agent asks which team to join
7. After team selection, the session continues with task and path coordination

## Security boundary

This project runs locally by default and does not introduce its own hosted cloud backend.

That said, local-first does not mean zero leak risk. Data can still leak if:

- the user's machine is compromised
- the user installs untrusted extensions or scripts
- the host coding tool itself sends context to a remote model provider

## Quick start

```bash
npm install
npm run build
npm run init:repo
```

Then send this to your coding agent:

> Please read `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md` and follow it strictly to complete setup and start using session-coord-mcp.
