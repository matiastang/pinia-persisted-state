# Feature Specification: 完整测试套件（v0.3.0）

**Feature Branch**: `001-test-suite`

**Created**: 2026-08-23

**Status**: Draft

**Input**: User description: "给项目功能添加完整的测试，考虑到各个方面的使用，如果发现问题要修复。"（docs/requirements.md v0.3.0）

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 库的核心持久化行为有自动化验证（Priority: P1）

作为库的使用者（前端开发者），我需要确认：无论我如何使用 pinia store（修改 state、多 store 并存、刷新页面），状态都能正确持久化和恢复，并且这套行为有自动化测试守护，升级版本时不会悄悄破坏。

**Why this priority**: 持久化正确性是本库存在的唯一理由，任何回归都是最严重的事故；这是本版本的核心价值。

**Independent Test**: 通过针对插件核心行为（初始化保存、变更写入、重启恢复、多 store 隔离、自定义属性缓存、配置项）的单元/集成测试全部通过来验证。

**Acceptance Scenarios**:

1. **Given** 一个首次使用的应用（本地存储为空），**When** 创建带初始 state 的 store，**Then** 本地存储中立即出现以 store id 为子键的持久化数据
2. **Given** 本地存储中已有上次会话保存的 state，**When** 应用重新启动创建同一 store，**Then** 内存 state 被本地数据恢复（以本地为准）
3. **Given** 两个不同的 store（如 user 和 test），**When** 分别修改各自 state，**Then** 两个 store 的数据互不干扰地保存在同一个持久化键下
4. **Given** store 的 state 结构在新版本中新增了字段，**When** 带旧数据的用户启动新版本应用，**Then** 旧字段被正确恢复、新字段保持代码默认值（向后兼容）
5. **Given** 通过插件注入的自定义属性（custom properties，如 userId），**When** 对其赋值后触发状态更新，**Then** 自定义属性被缓存到独立的持久化子键中
6. **Given** store id 为空字符串，**When** 插件初始化，**Then** 跳过该 store 的持久化并输出错误提示，不影响其他 store

---

### User Story 2 - 真实使用路径的端到端验证（Priority: P2）

作为库的维护者，我需要在接近真实环境的浏览器页面中验证"输入 → 持久化 → 刷新页面 → 恢复"的完整用户旅程，防止只在隔离测试中通过、真实页面却失败的情况。

**Why this priority**: 单元测试无法覆盖真实浏览器环境（页面重载、storage 事件、构建产物加载），端到端验证是质量信心的最后防线。

**Independent Test**: 在演示工程的运行页面上自动化模拟用户输入、刷新页面、检查数据恢复，全程在真实浏览器中执行并通过。

**Acceptance Scenarios**:

1. **Given** 演示页面已打开，**When** 在输入框修改绑定到 store 的值，**Then** 本地存储同步更新
2. **Given** 用户已修改过数据，**When** 刷新页面，**Then** 输入框显示恢复后的值（与修改后一致，非初始值）

---

### User Story 3 - 测试结果可持续守护（Priority: P3）

作为项目的贡献者，我提交代码后需要自动得到反馈：测试是否通过、构建是否成功，而不必依赖本地手动执行；同时每次版本变更都有可追溯的更新说明。

**Why this priority**: 测试只有被持续执行才有价值；这是让 Story 1/2 的成果长期生效的保障机制。

**Independent Test**: 仓库托管平台上配置的自动化流程在代码推送和合并请求时自动执行全部测试与构建，结果可查；版本更新说明文件存在且记录到当前版本。

**Acceptance Scenarios**:

1. **Given** 仓库已配置自动化校验，**When** 有代码推送到主分支或发起合并请求，**Then** 自动执行类型检查、构建和全部测试并报告结果
2. **Given** 项目发布过多个版本，**When** 查看版本更新说明文件，**Then** 能看到按版本组织的变更记录（含当前开发版本）

---

### Edge Cases

- 本地存储中的持久化数据被用户手动清空或损坏（非法 JSON）时，插件应能以代码初始值正常工作而不崩溃
- 本地存储中存在旧版本数据结构（如包含历史遗留字段）时，恢复逻辑不报错
- store 的 state 为空对象时，持久化与恢复正常
- 同一页面创建大量 store 时，数据按 store id 正确隔离
- 隐私模式或 storage 不可用时行为不崩溃（记录发现的问题，按"发现问题要修复"处理）

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 测试体系 MUST 覆盖插件核心 API 的全部公开行为：便捷注册（`piniaPersistedState`）、带配置注册（`createPersistedState`）及三个配置项（`key`/`customKey`/`customFilterKey`）的默认值与自定义值
- **FR-002**: 测试 MUST 验证持久化数据的完整生命周期：首次保存、变更同步、应用重启恢复、多 store 数据隔离
- **FR-003**: 测试 MUST 验证向后兼容的恢复行为：本地旧数据与代码新结构并存时，旧字段恢复、新字段用默认值
- **FR-004**: 测试 MUST 验证 custom properties 的缓存行为，包括默认过滤规则（排除 `$`/`_`/`set` 前缀属性）
- **FR-005**: 测试 MUST 覆盖边界与异常场景：空 store id 提示、损坏的本地数据、空 state
- **FR-006**: 项目 MUST 提供可在真实浏览器中运行的端到端验证，覆盖"修改 → 持久化 → 刷新 → 恢复"旅程
- **FR-007**: 仓库 MUST 配置自动化校验流程：主分支推送与合并请求时自动执行类型检查、构建与全部测试
- **FR-008**: 项目 MUST 提供按版本组织的更新说明文件，并包含当前版本
- **FR-009**: 测试过程中发现的插件缺陷 MUST 被修复，且每个修复有对应回归测试

### Key Entities *(include if feature involves data)*

- **持久化数据（localStorage 记录）**: 单键下的 JSON 结构，以 store id 为子键组织 state，以 customKey 子键组织自定义属性
- **测试用例（Test Case）**: 对一个可验证行为的自动化描述，归属于单元/集成/端到端某一层级

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 插件源文件中每一个导出函数和配置项至少被一个测试用例覆盖，核心状态恢复逻辑的主要分支（首次保存/已有数据/新增字段）100% 有用例
- **SC-002**: 全部测试在本地一条命令可运行、通过，并有稳定（可重复执行）的结果
- **SC-003**: 端到端验证覆盖页面刷新后数据恢复这一核心用户旅程并通过
- **SC-004**: 主分支推送/合并请求触发自动校验，失败可被明确归因到具体用例
- **SC-005**: 测试期间发现的问题全部有修复提交和对应回归测试，无已知未修复的中等及以上严重问题遗留

## Assumptions

- "完整的测试"按项目基本要求中的分层理解：单元测试（Vitest + Vue Test Utils，技术选型在 plan 阶段确定）、集成/Use Case 测试、e2e 测试（Playwright 对演示工程）；具体工具与结构属实现细节，在技术方案中决策
- 端到端测试以演示工程（Vue 演示应用）为载体，因为库本身无独立 UI
- 提交规范工具（commitlint/husky）、GitHub Issue 模板、README 中英双语属于项目基本要求中的独立事项，不在本版本范围内，留待后续版本
- CI 只做校验（类型检查/构建/测试），不做自动发布（遵循基本要求"先只做校验"）
- 主分支指仓库默认分支（master）；"main 分支的 push、PR 需要跑 CI"按此理解执行
- 测试过程中若发现插件缺陷，修复遵循"一个功能点一个 commit"
