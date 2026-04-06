# Configuration

## 🚀 最推荐的方式

如果你希望“小白几乎不用自己配”，推荐直接：

```bash
npm install
npm run build
npm run init:repo
```

然后把这条消息发给你的 AI 编码工具：

> 请先阅读 `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md`，然后严格按其中要求完成配置和开始使用。

## 🖥️ 运行方式

当前版本是标准本地 `stdio` MCP Server。

```bash
node dist/index.js --workspace-root .
```

## ⚙️ CLI 子命令

### 启动服务

```bash
node dist/index.js
node dist/index.js serve
```

### 初始化仓库

```bash
node dist/index.js init --target .
```

### 检查初始化状态

```bash
node dist/index.js doctor --target .
```

## 🔐 环境变量

- `SESSION_COORD_WORKSPACE_ROOT`
- `SESSION_COORD_DB_PATH`
- `SESSION_COORD_DEFAULT_TTL_MINUTES`
- `SESSION_COORD_OFFLINE_AFTER_MINUTES`
- `SESSION_COORD_UPDATES_LIMIT`

## 🧩 客户端示例

- Claude Code: [examples/claude-code/mcp.json](../examples/claude-code/mcp.json)
- Codex: [examples/codex/config.toml](../examples/codex/config.toml)

不同宿主版本的外层配置格式可能有差异，但 `command`、`args`、`env` 这几个核心字段通常保持一致。

## 👥 团队初始化预期

当 agent 按照一键消息执行时，应该：

1. 注册当前 session
2. 调用 `coord_onboarding_status`
3. 如果没有团队，先问用户是否创建团队
4. 如果已有一个团队，先问用户是否加入
5. 如果已有多个团队，先问用户加入哪个团队
6. 完成团队选择后，再进入后续开发协作

## 🛡️ 安全边界

这个服务默认只在本地运行，不会额外把仓库同步到本项目自己的云端后端。

但如果本机被攻击、执行了不可信脚本、安装了不可信扩展，或者宿主 AI 工具本身连接远程模型服务，仍然可能发生数据泄露。
