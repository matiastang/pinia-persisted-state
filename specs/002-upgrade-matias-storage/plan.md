# Implementation Plan: 升级 matias-storage 依赖至 0.3.0（v0.3.1）

**Branch**: `002-upgrade-matias-storage` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-upgrade-matias-storage/spec.md`

## Summary

将运行时依赖 `matias-storage` 从 `^0.2.0` 升级到 `^0.3.0`（解析 0.3.0），插件源码预期零修改（API 向后兼容已实测确认）。以 TDD 方式推进：先编写"特殊类型无损持久化往返"与"旧格式数据向后兼容"的行为测试（在 0.2.0 下往返测试失败），再执行依赖升级使测试转绿；随后全量回归既有测试套件（单元/集成/e2e）、验证两条构建链，并在 CHANGELOG 记录 v0.3.1。

## Technical Context

**Language/Version**: TypeScript 5.5（strict）、Vue 3.4、pinia ^2.0.23

**Primary Dependencies**: 运行时：pinia ^2.0.23（不变）、matias-storage ^0.2.0 → **^0.3.0**（本特性唯一依赖变更）；devDependencies 不变

**Storage**: 浏览器 localStorage（经 matias-storage 读写；jsdom 提供测试环境实现）

**Testing**: Vitest（单元/集成，jsdom 环境）+ Playwright（e2e，chromium，对演示工程）；既有 36 例 + 新增行为测试

**Target Platform**: 现代浏览器（库产物 ES/CJS/UMD/IIFE）；CI 运行于 ubuntu-latest

**Project Type**: library（附带 Vue 演示工程）

**Performance Goals**: 不适用（依赖升级，无运行时性能目标；matias-storage 0.3.0 为零依赖包，体积 33.8KB 未压缩）

**Constraints**: 插件公开 API 与配置项零变更；不采用 0.3.0 新特性 API（typed key / guard）重构插件（YAGNI）；构建链（plugin:build / vite build）必须保持通过

**Scale/Scope**: 变更面：`package.json`（1 行）+ `pnpm-lock.yaml`；新增测试文件 1 个（`tests/integration/specialTypesPersistence.spec.ts`）；CHANGELOG 1 个条目；插件源码 `src/plugin/index.ts` 预期零修改

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 检查结果 |
|---|---|
| I. 库优先 | ✅ 升级直接作用于库的运行时依赖；演示工程仅作消费方验证 |
| II. TypeScript 类型安全 | ✅ 0.3.0 自带完整类型声明（types 字段不变）；升级后 `tsc` 类型生成必须零错误（任务中显式验证） |
| III. 构建链完整性 | ✅ 任务包含 plugin:build 与演示工程构建验证；0.3.0 包格式变化（ESM-first、exports.require → index.umd.cjs）已核实与 Vite5/Rollup 解析兼容 |
| IV. 兼容性约束 | ✅ 运行时依赖零新增（仅版本升级）；持久化数据向后兼容已实测（0.2.0 纯 JSON 数据 0.3.0 可读）；普通值序列化格式逐字节不变，特殊类型新增标签属无损增强 |
| V. 简洁与可维护 | ✅ 不引入 0.3.0 新 API，不重构；变更面最小化 |

Phase 1 设计后复查：无违规，无需 Complexity Tracking 记录。

## Project Structure

### Documentation (this feature)

```text
specs/002-upgrade-matias-storage/
├── plan.md              # 本文件
├── research.md          # Phase 0 调研（0.2.0→0.3.0 差异实测、兼容性矩阵）
├── data-model.md        # 持久化数据结构契约（0.3.0 序列化标签格式）
├── quickstart.md        # 升级验证指引
├── contracts/           # 存储层依赖契约
│   └── storage-dependency-contract.md
├── checklists/
│   └── requirements.md  # 规格质量清单
└── tasks.md             # $speckit-tasks 生成
```

### Source Code (repository root)

```text
package.json             # matias-storage ^0.2.0 → ^0.3.0（本特性唯一源码变更）
pnpm-lock.yaml           # pnpm install 同步更新
src/plugin/              # 库源码（预期零修改；API 兼容已核实）
tests/
├── unit/                # 既有单元测试（回归，不改）
├── integration/
│   ├── *.spec.ts        # 既有集成测试（回归，不改）
│   └── specialTypesPersistence.spec.ts  # 新增：特殊类型无损往返 + 旧格式兼容
└── e2e/                 # 既有 Playwright e2e（回归，不改）
CHANGELOG.md             # 新增 [0.3.1] 条目
```

**Structure Decision**: 沿用既有单项目结构（库 + 演示工程 + 分层测试），不新增目录层级；新增测试放入既有 `tests/integration/`，与持久化行为测试同层。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规，不适用。
