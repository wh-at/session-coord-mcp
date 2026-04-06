# Contributing

感谢你关注 `session-coord-mcp`。

作者：凌风

## 开发原则

- 优先保证本地优先和低依赖
- 优先解决并发编码冲突，而不是扩展成泛工作流平台
- 新增工具时先考虑 Claude Code 和 Codex 的使用体验
- 保持工具输入输出稳定、可预测、可脚本化

## 建议流程

1. Fork 仓库并创建功能分支
2. 安装依赖并运行 `npm run build`
3. 修改代码或文档
4. 运行 `npm run check`
5. 提交 PR，说明动机、设计取舍和验证结果

## 文档

如果你修改了工具行为，请同步更新：

- `README.md`
- `docs/tools.md`
- `docs/configuration.md`
