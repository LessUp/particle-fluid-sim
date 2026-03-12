# Lockfile CI 同步修复

日期：2026-03-13

## 变更内容

- 重新生成并同步 `package-lock.json`
- 让 lockfile 补回 `typescript-eslint` 相关依赖与当前 `package.json` 的版本声明一致
- 顺手修复 `src/core/physics.ts` 中会阻塞 ESLint 的 `prefer-const` 错误
- 继续保留主线 CI 使用 `npm ci`、lint、typecheck、test 与 build 的验收方式

## 背景

该仓库此前在 GitHub Actions 中因 `package.json` 与 `package-lock.json` 漂移而使 `npm ci` 直接失败，导致整条前端验收链路被安装阶段拦截。本次只同步锁文件，不改变工作流结构。
