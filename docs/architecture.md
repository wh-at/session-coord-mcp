# Architecture

## 概览

`session-coord-mcp` 是一个单进程、项目内本地运行的 MCP Server。

核心组件：

- `MCP Server`
- `CoordinationService`
- `SQLite`
- `GitService`

## 数据流

1. 客户端启动服务
2. 会话调用 `coord_register_session`
3. 服务写入 `sessions`
4. 会话创建或认领任务
5. 会话认领路径范围
6. 会话定期发送心跳和进度
7. 会话结束前验证实际变更是否超出已认领范围

## 关键设计取舍

### 为什么使用 SQLite

- 本地部署简单
- 多会话共享状态足够可靠
- 支持事务，适合路径认领与任务变更
- 无需外部服务

### 为什么保留 Git 校验

很多真实冲突并不是两个会话同一时刻 claim 了同一路径，而是会话开发过程中逐渐偏离了最初范围。`coord_validate_scope` 就是为了补这一层。
