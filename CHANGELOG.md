# Changelog

本文件记录项目的全部版本变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)。

## [0.3.0] - 未发布

### Added

* 项目名称统一为 `pinia-persisted-state`（包名、README、文档、UMD 库名 `piniaPersistedState`、演示页与插件内 npm 链接）。注意：npm 包改名后需在新名字下重新发布，旧包 `matias-pinia-persisted-state` 不会自动迁移，建议后续在 npm 上将其标记 deprecated 指向新包
* 完整测试套件：36 例单元/集成/Use Case 测试（Vitest + Vue Test Utils）与 5 例端到端测试（Playwright，真实浏览器验证"修改 → 持久化 → 刷新 → 恢复"与损坏数据自愈）
* 库核心代码覆盖率 100%（语句/分支/函数/行），覆盖率阈值门槛纳入测试配置
* GitHub Actions CI：master 推送与 PR 自动执行类型检查、构建、全部测试与 e2e
* CHANGELOG.md 版本更新说明文件
* README 双语：默认英文（README.md）+ 中文（README.zh-CN.md），顶部互链
* 演示页面功能增强：state 修改（含 action/$patch/$reset）、custom properties、共有 state properties、store 状态与本地存储实时视图、边界操作（清空存储、写入非法 JSON 自愈）等测试面板
* `typecheck` / `test` / `test:coverage` / `test:e2e` 脚本

### Fixed

* 持久化主记录为合法 JSON 但非对象（字符串/数字/数组）时插件初始化抛 TypeError 崩溃，现统一以初始值重建

### Changed

* 项目清理：删除来自其他项目的无效文件（RollupBuild、gulpfile、loadenv、.env 等）、失效的 eslint 配置与冗余依赖（19 → 9 个 devDependencies）
* 发布脚本由缺失依赖的 gulp 改为 `npm version patch && npm publish`

## [0.2.1] - 2024-07-16

* 更新类型文件结构
* 更新 `matias-storage` 存储库

## [0.2.0] - 2024-07-12

* `web storage` 存储使用 [`matias-storage`](https://www.npmjs.com/package/matias-storage) 库
* 添加 `custom properties` 的缓存
* 移除 `state` 中必须包含 `stateName` 属性的限制，使用 `store id` 来保存对应的 `store`
* 更新丰富配置项

## [0.1.8] - 2024-07-11

* fix：`store.$subscribe` 添加 `detached:true`

## [0.1.7] - 2024-07-11

* `state` 没有 `stateName` 属性添加提示

## [0.1.6]

* 开启代码压缩

## [0.1.5]

* 目录结构调整

## [0.1.4]

* 更新类型文件导出

## [0.1.3]

* 更新 `package.json` 的导出目录

## [0.1.2]

* 更新目录结构及名称

## [0.1.1]

* 添加类型声明文件

## [0.1.0]

* 实现基本的本地持久化功能
