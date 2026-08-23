<!--
 * @Author: matiastang
 * @Date: 2024-07-16 17:39:47
 * @LastEditors: matiastang
 * @LastEditTime: 2026-08-23
 * @FilePath: /pinia-persisted-state/DEV_README.md
 * @Description: 维护者指南
-->
# matias-pinia-persisted-state · 维护者指南

面向项目维护者的开发、调试与发布说明。库的使用文档见 [README.md](./README.md)（英文默认）/ [README.zh-CN.md](./README.zh-CN.md)。

## 常用命令

全部脚本以 [package.json](./package.json) 为准（dev / typecheck / test / test:coverage / test:e2e / plugin:build / push:npm:package 等）。测试详细说明见 [specs/001-test-suite/quickstart.md](./specs/001-test-suite/quickstart.md)。

## 使用符号链接调试

`node_modules`目录下执行链接
```sh
$ cd node_modules
$ ln -s ~/matias/MT/MTGithub/npm/mt-storage/dist matias-storage
```
**注意**`dist`的路径要更新为自己项目的路径，且`dist`要包含`package.json`文件。链接名称要和`package.json`中的一致。
**注意**如果使用`npm`或`yarn`则可以使用`npm link`或`yarn link`来调试。

## 发版/更新

#### 方式一

未设置二次验证，可如下发布：
```sh
$ pnpm run plugin:build:push:npm:package
```

#### 方式二

由于设置了二次验证，需要传入`TOTP`，所以不能使用上面的自动发布了。
* 打包
```sh
$ pnpm run plugin:build
```
* 切换到`npm`源。(如果就是`npm`源，则可以忽略)
```sh
$ nrm use npm
```
* 发布
```sh
$ npm publish --otp=******
```
* 切换回原来的源。(如果之前就是`npm`源，则可以忽略)
```sh
nrm use cnpmmirror
```

#### 方式三

打包流程是一样的，发布的时候使用如下命令发布，这样省去切换源的麻烦
```sh
$ npm publish --registry https://registry.npmjs.org --otp=******
```

## Spec Kit（规格驱动开发）

迭代开发使用[GitHub Spec Kit](https://github.com/github/spec-kit)管理，`specify` CLI 由`uv`管理版本，Agent 集成为 ZCode（技能在`.zcode/skills/`）。

### 安装/升级（uv 管理）

```sh
# 安装指定版本（当前项目使用 0.15.1）
$ uv tool install specify-cli==0.15.1
# 升级到最新版
$ uv tool upgrade specify-cli
# 版本与健康自检
$ specify self check
```

升级 specify 后刷新项目模板：

```sh
$ specify init --here --integration zcode --force --ignore-agent-tools --script py
```

### 迭代工作流

在 ZCode 中依次执行技能命令，规格产物存放在`specs/`目录并提交 git：

1. `$speckit-constitution` — 项目原则（已完成，见`.specify/memory/constitution.md`）
2. `$speckit-specify` — 新需求写规格（关注 what/why）
3. `$speckit-clarify`（可选）— 结构化提问澄清规格
4. `$speckit-plan` — 技术方案与架构
5. `$speckit-tasks` — 任务拆解
6. `$speckit-analyze`（可选）— 跨产物一致性检查
7. `$speckit-implement` — 按任务实现
8. `$speckit-converge` — 对照规格检查收敛，未完成项追加为任务
