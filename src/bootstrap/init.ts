import fs from "node:fs";
import path from "node:path";

function ensureDirectory(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeIfAllowed(
  filePath: string,
  content: string,
  overwrite: boolean,
  report: { created: string[]; skipped: string[] },
): void {
  if (fs.existsSync(filePath) && !overwrite) {
    report.skipped.push(filePath);
    return;
  }

  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
  report.created.push(filePath);
}

function createClaudeConfig(): string {
  return JSON.stringify(
    {
      mcpServers: {
        "session-coord": {
          command: "node",
          args: ["./dist/index.js", "--workspace-root", "."],
          env: {
            SESSION_COORD_DEFAULT_TTL_MINUTES: "30",
          },
        },
      },
    },
    null,
    2,
  );
}

function createCodexConfig(): string {
  return `[mcp_servers.session_coord]
command = "node"
args = ["./dist/index.js", "--workspace-root", "."]

[mcp_servers.session_coord.env]
SESSION_COORD_DEFAULT_TTL_MINUTES = "30"
`;
}

function createAgentBootstrapPrompt(): string {
  return `# Session Coord Bootstrap Prompt

你正在一个启用了 session-coord-mcp 的共享编码仓库中工作。

请严格按下面顺序执行：

1. 先调用 \`coord_register_session\`
2. 立即调用 \`coord_onboarding_status\`
3. 如果系统没有任何开发团队，必须先询问用户是否创建团队
4. 如果系统已有一个团队，必须先询问用户是否加入该团队
5. 如果系统已有多个团队，必须先询问用户加入哪个团队
6. 在用户明确选择之前，不要擅自创建团队或加入团队
7. 完成团队选择后，再进入任务与路径协作流程

在进入开发流程后，请遵守以下规则：

1. 调用 \`coord_list_tasks\` 和 \`coord_list_sessions\`
2. 如果没有合适任务，先创建任务，再认领任务
3. 编辑前必须先 \`coord_claim_paths\`
4. 如果发现冲突，不要静默继续开发
5. 如果修改共享接口、类型、迁移或配置，请记录 decision 或 update
6. 在完成或准备提交前执行 \`coord_validate_scope\`
7. 完成后释放路径认领

推荐工作节奏：

- 启动：注册会话并完成团队选择
- 开工：认领任务和路径
- 中途：发送 heartbeat 和 progress
- 收尾：validate scope、release paths、complete task

如果仓库里已有其他活跃会话，请优先避开它们的独占范围。
`;
}

function createOneClickMessage(): string {
  return `请帮我为当前仓库启用并开始使用 session-coord-mcp。

要求如下：

1. 先阅读 .session-coord/AGENT_BOOTSTRAP.zh-CN.md
2. 使用 coord_onboarding_status 检查当前仓库是否已经存在开发团队
3. 如果没有团队，先询问我要不要创建团队
4. 如果已有一个或多个团队，先询问我加入哪个团队
5. 完成团队选择后，继续注册当前会话并按协作流程开始工作
6. 之后在整个开发过程中都遵守 session-coord-mcp 的任务认领、路径认领、进度同步和范围校验规则
`;
}

function createRepoGuide(): string {
  return `# 🚀 Session Coordination 已初始化

这个仓库已经准备好接入 \`session-coord-mcp\`。

## 你可以怎么用

### 方式 1：让 AI 直接接管

对 Claude Code 或 Codex 说：

> 请先阅读 \`.session-coord/ONE_CLICK_MESSAGE.zh-CN.md\`，然后严格按其中要求完成配置和开始使用。

### 方式 2：自己手动启动

\`\`\`bash
npm install
npm run build
node dist/index.js --workspace-root .
\`\`\`

## 已生成文件

- \`.mcp.json\`
- \`.codex/config.toml\`
- \`.session-coord/AGENT_BOOTSTRAP.zh-CN.md\`
- \`.session-coord/ONE_CLICK_MESSAGE.zh-CN.md\`

## 安全说明

🛡️ 这个服务默认只在本地运行，不会额外把仓库同步到本项目自带的任何云端服务。

但请明确边界：

- 如果你的电脑被攻击，文件仍可能泄露
- 如果你安装了不可信插件或脚本，仓库仍可能泄露
- 如果 Claude Code / Codex 本身连接远程模型服务，其数据流仍取决于对应平台策略

也就是说，\`session-coord-mcp\` 的意义是“不新增一个远程中转层”，而不是“让所有外部风险消失”。
`;
}

function createAgentsMd(): string {
  return `# AGENTS.md

## Session Coordination

本仓库启用了 \`session-coord-mcp\` 进行多会话并发协作。

在编辑代码前：

1. 调用 \`coord_register_session\`
2. 检查任务与活跃会话
3. 认领任务和路径
4. 不要静默修改其他会话已独占的范围
5. 共享接口变更必须记录 update 或 decision
6. 提交前执行 \`coord_validate_scope\`
`;
}

export function initializeRepository(targetDir: string, overwrite = false) {
  const report = {
    target_dir: path.resolve(targetDir),
    created: [] as string[],
    skipped: [] as string[],
  };

  const sessionCoordDir = path.join(report.target_dir, ".session-coord");
  ensureDirectory(sessionCoordDir);

  writeIfAllowed(
    path.join(report.target_dir, ".mcp.json"),
    `${createClaudeConfig()}\n`,
    overwrite,
    report,
  );
  writeIfAllowed(
    path.join(report.target_dir, ".codex", "config.toml"),
    createCodexConfig(),
    overwrite,
    report,
  );
  writeIfAllowed(
    path.join(sessionCoordDir, "AGENT_BOOTSTRAP.zh-CN.md"),
    createAgentBootstrapPrompt(),
    overwrite,
    report,
  );
  writeIfAllowed(
    path.join(sessionCoordDir, "ONE_CLICK_MESSAGE.zh-CN.md"),
    createOneClickMessage(),
    overwrite,
    report,
  );
  writeIfAllowed(
    path.join(sessionCoordDir, "README.md"),
    createRepoGuide(),
    overwrite,
    report,
  );

  const agentsPath = path.join(report.target_dir, "AGENTS.md");
  if (fs.existsSync(agentsPath) && !overwrite) {
    writeIfAllowed(
      path.join(sessionCoordDir, "AGENTS.session-coord.md"),
      createAgentsMd(),
      overwrite,
      report,
    );
    report.skipped.push(agentsPath);
  } else {
    writeIfAllowed(agentsPath, createAgentsMd(), overwrite, report);
  }

  return {
    ok: true,
    ...report,
    next_steps: [
      "Open the generated .session-coord/AGENT_BOOTSTRAP.zh-CN.md in your agent session.",
      "Or send the generated .session-coord/ONE_CLICK_MESSAGE.zh-CN.md to your coding agent.",
      "Build the project with npm run build.",
      "Start the server or connect it from Claude Code / Codex.",
    ],
  };
}

export function inspectRepositorySetup(targetDir: string) {
  const base = path.resolve(targetDir);
  const files = [
    ".mcp.json",
    ".codex/config.toml",
    ".session-coord/AGENT_BOOTSTRAP.zh-CN.md",
    ".session-coord/ONE_CLICK_MESSAGE.zh-CN.md",
    ".session-coord/README.md",
    "AGENTS.md",
  ];

  return {
    target_dir: base,
    files: files.map((file) => ({
      path: path.join(base, file),
      exists: fs.existsSync(path.join(base, file)),
    })),
  };
}
