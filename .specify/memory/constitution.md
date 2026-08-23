# pinia-persisted-state Constitution

## Core Principles

### I. 库优先（Library-First）

`src/plugin/` 是发布到 npm 的库本体，是项目的核心交付物；`src/` 其余部分（Vue 演示工程）只用于验证和演示库能力。所有新功能必须先从库的视角设计 API（导出、类型、配置项），演示工程只做消费方验证。库代码不得依赖演示工程代码。

### II. TypeScript 类型安全（NON-NEGOTIABLE）

库对外导出的所有 API 必须有完整的类型声明，配置项通过 interface 约束并附带 JSDoc 注释。构建链中 `tsc` 类型生成（`ts:build`）必须零错误通过。禁止 `any` 泄漏到公共 API。

### III. 构建链完整性

`pnpm run plugin:build`（类型生成 → Vite 库打包 → 类型拷贝）和演示工程 `vite build` 必须始终可成功执行。发布产物只包含 `dist/`（由 `files` 字段白名单控制），产物中禁止包含 `debugger` 语句和调试日志。

### IV. 兼容性约束

- 运行时依赖仅 `pinia`（^2.0）与 `matias-storage`，新增依赖须谨慎评估必要性
- 产物格式保持 ES / CJS / UMD / IIFE 四种
- 对外行为变更（配置项、存储数据结构）视为破坏性变更，需升主版本或明确说明迁移方式
- localStorage 中已持久化数据的结构变更必须做向后兼容处理（参考 `_localStateDiff` 的差异合并机制）

### V. 简洁与可维护

遵循 YAGNI：不引入当前不需要的功能和依赖。代码注释风格与现有代码保持一致（中文注释、JSDoc）。工具链保持最小化，删除不再使用的配置和依赖。

## 技术栈与工具

- 语言：TypeScript（strict）
- 包管理：pnpm（前端/库）；uv（SpecKit specify CLI 的安装与版本管理）
- 构建：Vite 5（`vite.config.ts` 演示工程 / `vite.build.config.ts` 库打包）
- 版本与发布：`npm version` + `npm publish`，tag 与版本号对应（`vX.Y.Z`）
- 分支：`master` 稳定分支，`dev/tdy` 开发分支

## 开发工作流（Spec-Driven）

使用 GitHub Spec Kit 管理迭代，流程：constitution（已有）→ specify（写规格）→ clarify（可选，澄清）→ plan（技术方案）→ tasks（任务拆解）→ analyze（可选，一致性检查）→ implement（实现）→ converge（收敛检查）。规格与计划产物存放在 `specs/` 目录并提交到 git。

提交规范：`<type>: - <描述>`，type 取 feat / fix / chore / docs / refactor；一个功能点一个 commit，不混合多个功能。

## Governance

- 本 constitution 是所有后续开发决策的最高依据，与代码现状冲突时先修订 constitution
- 修改 constitution 需说明理由并更新 Last Amended 日期
- implement 阶段产生的偏差必须回流到 specs（Evolving Specs），保证规格与实现收敛

**Version**: 1.0.0 | **Ratified**: 2026-08-23 | **Last Amended**: 2026-08-23
