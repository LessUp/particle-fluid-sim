# 2026-03-22 GitHub Pages 优化

## 修改内容
- 新增 `.github/workflows/pages.yml`，用于自动发布到 GitHub Pages。
- 在 `vite.config.ts` 中增加 `VITE_BASE_PATH` 支持，确保子路径部署时资源地址正确。
- 将 `index.html` 入口脚本改为相对路径，兼容 Pages 仓库子目录。

## 验证说明
- 已检查源码中无明显绝对根路径资源引用。
- 本地构建未执行成功，当前环境缺少 `tsc`/`vite` 命令；CI 构建阶段会安装依赖并验证。
