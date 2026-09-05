# Research: 升级 matias-storage 依赖至 0.3.0

**Feature**: 002-upgrade-matias-storage | **Date**: 2026-08-24

调研方式：直接对 npm 上已发布的 `matias-storage@0.2.0`（本地 node_modules）与 `matias-storage@0.3.0`（官方 tarball 解包）执行行为探针（Node 脚本 + 假 localStorage），所有结论均有实测输出支撑。

## R1. API 兼容性：插件使用的接口签名是否变化

**Decision**: 插件源码零修改即可升级。

**Rationale**: 插件仅使用 `localStorageRead<T>(key: string)` 与 `localStorageWrite(key: string, value: object)`（`src/plugin/index.ts:10`）。0.3.0 类型声明中两者签名向后兼容：

- `localStorageWrite(key: string | StorageKey<unknown>, value: object | string | boolean | number | bigint | null | undefined) => boolean`——字符串 key 与 object 值均在值域内，新增 bigint 类型为值域扩展
- `localStorageRead<T = any>(key: string | StorageKey<unknown>) => T | null`——字符串 key 兼容，返回类型不变

**Alternatives considered**: 无（签名比对即可确认，无需备选）。

## R2. 序列化格式：0.2.0 已写入的旧数据能否被 0.3.0 读取

**Decision**: 完全向后兼容，无需数据迁移。

**Rationale**: 0.3.0 序列化仅对 JSON 原生会失真的类型（Date/Map/Set/RegExp/BigInt）包裹内部标签对象 `{"__matias_tag__": "...", "__matias_value__": ...}`；普通对象/字符串/数字/布尔/null 的存储 JSON 与 0.2.0 逐字节一致。实测：0.2.0 写入的纯 JSON（含 ISO 字符串形式的旧 Date 数据）0.3.0 读取正常原样返回（无标签则不还原，按普通值处理）。

**Alternatives considered**: 无需迁移脚本方案（标签仅出现在新写入数据中；旧数据按普通值语义恢复，符合规格 Edge Case 约定）。

## R3. 行为差异矩阵：插件依赖的语义场景

| 场景 | 0.2.0 实测 | 0.3.0 实测 | 影响 |
|---|---|---|---|
| key 不存在读取 | 返回 null | 返回 null | 无 |
| 非法 JSON 读取 | console.warn + 返回 null | console.warn + 返回 null（前缀 `matias-storage`） | 插件自愈路径不变；既有测试仅 mock warn 不断言文本，无影响 |
| 嵌套函数字段 | JSON 序列化静默丢弃 | 静默丢弃（实测 `{data:'d',handler:()=>1}` → `{"data":"d"}`） | 既有测试"函数字段被丢弃"兼容 |
| Date 值 | 退化为 ISO 字符串 | 无损还原为 Date 实例（`{"__matias_tag__":"Date","__matias_value__":1704067200000}`） | 行为增强（P2 验收点） |
| Map/Set/RegExp/BigInt | Map/Set 退化为 `{}`/`{}`、BigInt 抛 TypeError、RegExp 退化为 `{}` | 全部无损还原 | 行为增强（P2 验收点） |
| 循环引用写入 | JSON.stringify 抛 TypeError | 返回 false + 告警，不抛出 | 健壮性提升 |
| 写入 undefined | 同删除 | 同删除（返回 true） | 无 |

## R4. 包格式变化对构建链的影响

**Decision**: Vite 5 / Vitest / tsc 全链路兼容，无需构建配置修改。

**Rationale**: 0.3.0 变为 ESM-first（`"type": "module"`），产物由 `index.umd.js/index.cjs.js` 改为 `index.es.js/index.umd.cjs/index.iife.js`；`exports` 仍提供 `import`（ES）与 `require`（UMD-CJS）双入口，`types` 字段不变。本项目的消费方式：Vite 库构建与演示工程（rollup 解析 `module`/`exports.import` → ES 产物）、Vitest（同 Vite 解析）、`tsc --build`（`types` 字段）——均走兼容路径。0.3.0 零运行时依赖，无 postinstall 脚本，不触发 pnpm `onlyBuiltDependencies` 关注项。

**Alternatives considered**: 无（解析路径逐一核对即可）。

## R5. 测试策略：如何在 TDD 下锁定升级价值

**Decision**: 先写两类行为测试再升级依赖——(a) 特殊类型（Date/Map/Set/RegExp/BigInt）持久化往返断言类型保持（在 0.2.0 下失败：Date 变字符串、Map/Set 变空对象、BigInt 直接抛错）；(b) 旧格式兼容（预置 0.2.0 风格纯 JSON 数据断言恢复正常，0.2.0/0.3.0 下均应通过，作兼容守护）。依赖升级后全部转绿 + 既有 36 例零回归。

**Rationale**: 项目宪法要求测试驱动；往返测试天然构成"升级前红 / 升级后绿"的 TDD 证据链；兼容测试守护 FR-003。

**Alternatives considered**: 仅跑既有套件回归（被否决：无法锁定新能力与兼容契约，SC-002 不满足）。

## 结论

规格中无 NEEDS CLARIFICATION 项，全部技术未知数（API 兼容、数据兼容、行为差异、构建链、测试策略）已通过实测消解。
