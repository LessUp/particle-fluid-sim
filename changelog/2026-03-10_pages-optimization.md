# GitHub Pages 彻底优化

日期：2026-03-10

## 变更内容

### _config.yml
- 添加 SEO 元数据（url、baseurl、lang）
- 添加 exclude 列表，排除 node_modules、src、dist、coverage 等无关文件，加速 Jekyll 构建

### pages.yml
- 修复 paths 触发过滤：添加 `index.md`、`changelog/**`，移除不存在的 `docs/**`
- 修复 sparse-checkout：明确列出实际 .md 文件（index.md、README.md、README.zh-CN.md、CONTRIBUTING.md），移除通配符 `*.md` 和不存在的 docs 目录

### index.md（GitHub Pages 首页）
- 重写为专业项目主页
- 添加 CI / Pages 状态徽章
- 补充帧率无关物理、速度钳制、触屏支持等新特性
- 扩展架构图：标注 Uniform Buffer 数据流、deltaTime 缩放
- 新增渲染管线表（Compute → Trail → Render 三 pass 说明）
- 新增物理参数表（重力、阻尼、排斥力、最大速度等）
- 新增浏览器兼容性表
- 补充测试文件共存说明
- 修正 Vite 版本徽章（5 → 6）

### README.md
- 添加 CI / Pages 状态徽章
- 修正 Vite 版本徽章（5 → 6）
- 修复测试属性列表：移除错误编号（Property 2-6），改为描述性标题
- Requirements 补充 Safari 17+
- License 添加项目主页链接

### README.zh-CN.md
- 从简略版（58 行）重写为完整版（159 行），与英文 README 对齐
- 添加 CI / Pages 状态徽章
- 新增：环境要求、架构图（中文标注）、渲染管线表、完整项目结构、命令表、测试表、物理参数表、技术栈表
- 修正过时内容：移除不存在的 simulation.ts、修正 "Canvas 2D 渲染" 为 WebGPU 渲染管线
- 修正 Safari 状态（预览版 → 稳定）

### .gitignore
- 添加 `.cache/` 和 `.vitest/` 目录
