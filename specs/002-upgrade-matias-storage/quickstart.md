# Quickstart: 升级 matias-storage 依赖至 0.3.0 验证指引

**Feature**: 002-upgrade-matias-storage | **Date**: 2026-08-24

验证目标：依赖升级到 ^0.3.0 后，既有持久化行为零回归、特殊类型获得无损往返、构建链可用。

## 前置

- Node 18+、pnpm 已安装
- 仓库根目录执行

## 验证步骤

### 1. 确认依赖解析版本

```bash
grep '"matias-storage"' package.json       # 期望: "matias-storage": "^0.3.0"
pnpm list matias-storage                    # 期望: matias-storage 0.3.0
```

### 2. 全量测试（零回归 + 新行为）

```bash
pnpm test          # 期望: 全部通过（既有 36 例 + 新增特殊类型/兼容用例）
pnpm test:e2e      # 期望: 5 例 e2e 通过（真实浏览器：修改→持久化→刷新→恢复）
```

关键新用例（`tests/integration/specialTypesPersistence.spec.ts`）：

- 含 Date/Map/Set/RegExp/BigInt 的 state 持久化后重启恢复，类型保持、值相等
- 预置 0.2.0 风格纯 JSON 旧数据（含 ISO 字符串日期），启动后正常恢复

### 3. 类型检查与构建链

```bash
pnpm typecheck     # 期望: tsc 零错误
pnpm plugin:build  # 期望: 类型生成 + 库打包（ES/CJS/UMD/IIFE）成功
pnpm build         # 期望: 演示工程构建成功（可选验证）
```

### 4. 手动冒烟（可选）

```bash
pnpm dev           # 打开演示页面 → 修改 state → 刷新页面 → 值恢复
```

DevTools → Application → Local Storage 中查看 `pinia-key`：特殊类型字段以 `__matias_tag__` 标签存储，普通字段与旧版一致。

## 预期结果对照

| 步骤 | 预期 |
|---|---|
| 依赖版本 | ^0.3.0（解析 0.3.0） |
| pnpm test / test:e2e | 全绿，零回归 |
| typecheck / plugin:build / build | 零错误成功 |
| CHANGELOG.md | 含 [0.3.1] 依赖升级条目 |
