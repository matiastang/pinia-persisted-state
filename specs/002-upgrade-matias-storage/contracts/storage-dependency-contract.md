# Storage Dependency Contract: matias-storage

**Feature**: 002-upgrade-matias-storage | **Date**: 2026-08-24

本项目（插件）作为 matias-storage 的消费方，依赖契约如下。升级到 ^0.3.0 后本契约不变——这正是升级可行性的核心依据。

## 插件消费的接口（字符串 key 兼容用法）

```ts
// 写入：key 为配置的持久化键（默认 'pinia-key'），value 为持久化主记录对象
localStorageWrite(key: string, value: object): boolean

// 读取：返回反序列化后的主记录；key 不存在 / 存储为 null / JSON 解析失败时返回 null
localStorageRead<T>(key: string): T | null
```

## 行为契约（插件依赖的语义）

| # | 契约 | 0.2.0 | 0.3.0 |
|---|---|---|---|
| C1 | 写入 object 后按 key 读取得到等值对象 | ✅ | ✅（普通对象 JSON 逐字节一致） |
| C2 | key 不存在读取返回 null | ✅ | ✅ |
| C3 | 非法 JSON 读取：告警 + 返回 null（不抛出） | ✅ | ✅（告警前缀文本变化，插件不依赖文本） |
| C4 | 嵌套函数字段序列化被丢弃、不抛出 | ✅ | ✅ |
| C5 | 顶层 undefined 写入等同删除 | ✅ | ✅ |

## 0.3.0 新增能力（插件被动受益，规格 FR-004）

- C6：Date/Map/Set/RegExp/BigInt 值无损往返（类型保持），存储形态见 [data-model.md](../data-model.md)
- C7：循环引用写入返回 false + 告警（不抛出）
- C8：旧格式（0.2.0 纯 JSON）数据可读（C1 兼容性的推论，规格 FR-003）

## 明确不消费的 0.3.0 新接口（YAGNI）

- `defineStorageKey` / `StorageKey` typed key、`StorageValueGuard` 读取校验、`serialize`/`deserialize` 直接调用、`storageRead/storageWrite` 泛型重载、`StorageSerializeError`——插件均不使用，不在本次范围。
