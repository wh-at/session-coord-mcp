# session-coord-mcp

[![CI](https://github.com/LingFeng-Vels/session-coord-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/LingFeng-Vels/session-coord-mcp/actions/workflows/ci.yml)
[![License](https://img.shields.io/github/license/LingFeng-Vels/session-coord-mcp)](./LICENSE)
[![GitHub Repo](https://img.shields.io/badge/GitHub-LingFeng--Vels%2Fsession--coord--mcp-181717?logo=github)](https://github.com/LingFeng-Vels/session-coord-mcp)

A local-first MCP server for coordinating parallel Claude Code, Codex, and other MCP client sessions in one repository.

一个面向并发编码场景的 `local-first` MCP Server，用来协调多个 Claude Code、Codex 或其他 MCP 客户端在同一代码仓库中的并行开发。

## Languages

- [English](./README.en.md)
- [简体中文](./README.zh-CN.md)

## Quick Links

- [English README](./README.en.md)
- [中文 README](./README.zh-CN.md)
- [Architecture](./docs/architecture.md)
- [Configuration](./docs/configuration.md)
- [Tools](./docs/tools.md)
- [Security](./SECURITY.md)
- [Publishing Guide](./docs/publishing.md)

## Highlights

- Local-first coordination state with SQLite
- Team-aware and session-aware AI coding workflow
- Task claiming, path claiming, update feed, and Git scope validation
- One-click repository bootstrap for Claude Code and Codex

## 安全边界

本项目默认只在本地运行，不额外引入自己的云端中转层。  
但这不等于“绝对不会泄露”：如果本机被攻击、安装了不可信插件，或宿主 AI 工具本身连接远程模型服务，仍然存在数据泄露风险。

## Repository

https://github.com/LingFeng-Vels/session-coord-mcp
