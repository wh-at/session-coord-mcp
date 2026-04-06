# AGENTS.md

## Session Coordination

本仓库启用了 `session-coord-mcp` 进行多会话并发协作。

在编辑代码前：

1. 调用 `coord_register_session`
2. 检查任务与活跃会话
3. 认领任务和路径
4. 不要静默修改其他会话已独占的范围
5. 共享接口变更必须记录 update 或 decision
6. 提交前执行 `coord_validate_scope`
