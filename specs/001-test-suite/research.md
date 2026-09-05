# Research: 完整测试套件（v0.3.0）

**Date**: 2026-08-23 | **Status**: Complete

## R1: 测试框架选型（单元/集成）

**问题**: 项目用 Vite 5 + TS 5.5，需要兼容的测试框架。

**结论**: **Vitest ^3**（peer 支持 Vite ^5）。

- 与 Vite 共享配置生态（`vitest/config`、别名、TS 转换零配置）
- jsdom 环境提供 `window.localStorage`，满足插件与 matias-storage 的依赖
- `@vitest/coverage-v8` 提供 SC-001 要求的覆盖率指标
- Vue Test Utils `^2.4` 用于组件级 Use Case（挂载真实演示页面组件）

**验证方式**: 安装后 `vitest run` 空跑通过即为兼容。

## R2: matias-storage 关键行为（实测源码 `dist/index.es.js`）

**问题**: 插件把读写委托给 matias-storage，其边界行为决定测试预期。

**结论**（源码确认）:

| 场景 | 行为 |
|---|---|
| `localStorageRead(key)` 键不存在 | 返回 `null` |
| `localStorageRead(key)` 值为非法 JSON | `console.warn` 后返回 `null`（不抛异常） |
| `localStorageWrite(key, undefined)` | **删除该键** |
| `localStorageWrite` 序列化失败 | `console.warn` 后返回 `false`，不抛异常 |

**推论**: 持久化数据损坏时，插件 `_localStateDiff` 收到 `null` → 视为首次使用 → 以代码初始值覆盖写入。损坏数据自愈、应用不崩溃——这是 spec 边界场景的预期行为，固化为测试。

## R3: e2e 方案

**问题**: 库无独立 UI，如何在真实浏览器中验证。

**结论**: **Playwright**，`webServer` 托管演示工程 dev server（`pnpm dev`，端口 3002，`strictPort`），仅装 chromium。用例：输入框改值 → 断言 localStorage 同步 → `page.reload()` → 断言输入框值恢复（非初始值）。`reuseExistingServer: true` 便于本地复用已开服务。

## R4: pinia 空注册的守卫测试

**问题**: `defineStore('')` 时 pinia 自身可能先抛错，导致插件的空 id 守卫无法用真实 pinia 触发。

**结论**: 空守卫用构造的最小 `PiniaPluginContext`（`{ store: { $id: '', $state: {} } }`）直接调用 `piniaPersistedState(context)` 做单元测试，断言 `console.error` 被调用且未写存储；真实 pinia 路径在集成测试覆盖。

## R5: CI 编排

**问题**: GitHub Actions 上跑全套校验的顺序与缓存。

**结论**: ubuntu-latest + Node 20 + pnpm（pnpm/action-setup 缓存）；步骤顺序 `typecheck → plugin:build → vitest run → playwright test`（先构建后测试，失败归因清晰）。Playwright 浏览器用 `playwright install chromium --with-deps` 并挂 actions 缓存。`plugin:build` 中的 `cp` 命令在 ubuntu 可用。注意 package.json 已配置 `pnpm.onlyBuiltDependencies`（esbuild/vue-demi），CI 的 pnpm install 会自动执行构建脚本。
