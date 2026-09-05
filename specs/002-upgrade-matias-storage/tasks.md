# Tasks: 升级 matias-storage 依赖至 0.3.0（v0.3.1）

**Input**: Design documents from `/specs/002-upgrade-matias-storage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: 项目开发基本要求强制 TDD（先写测试再写代码），故包含测试任务；红灯证据（0.2.0 下新行为测试失败）为 Foundational 阶段产出。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Baseline)

**Purpose**: 升级前确认基线全绿，任何基线失败先于本特性处理

- [X] T001 在 matias-storage 0.2.0 下运行全量基线：`pnpm test`（36 例）与 `pnpm test:e2e`（5 例）全部通过

---

## Phase 2: Foundational (TDD 红灯测试) ⚠️ BLOCKS ALL STORIES

**Purpose**: 先写测试。新增行为测试写入同一文件，运行记录红灯证据（特殊类型往返测试在 0.2.0 下失败），此后才允许升级依赖

- [X] T002 [US1] 编写旧格式向后兼容测试：预置 0.2.0 风格纯 JSON 持久化数据（含 ISO 字符串日期、普通对象），断言插件启动后正确恢复——`tests/integration/specialTypesPersistence.spec.ts`
- [X] T003 [US2] 编写特殊类型无损往返测试：state 含 Date/Map/Set/BigInt/RegExp，修改触发持久化后模拟重启（新 pinia 实例），断言恢复值类型保持、内容相等——`tests/integration/specialTypesPersistence.spec.ts`（依赖 T002 同文件）
- [X] T004 运行 `pnpm test` 记录 TDD 证据：兼容测试通过（0.2.0/0.3.0 均应通过的守护测试）、特殊类型往返测试失败（0.2.0 能力不足，红灯）

**Checkpoint**: 红灯确认，进入实现

---

## Phase 3: User Story 1 - 现有持久化行为零回归（Priority: P1）🎯 MVP

**Goal**: 依赖升级到 ^0.3.0 且既有行为与旧数据兼容性零回归

**Independent Test**: 既有 36 例 + 新增兼容测试 + 5 例 e2e 全部通过

### Implementation for User Story 1

- [X] T005 [US1] 升级依赖声明：`package.json` 中 `matias-storage` `^0.2.0` → `^0.3.0`，执行 `pnpm install` 同步 `pnpm-lock.yaml`，确认解析版本 0.3.0（`pnpm list matias-storage`）
- [X] T006 [US1] 全量回归：`pnpm test` 全绿（既有 36 例零回归 + 新增测试转绿，含 US2 往返测试）
- [X] T007 [US1] e2e 回归：`pnpm test:e2e` 5 例全绿（真实浏览器持久化旅程）

**Checkpoint**: US1 完成——依赖为 0.3.0，全部测试通过

---

## Phase 4: User Story 2 - 特殊类型无损持久化（Priority: P2）

**Goal**: 确认并锁定 0.3.0 带来的 Date/Map/Set/RegExp/BigInt 无损往返能力

**Independent Test**: T003 往返测试在升级后全部通过，且持久化 JSON 中出现 `__matias_tag__` 标签（证明新序列化生效）

### Implementation for User Story 2

- [X] T008 [US2] 验证往返测试转绿并在测试中补充存储格式断言（持久化主记录 JSON 含 `__matias_tag__` 标签、普通字段格式与旧版一致）——`tests/integration/specialTypesPersistence.spec.ts`；确认 `pnpm test:coverage` 覆盖率不低于既有阈值

**Checkpoint**: US2 完成——新能力可见、可测试、被锁定

---

## Phase 5: User Story 3 - 升级可追溯与构建链（Priority: P3）

**Goal**: 变更记录完整、构建链零错误

**Independent Test**: CHANGELOG 含 [0.3.1] 条目；typecheck 与两条构建链成功

### Implementation for User Story 3

- [X] T009 [US3] `CHANGELOG.md` 新增 `[0.3.1] - 未发布` 条目：记录 matias-storage ^0.2.0→^0.3.0、特殊类型无损持久化增强、向后兼容说明
- [X] T010 [US3] 构建链验证：`pnpm typecheck`（tsc 零错误）+ `pnpm plugin:build`（类型生成/库打包成功）+ `pnpm build`（演示工程构建成功）

**Checkpoint**: US3 完成——升级可追溯、可发布

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T011 按 `specs/002-upgrade-matias-storage/quickstart.md` 全流程走查验证
- [X] T012 循环 code review（含新增测试与依赖变更），修复中等严重及以上问题直至清零；发现的规格偏差回流 `specs/002-upgrade-matias-storage/`
- [X] T013 按功能点分 commit 提交：specs 工件 / test（红灯测试）/ chore（依赖升级）/ docs（CHANGELOG），遵循 `<type>: - <描述>` 规范

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: 无依赖（基线）
- **Phase 2**: 依赖 Phase 1；**阻塞**全部实现（TDD：红灯先行）
- **Phase 3 (US1)**: 依赖 Phase 2；依赖升级是 US2 验证的前提
- **Phase 4 (US2)**: 依赖 Phase 3（升级后才能验证转绿）
- **Phase 5 (US3)**: 依赖 Phase 3；T009/T010 与 Phase 4 无文件冲突
- **Phase 6**: 依赖 Phase 3-5 全部完成

### Parallel Opportunities

- Phase 2 内 T002/T003 为同文件顺序执行，无并行
- Phase 5 的 T009（CHANGELOG.md）与 T010（命令验证）可并行

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 基线 → Phase 2 红灯 → Phase 3 升级与回归 → 停下验证（MVP：零回归升级）
2. Phase 4 锁定新能力 → Phase 5 记录与构建 → Phase 6 审查提交

### 本特性特有约束

- 一个功能点一个 commit（项目开发基本要求），T013 明确拆分
- 插件源码 `src/plugin/index.ts` 预期零修改；若实现中发现必须改动，视为规格偏差，需回流 spec.md

---

## Notes

- 红灯证据：T004 输出中特殊类型往返用例失败信息即 TDD"先测试"证明（0.2.0 下 Date 退化为 string、Map/Set 退化为普通对象、BigInt 序列化报错）
- e2e（T007）需本地 chromium（`pnpm exec playwright install chromium` 已在既有环境就绪）
- 全部命令在仓库根目录执行
