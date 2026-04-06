# session-coord-mcp

🚀 一个面向并发编码场景的 `local-first` MCP Server，用来协调多个 Claude Code、Codex 或其他 MCP 客户端在同一代码仓库中的并行开发。

作者：凌风

## ✨ 你真正得到的是什么

当你同时开多个 AI 编码会话时，真正会把仓库搞乱的，通常不是“模型不够聪明”，而是：

- 不知道谁在改什么
- 多个会话悄悄改到同一片范围
- 一个会话改了接口，另一个会话还在按旧接口实现
- 进度、阻塞、决策都散落在不同聊天窗口里

`session-coord-mcp` 的目标，就是把这些信息收敛到一个项目内共享的协调层里。

## 🧠 你现在期望的使用方式

这个项目现在已经支持更接近“小白一键配置”的使用流：

1. 一键初始化仓库
2. 给你的 AI 编码工具发送一条现成消息
3. Agent 自动完成配置与接入
4. Agent 自动检查团队状态
5. 如果没有团队，先询问你是否创建团队
6. 如果已有一个或多个团队，先询问你加入哪个团队
7. 完成团队选择后，再继续任务认领、路径认领和开发协作

当前版本说明：

- `0.1.0` 的团队是“当前工作区内的开发团队”
- 还没有实现跨仓库共享团队目录
- 跨仓库团队会作为后续版本能力推进

## ⚡ 一键开始

### 1. 安装依赖

```bash
npm install
```

### 2. 构建

```bash
npm run build
```

### 3. 一键为当前仓库生成配置骨架

```bash
npm run init:repo
```

这一步会自动生成：

- `.mcp.json`
- `.codex/config.toml`
- `.session-coord/AGENT_BOOTSTRAP.zh-CN.md`
- `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md`
- `AGENTS.md`

### 4. 给你的 AI 编码工具发送这条消息

把下面这句话直接发给 Claude Code 或 Codex：

> 请先阅读 `.session-coord/ONE_CLICK_MESSAGE.zh-CN.md`，然后严格按其中要求完成配置和开始使用。

或者你也可以直接让 agent 读取：

```text
.session-coord/ONE_CLICK_MESSAGE.zh-CN.md
```

## 🤖 Agent 将如何工作

当 agent 按一键消息执行时，预期流程是：

1. 先读取 `.session-coord/AGENT_BOOTSTRAP.zh-CN.md`
2. 注册当前 session
3. 检查当前仓库的团队状态
4. 如果没有团队，先问你要不要创建团队
5. 如果有一个团队，先问你要不要加入
6. 如果有多个团队，先问你加入哪一个
7. 完成团队选择后，再进入任务和路径协作流程

对应 MCP 工具包括：

- `coord_register_session`
- `coord_onboarding_status`
- `coord_list_teams`
- `coord_create_team`
- `coord_join_team`

## 🛡️ 安全边界

### 本项目默认是本地运行的

`session-coord-mcp` 默认通过本地 `stdio` 运行，状态默认保存在当前项目目录下：

```text
.session-coord/state.db
```

它不会额外把仓库同步到本项目自己的云端后端，因为当前版本根本没有云端后端。

### 但请不要误解成“绝对不会泄露”

下面这些风险仍然存在：

- 你的电脑被攻击
- 你安装了不可信插件、脚本或扩展
- 你把生成的配置改成了连接第三方服务
- Claude Code / Codex 自身连接远程模型服务，数据流遵循对应平台策略

也就是说，`session-coord-mcp` 的安全价值是：

✅ 不额外新增一个远程中转层  
✅ 不额外新增一个托管仓库同步层  
❌ 不能替代你对本机安全和宿主平台数据策略的判断

## 🧩 当前已实现

- 会话注册与心跳
- 团队查询、创建、加入、入组判断
- 任务创建、查询、认领、更新、完成
- 路径范围认领与冲突检查
- 进度更新与决策记录
- 简单上下文搜索
- 基于 Git 的修改范围校验
- 项目内 SQLite 持久化
- 仓库一键初始化与模板生成

## 🧱 设计原则

- `Local-first`：状态存放在项目目录下的 `.session-coord/state.db`
- `Session-aware`：核心对象是“会话”，不是抽象 agent 名称
- `Team-aware`：先确定团队归属，再开始协作
- `Conflict-first`：优先在编辑前发现冲突，而不是在合并时收拾残局
- `Git-aware`：实际修改范围会与已认领范围做校验

## 🛠️ 常用命令

### 启动 MCP Server

```bash
node dist/index.js --workspace-root .
```

### 初始化当前仓库

```bash
node dist/index.js init --target .
```

### 检查仓库初始化情况

```bash
node dist/index.js doctor --target .
```

### 查看版本

```bash
node dist/index.js --version
```

## 🧰 MCP 工具

### 会话与团队

- `coord_register_session`
- `coord_heartbeat`
- `coord_list_sessions`
- `coord_list_teams`
- `coord_create_team`
- `coord_join_team`
- `coord_onboarding_status`

### 任务

- `coord_create_task`
- `coord_list_tasks`
- `coord_claim_task`
- `coord_update_task`
- `coord_complete_task`

### 路径

- `coord_claim_paths`
- `coord_release_paths`
- `coord_check_conflicts`

### 协作上下文

- `coord_post_update`
- `coord_get_updates`
- `coord_record_decision`
- `coord_search_context`

### 校验

- `coord_validate_scope`

## 📚 文档

- [架构说明](./docs/architecture.md)
- [配置说明](./docs/configuration.md)
- [开发说明](./docs/development.md)
- [工具说明](./docs/tools.md)
- [路线图](./docs/roadmap.md)
- [设计初稿](./docs/session-coordination-mcp-design.md)
- [安全说明](./SECURITY.md)
- [发布指南](./docs/publishing.md)
- [English README](./README.en.md)

## 📦 许可证

MIT，见 [LICENSE](./LICENSE)。
