# Tasks: 完整测试套件（v0.3.0）

**Input**: Design documents from `/specs/001-test-suite/`

**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-contract.md ✅

**Organization**: 按 User Story 分组，可独立实现与验证。行为编号（B1-B8）见 contracts/api-contract.md。

## Phase 1: Setup（测试基建）

- [x] T001 安装测试工具链 devDependencies：vitest、jsdom、@vue/test-utils、@vitest/coverage-v8、@playwright/test；package.json 增加 `typecheck` / `test` / `test:coverage` / `test:e2e` 脚本
- [x] T002 创建 `vitest.config.ts`（jsdom 环境，include `tests/unit` + `tests/integration`）与 `tests/{unit,integration,e2e}` 目录
- [x] T003 创建 `playwright.config.ts`（testDir `tests/e2e`，webServer 启动 `pnpm dev` @3002，reuseExistingServer）

**Checkpoint**: `pnpm test` 空跑可执行。

---

## Phase 2: US1 - 库核心持久化行为的自动化验证（Priority: P1）🎯 MVP

**Goal**: 全部核心行为（B1-B8）有单元/集成测试守护。

- [x] T010 单元：`tests/unit/persistedConfig.spec.ts` — 默认配置值、createPersistedState 无参/部分覆盖/全量覆盖（FR-001）
- [x] T011 集成：`tests/integration/persistence.spec.ts` — 首次保存（B1）、变更同步（B3）、重启恢复以本地为准（B2）、新增字段保留默认值（FR-003）
- [x] T012 集成：`tests/integration/multiStore.spec.ts` — 多 store 同键隔离（B4）、同键名 state 字段互不干扰
- [x] T013 集成：custom properties 缓存 — 默认过滤规则（`$`/`_`/`set` 前缀排除，FR-004/B5）、customFilterKey 自定义过滤（B8）
- [x] T014 集成：自定义 `key`/`customKey` 端到端读写（B8）
- [x] T015 单元：`tests/unit/guards.spec.ts` — 空 store id 守卫（B6，console.error + 不写存储）、损坏 JSON 自愈（B7）、空 state、JSON 不可序列化值（如函数字段）不崩溃
- [x] T016 Use Case：`tests/integration/componentUsage.spec.ts` — Vue Test Utils 挂载组件，用户输入 → state → localStorage 全链路
- [x] T017 覆盖率验证：`pnpm run test:coverage` 核心恢复分支（首次/已有数据/新增字段）100% 覆盖（SC-001）

---

## Phase 3: US2 - 真实浏览器端到端验证（Priority: P2）

- [x] T020 `tests/e2e/demo-persistence.spec.ts` — 输入框改值 → localStorage 同步 → `reload()` → 输入值恢复为修改后值（FR-006/SC-003）；含双 store 两个输入框

---

## Phase 4: US3 - 持续守护（Priority: P3）

- [x] T030 `.github/workflows/ci.yml` — master push + PR 触发：install → typecheck → plugin:build → vitest → playwright（chromium 带缓存）（FR-007/SC-004）
- [x] T031 `CHANGELOG.md` — 迁移 README 版本记录并补 0.3.0 条目（FR-008）
- [x] T032 README/DEV_README 补充测试运行说明（指向 quickstart.md）

---

## Phase 5: 缺陷修复（FR-009，发现即修，一缺陷一 commit）

- [x] T040 修复测试过程中发现的插件缺陷；每个缺陷：先写失败的回归测试 → 修复 → 测试转绿
  - D1（commit c179c46）：主记录为合法JSON但非对象（字符串/数字/数组）时初始化抛TypeError崩溃 → 新增`_isRecordObject`校验，结构非法一律以初始值重建；回归测试 `tests/unit/guards.spec.ts > 主记录为非对象JSON时同样自愈`

---

## Phase 6: 收尾验证

- [x] T050 本地全量验证：`typecheck && plugin:build && test && test:e2e` 全绿（SC-002）
- [x] T051 循环 code review：修复全部中等及以上严重问题后完成（SC-005）
