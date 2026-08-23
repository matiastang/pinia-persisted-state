# API Contract: piniaPersistedState 插件

**Date**: 2026-08-23 | **被测模块**: `src/plugin/index.ts`

## 导出

| 导出 | 类型 | 行为契约 |
|---|---|---|
| `piniaPersistedState` | `(context: PiniaPluginContext) => void` | 默认插件：注册即初始化持久化并订阅变更 |
| `createPersistedState` | `(config?: PersistedStateConfig) => typeof piniaPersistedState` | 合并配置（浅覆盖默认值）后返回插件函数；无参调用等价默认插件 |
| `persistedConfig` | `PersistedStateConfig`（可变导出） | 当前生效配置；createPersistedState 调用后随之更新 |
| `default` | 同 `piniaPersistedState` | 默认导出 |

## 配置项

| 配置 | 类型 | 默认值 | 语义 |
|---|---|---|---|
| `key` | `string` | `'pinia-key'` | state 持久化主键 |
| `customKey` | `string` | `'pinia-custom-key'` | 自定义属性子键名 |
| `customFilterKey` | `(key: string) => boolean` | 排除 `$`/`_`/`set` 前缀 | 判定 store 成员是否属于需缓存的自定义属性 |

## 行为矩阵

| # | 前置 | 动作 | 预期 |
|---|---|---|---|
| B1 | 存储为空 | 注册插件 + 创建 store | 主记录写入 `{[id]: state}` |
| B2 | 主记录已有该 store 旧数据 | 创建 store | 内存被本地值恢复；本地缺失的新字段保留默认值 |
| B3 | 任意 | 修改 store.$state | 主记录同步为新 state |
| B4 | 多 store | 各自修改 | 各 id 子键独立更新 |
| B5 | 第三方插件注入 custom 属性 | 触发 $subscribe | customKey 子键合并写入该属性 |
| B6 | `store.$id === ''` | 插件初始化 | console.error 提示，不写存储，不订阅 |
| B7 | 主记录为非法 JSON | 创建 store | 视为首次使用，初始值重建主记录 |
| B8 | 自定义 `key`/`customKey`/`customFilterKey` | 全流程 | 读写均使用自定义键；过滤规则可排除指定属性 |

## 非目标（本版本不改变）

- 不修改公开 API 签名与数据结构
- 不处理跨 tab 同步（storage 事件）
- 不支持序列化函数/Map/Set 等非 JSON 类型（JSON 语义内自然降级）
