# Data Model: 持久化数据结构契约

**Date**: 2026-08-23 | **Source**: `src/plugin/index.ts` 现状（本版本不改变结构，仅固化契约）

## localStorage 主记录

**键**: `persistedConfig.key`（默认 `'pinia-key'`）| **格式**: JSON 对象

```jsonc
{
  // 每个 store 一项：键 = store.$id，值 = 该 store 的 $state 快照
  "<storeId>": { "<stateField>": <value>, ... },

  // 自定义属性集中存放：键 = persistedConfig.customKey（默认 'pinia-custom-key'）
  "pinia-custom-key": { "<customProp>": <value>, ... }
}
```

## 字段语义

| 字段 | 来源 | 写入时机 |
|---|---|---|
| `<storeId>` 子键 | `store.$state`（Proxy 原样序列化） | 插件注册时初始化写入；每次 `$subscribe` 回调更新 |
| `customKey` 子键 | store 上非 `$state` 成员经 `customFilterKey` 过滤后的键值 | 每次 `$subscribe` 回调合并更新 |

## 恢复规则（`_localStateDiff`，应用启动时）

1. 主记录不存在（null，含数据损坏被 matias-storage 吞掉的情况）→ 以内存初始 state 创建主记录
2. 主记录存在但无该 store 子键 → 追加当前 state 为新子键
3. 子键存在 → 逐字段对比：本地有且值不同 → 以**本地值**覆盖内存；代码新增字段（本地没有）→ 保留**代码默认值**；最后把内存 state 回写子键

## 不变量

- 多 store 数据同居一个主记录，以 store id 隔离，互不覆盖
- custom properties 是全局共享的（跨 store 同名属性同值），存放于独立子键
- 序列化均经 JSON（经 matias-storage），ref 在 store 代理上访问时已解包为原始值
