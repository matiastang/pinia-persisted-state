# Feature Specification: 升级 matias-storage 依赖至 0.3.0（v0.3.1）

**Feature Branch**: `002-upgrade-matias-storage`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "升级项目中的依赖matias-storage为最新版本（目前是0.3.0）"（docs/requirements.md v0.3.1；项目当前安装 0.2.0）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 现有持久化行为在升级后完全不变（Priority: P1）

作为已在本项目中使用 pinia-persisted-state 的开发者，我将存储依赖 matias-storage 从 0.2.0 升级到 0.3.0 后，需要确认：现有全部功能（初始化保存、变更写入、重启恢复、多 store 隔离、custom properties 缓存、损坏数据自愈）行为与升级前完全一致，用户本地已持久化的旧数据仍能正确恢复。

**Why this priority**: 兼容性是依赖升级的生命线。本项目宪法（constitution 原则 IV）规定"localStorage 中已持久化数据的结构变更必须做向后兼容处理"；任何既有行为回归都会直接伤害存量用户。

**Independent Test**: 升级依赖后运行项目已有的全量测试套件（单元 / 集成 / Use Case / e2e）全部通过，且新增"旧格式数据可正常恢复"的兼容性测试通过。

**Acceptance Scenarios**:

1. **Given** 用户浏览器 localStorage 中已存在由 matias-storage 0.2.0 写入的纯 JSON 格式持久化数据，**When** 升级到依赖 0.3.0 后的应用启动，**Then** 旧数据被正确读取并恢复到 store state（向后兼容，无需迁移）
2. **Given** 升级前全部通过的既有测试套件，**When** 升级依赖后重新执行，**Then** 所有测试仍然通过（零回归）
3. **Given** localStorage 中持久化主记录为非法 JSON 或合法 JSON 但非对象，**When** 插件初始化，**Then** 仍按既有自愈逻辑以初始值重建，不崩溃

---

### User Story 2 - 特殊类型 state 获得无损持久化能力（Priority: P2）

作为 pinia-persisted-state 的使用者，当我的 store state 中包含 Date、Map、Set、RegExp、BigInt 等 JSON 原生不支持或会失真的类型时，我需要状态持久化后能无损往返（恢复后仍是原类型实例，而非退化的字符串/空对象）。

**Why this priority**: 这是 matias-storage 0.3.0 带来的核心能力红利（序列化标签机制）。升级若不验证并锁定该行为，能力变化不可见、不可守护；但它建立在不破坏 P1 兼容性的前提之上，故列为 P2。

**Independent Test**: 构造包含 Date/Map/Set/RegExp/BigInt 的 store state，修改后持久化，重新初始化 store，断言恢复后的值类型与内容与持久化前一致。

**Acceptance Scenarios**:

1. **Given** store state 含 `Date` 值，**When** 修改触发持久化并重新初始化 store，**Then** 恢复后的值仍为 `Date` 实例且时间戳相等（0.2.0 时代会退化为字符串）
2. **Given** store state 含 `Map` / `Set` 值，**When** 持久化并恢复，**Then** 恢复后仍为 `Map` / `Set` 实例且内容一致
3. **Given** store state 含 `BigInt` / `RegExp` 值，**When** 持久化并恢复，**Then** 恢复后类型与值一致

---

### User Story 3 - 升级过程可追溯、可发布（Priority: P3）

作为项目维护者，我需要依赖升级有完整的记录：依赖声明与锁文件同步更新、版本更新说明（CHANGELOG）记录本次变更及其影响，构建链（类型检查、库构建、演示工程构建）在升级后依然全部可执行。

**Why this priority**: 维护性要求。项目开发基本要求规定"需要有版本更新说明文件"、构建链必须始终可执行（constitution 原则 III）；这些保障升级可追溯、可发布，但不影响运行时行为，故列为 P3。

**Independent Test**: 检查依赖声明指向 ^0.3.0 且锁文件一致；CHANGELOG 出现 v0.3.1 条目；类型检查与库构建命令成功执行。

**Acceptance Scenarios**:

1. **Given** 升级完成，**When** 查看依赖声明与锁文件，**Then** matias-storage 解析版本为 0.3.0
2. **Given** 升级完成，**When** 查看版本更新说明文件，**Then** 存在记录本次依赖升级及行为影响的条目
3. **Given** 升级后的代码库，**When** 执行类型检查与库构建，**Then** 全部成功零错误

---

### Edge Cases

- 旧版本 0.2.0 写入、含特殊类型失真数据（如 Date 已被存为 ISO 字符串）：升级后读取按普通字段恢复（字符串覆盖内存中的 Date 初始值），下次写入即按新格式存储——不做额外迁移，保持差异合并机制既有语义
- 持久化值中含循环引用或顶层 function/symbol：matias-storage 0.3.0 写入返回 false 并告警（0.2.0 时代为 JSON.stringify 抛错/失真），插件不应崩溃
- 序列化格式中新增的内部标签字段（`__matias_tag__`）：仅对特殊类型生效，普通对象/字符串/数字/布尔/null 的存储格式与 0.2.0 完全一致，新旧版本数据互读不受影响

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 项目依赖声明中 matias-storage MUST 升级至 ^0.3.0，并与锁文件保持一致
- **FR-002**: 升级后，插件全部既有功能行为 MUST 与升级前一致（既有全量测试套件零回归）
- **FR-003**: 由 matias-storage 0.2.0 写入 localStorage 的旧格式持久化数据 MUST 能被升级后的插件正确读取恢复（向后兼容，无需用户迁移）
- **FR-004**: 升级后，state 中 Date/Map/Set/RegExp/BigInt 值 MUST 能无损持久化往返（类型保持）
- **FR-005**: localStorage 数据损坏（非法 JSON / 非对象结构）时插件 MUST 维持既有自愈行为（以初始值重建，不崩溃）
- **FR-006**: 类型检查（tsc 零错误）、库构建、演示工程构建 MUST 在升级后全部成功
- **FR-007**: 版本更新说明文件 MUST 记录本次依赖升级及其带来的行为变化

### Key Entities *(include if feature involves data)*

- **持久化主记录**：localStorage 中以配置 `key`（默认 `pinia-key`）存储的总对象，子键为各 store id 与 custom properties 键；其内部值的序列化格式随 matias-storage 0.3.0 引入特殊类型标签机制，普通数据格式不变
- **依赖声明（matias-storage）**：本项目唯二的运行时依赖之一（另一为 pinia），提供 localStorage 读写原语；版本从 0.2.0 升至 0.3.0，对外 API（localStorageRead/localStorageWrite 等）保持兼容

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 升级后既有测试套件（单元 / 集成 / Use Case / e2e）100% 通过，零回归
- **SC-002**: 新增兼容性与无损往返测试覆盖：旧格式数据恢复、Date/Map/Set/RegExp/BigInt 往返共 ≥ 5 个场景全部通过
- **SC-003**: 依赖解析版本为 0.3.0（声明 ^0.3.0 与锁文件一致），类型检查与两条构建链全部零错误成功
- **SC-004**: CHANGELOG 含 v0.3.1 升级条目，明确记录依赖版本变化与特殊类型无损往返的行为增强

## Assumptions

- matias-storage 0.3.0 对本插件使用的 API（字符串 key 的 localStorageRead/localStorageWrite）保持向后兼容（已核对 0.3.0 类型声明确认），因此预期插件源码无需修改；若实现中发现必须调整源码，将作为偏差回流到本规格
- 本次仅升级依赖，不主动采用 0.3.0 的新特性 API（typed key、guard 校验等）重构插件——遵循宪法原则 V（YAGNI），插件继续使用字符串 key 兼容用法
- 旧数据不做主动迁移：0.2.0 写入的失真特殊类型数据（如 Date 存为字符串）按普通值恢复，属于可接受的既有语义
- 项目自有包版本号（package.json version）不在本次范围内调整，发布时由既有 `npm version` 流程管理
