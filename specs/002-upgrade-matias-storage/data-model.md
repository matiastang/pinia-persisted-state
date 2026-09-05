# Data Model: 升级 matias-storage 依赖至 0.3.0

**Feature**: 002-upgrade-matias-storage | **Date**: 2026-08-24

本特性不新增实体，仅更新既有"持久化主记录"的值序列化格式契约。插件数据模型（主记录结构、子键布局）不变。

## 持久化主记录（localStorage `pinia-key`，结构不变）

```text
{
  [storeId: string]: store 的 state 对象,        // 每个 store 一个子键
  [customKey: string]: custom properties 对象    // 默认 'pinia-custom-key'
}
```

## 值序列化格式（matias-storage 0.3.0 起）

### 普通值（与 0.2.0 逐字节一致）

- 普通对象、字符串、数字、布尔、null、数组：标准 JSON，无变化
- 嵌套函数字段：序列化时静默丢弃（与 0.2.0 一致）
- 顶层写入 undefined：等同删除该 key（与 0.2.0 一致）

### 特殊类型（0.3.0 新增，内部标签机制）

| 类型 | 存储形态 | 还原结果 |
|---|---|---|
| Date | `{"__matias_tag__":"Date","__matias_value__":<epoch毫秒>}` | Date 实例 |
| Map | `{"__matias_tag__":"Map","__matias_value__":[[k,v],...]}` | Map 实例 |
| Set | `{"__matias_tag__":"Set","__matias_value__":[v,...]}` | Set 实例 |
| BigInt | `{"__matias_tag__":"BigInt","__matias_value__":"<十进制字符串>"}` | bigint |
| RegExp | `{"__matias_tag__":"RegExp","__matias_value__":{"s":<source>,"f":<flags>}}` | RegExp 实例 |

标签嵌套递归生效（如 `Map<string, Date>` 内层 Date 同样打标签还原）。

## 数据校验规则（来自需求 FR-003/FR-005）

- 读取时 JSON 解析失败：告警并返回 null → 插件按"无数据"处理，以初始值重建（自愈）
- 读取到非对象结构（字符串/数字/数组）：插件 `_isRecordObject` 判定非法 → 以初始值重建（自愈）
- 旧格式数据（0.2.0 写入的纯 JSON，特殊类型已失真如 Date 为字符串）：按普通值恢复，不迁移；下次写入即按新格式存储

## 状态迁移（写入数据形态）

```text
[0.2.0 时代数据]           [升级后首次读取]              [升级后首次写入]
纯 JSON（特殊类型失真） → 按普通值恢复（字符串等） → 新格式（特殊类型带标签无损）
```

一次性、单向、无需用户介入。
