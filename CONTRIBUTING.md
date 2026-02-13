# Contributing

感谢你对本项目的关注！欢迎通过 Issue 和 Pull Request 参与贡献。

## 开发流程

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m "feat: add your feature"`
4. 推送分支：`git push origin feature/your-feature`
5. 创建 Pull Request

## 开发与测试

```bash
npm install
npm run dev      # 启动开发服务器
npm test         # 运行测试
npm run lint     # 代码检查
npm run format   # 代码格式化
```

## 代码规范

- TypeScript 代码遵循 ESLint 配置
- 使用 `.editorconfig` 和 Prettier 统一格式
- 新增功能请附带属性测试（fast-check）
- 确保所有现有测试通过

## 提交信息格式

推荐使用 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `perf:` 性能优化
- `test:` 测试相关
