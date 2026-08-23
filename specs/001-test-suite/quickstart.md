# Quickstart: 运行测试

**Date**: 2026-08-23

## 前置

```sh
pnpm install                    # 安装依赖（含测试工具链）
pnpm exec playwright install chromium   # 首次运行 e2e 前安装浏览器
```

## 运行

```sh
pnpm run typecheck        # TS 类型检查（tsc --noEmit）
pnpm test                 # 单元 + 集成测试（Vitest，一次运行）
pnpm run test:coverage    # 同上，附带覆盖率报告
pnpm run test:e2e         # 端到端测试（自动启动演示工程 dev server）
```

一键全量（与 CI 相同顺序）：

```sh
pnpm run typecheck && pnpm run plugin:build && pnpm test && pnpm run test:e2e
```

## 产出位置

- 覆盖率报告: `coverage/`
- Playwright 报告: `playwright-report/`（失败时 `pnpm exec playwright show-report`）
