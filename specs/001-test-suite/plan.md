# Implementation Plan: 完整测试套件（v0.3.0）

**Branch**: `001-test-suite` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-test-suite/spec.md`

## Summary

为 `matias-pinia-persisted-state` 插件建立分层测试体系：以 Vitest（jsdom 环境）覆盖插件核心逻辑的单元与集成/Use Case 测试，以 Playwright 在真实浏览器中验证演示工程的"修改 → 持久化 → 刷新 → 恢复"端到端旅程，并配置 GitHub Actions CI 在 master 推送与 PR 时自动执行类型检查、构建与全部测试。测试中发现的插件缺陷按"一功能一 commit"修复并附回归测试。同时建立 CHANGELOG.md 版本更新说明。

## Technical Context

**Language/Version**: TypeScript 5.5（strict）、Vue 3.4、pinia 2.1.7

**Primary Dependencies**: 运行时不变（pinia ^2.0.23、matias-storage ^0.2.0）；新增均为 devDependencies：vitest、jsdom、@vue/test-utils、@vitest/coverage-v8、@playwright/test

**Storage**: 浏览器 localStorage（经 matias-storage 读写；jsdom 提供测试环境实现）

**Testing**: Vitest（单元/集成，jsdom 环境）+ Playwright（e2e，chromium，对演示工程）

**Target Platform**: 现代浏览器（库产物 ES/CJS/UMD/IIFE）；CI 运行于 ubuntu-latest

**Project Type**: library（附带 Vue 演示工程）

**Performance Goals**: 不适用（本版本为质量保障，无运行时性能目标；测试套件本地全量运行 < 1 分钟，不含浏览器安装）

**Constraints**: 不改变插件运行时行为与公开 API；不新增运行时依赖；构建链（plugin:build / vite build）必须保持通过

**Scale/Scope**: 被测核心 `src/plugin/index.ts`（约 210 行）；测试文件预计 6-8 个，用例预计 40+

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 检查结果 |
|---|---|
| I. 库优先 | ✅ 测试对象为 `src/plugin` 库；演示工程仅作为 e2e 载体，不反向依赖 |
| II. TypeScript 类型安全 | ✅ 测试全部用 TS 编写；CI 增加 `tsc --noEmit` 类型检查门禁 |
| III. 构建链完整性 | ✅ CI 执行 plugin:build；不引入 debugger/调试日志 |
| IV. 兼容性约束 | ✅ 运行时依赖零变更；新增依赖全部为 devDependencies 且必要（测试基建） |
| V. 简洁与可维护 | ✅ 无多余配置；husky/commitlint/Issue 模板/README 双语明确移出本版本范围 |

Phase 1 设计后复查：无违规，无需 Complexity Tracking 记录。

## Project Structure

### Documentation (this feature)

```text
specs/001-test-suite/
├── plan.md              # 本文件
├── research.md          # Phase 0 调研（依赖选型、关键行为确认）
├── data-model.md        # 持久化数据结构契约
├── quickstart.md        # 测试运行指引
├── contracts/           # 公开 API 行为契约
│   └── api-contract.md
└── tasks.md             # $speckit-tasks 生成
```

### Source Code (repository root)

```text
src/plugin/              # 库源码（被测对象，本版本除缺陷修复外不改）
tests/
├── unit/                # 单元测试：配置项、恢复逻辑分支、空 id 守卫、customFilterKey
│   ├── persistedConfig.spec.ts
│   ├── localStateDiff.spec.ts
│   └── customProperties.spec.ts
├── integration/         # 集成 / Use Case：真实 createPinia + 插件 + 多 store + 组件挂载
│   ├── persistence.spec.ts
│   ├── multiStore.spec.ts
│   └── componentUsage.spec.ts
└── e2e/                 # Playwright：真实浏览器对演示工程
    └── demo-persistence.spec.ts
vitest.config.ts         # jsdom 环境，include tests/unit + tests/integration
playwright.config.ts     # webServer 启动 pnpm dev (port 3002)，testDir tests/e2e
.github/workflows/ci.yml # master push + PR：install → typecheck → build → test → e2e
CHANGELOG.md             # 版本更新说明（含历史版本与 0.3.0）
```

**Structure Decision**: 单项目结构（库 + 演示工程同仓），测试集中于根 `tests/` 并按单元/集成/e2e 分层，与 Vite/Vitest/Playwright 的默认发现规则一致，不引入 monorepo 复杂度。

## Complexity Tracking

> 无 Constitution 违规，无需记录。
