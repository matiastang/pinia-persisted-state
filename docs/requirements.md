# 需求

pinia 插件的状态的本地持久化

## 说明

- 项目所有原始需求在 docs/requirements.md 文件中
- 使用 SpecKit 分析需求，并生成 SpecKit 文件
- 前端使用 **Vue + TypeScript + Vite** 实现。

## 开发基本要求

- 项目使用 git 来管理版本
- python使用uv来管理、使用pnpm来管理前端包
- 项目需要实现完整的测试，包括：单元测试（后端用 pytest、前端用 Vitest + Vue Test Utils）、集成测试、Use Case 测试、e2e 测试（用 Playwright）。
- 要实现 git commit 规范，包括 commitlint 和 husky。
- 项目需要实现 CI/CD，包括 GitHub Actions。先只做校验，不做自动部署，后面再考虑。
- 前端使用 TypeScript，并且需要使用 TypeScript 的类型系统来保证代码的类型安全。
- 项目 main 分支的 push、 PR 需要跑 CI 测试
- 需要先写测试，再写代码，测试驱动开发，开发完成后，测试通过，代码完成
- 每个版本的需求完成后，都需要做完整的**循环 code review 并修复中等严重及以上问题，直到没有中等严重问题**
- **重要** 每一个功能点一个 commit，不要把多个功能点放在一个 commit 中，这样不利于代码的维护和回滚
- 项目需要提供 GitHub Issue 模板，规范 issue 提交（如 Bug 报告、功能建议）
- 每个版本需要实现的功能，有不确定的可以问我。并且将我的回答或补充信息放到对应的版本（如：v0.0.1）信息的最后面。
- README.md文件需要有中文和英文版本，默认显示英文自述文档
- 需要有版本更新说明文件

## v0.3.0

给项目功能添加完整的的测试，考虑到各个方面的使用，如果发现问题要修复。

## v0.3.1

升级项目中的依赖matias-storage为最新版本（目前是0.3.0）

## v0.3.2

添加 GitHub CI：当推送 tag（vX.Y.Z）时自动发布/更新 npm 包。发布前需通过完整质量门禁（类型检查、构建、单元/集成测试、e2e），并校验 tag 与 package.json 版本一致；npm 凭证使用仓库 Secret（NPM_TOKEN），不在代码中存储。
