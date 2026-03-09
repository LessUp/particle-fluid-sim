# WebGPU 粒子流体仿真

[English](README.md) | 简体中文

使用 WebGPU 计算着色器的高性能粒子流体仿真。10,000 个粒子实时渲染，全部物理计算（重力、排斥、边界反弹）在 GPU 上完成，支持鼠标/触屏交互、基于速度的颜色映射和视觉拖尾效果。

[![CI](https://github.com/LessUp/particle-fluid-sim/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/particle-fluid-sim/actions/workflows/ci.yml)
[![Pages](https://github.com/LessUp/particle-fluid-sim/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/particle-fluid-sim/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-005A9C?logo=webgpu&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

## 特性

- **GPU 计算物理** — 所有粒子仿真在 WebGPU 计算着色器 (WGSL) 中运行，CPU 零物理开销
- **帧率无关** — 物理按 `deltaTime` 缩放，任何帧率下行为一致
- **鼠标 / 触屏交互** — 粒子被光标或触点实时排斥
- **视觉拖尾效果** — 通过独立的 trail 着色器渲染运动轨迹
- **速度颜色映射** — 动态 HSL 颜色渐变反映粒子速度
- **速度钳制** — `MAX_SPEED = 800 px/s` 防止物理爆炸
- **响应式全屏** — 自适应窗口大小，无内存泄漏的 resize 处理
- **属性测试** — 使用 [fast-check](https://github.com/dubzzz/fast-check) 验证正确性

## 环境要求

- Node.js 18+
- 支持 WebGPU 的浏览器（Chrome 113+、Edge 113+、Safari 17+）

## 快速开始

```bash
npm install
npm run dev
# 在 WebGPU 浏览器中打开 http://localhost:5173
```

## 架构

仿真采用 **异构计算模型** — CPU 负责初始化、事件处理和渲染循环协调，GPU 执行所有物理计算和渲染：

```
┌──────────────────────────────────────────────────────────┐
│                     CPU  (TypeScript)                      │
│  初始化 WebGPU  ·  鼠标/触屏  ·  渲染循环  ·  Uniforms   │
└───────────────────────────┬──────────────────────────────┘
                            │  Uniform Buffer (deltaTime,
                            │  鼠标位置, 画布尺寸)
┌───────────────────────────▼──────────────────────────────┐
│                      GPU  (WGSL)                          │
│                                                           │
│  ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │   Compute Pass      │    │      Render Pass         │ │
│  │  ┌───────────────┐  │    │  ┌────────┐ ┌─────────┐ │ │
│  │  │ 重力 ×dt      │  │    │  │ 顶点   │ │片段     │ │ │
│  │  │ 排斥力 ×dt    │  │    │  │ 着色器 │ │着色器   │ │ │
│  │  │ 速度钳制      │  │    │  └────────┘ └─────────┘ │ │
│  │  │ 边界反弹      │  │    │                         │ │
│  │  └───────────────┘  │    │  拖尾 Pass + 混合       │ │
│  └─────────────────────┘    └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### 渲染管线

每帧按顺序执行三个 GPU pass：

| Pass | 着色器 | 用途 |
|------|--------|------|
| **Compute** | `compute.wgsl` | 更新粒子位置和速度 |
| **Trail** | `trail.wgsl` | 淡化前一帧，产生运动拖尾效果 |
| **Render** | `render.wgsl` | 绘制粒子点，基于速度着色 |

## 项目结构

```
src/
├── core/
│   ├── buffers.ts        # GPU 缓冲区创建与管理
│   ├── color.ts          # 速度 → HSL 颜色映射
│   ├── input.ts          # 鼠标和触屏输入处理
│   ├── physics.ts        # CPU 端物理（可测试参考实现）
│   ├── pipelines.ts      # WebGPU 计算 + 渲染管线配置
│   ├── renderer.ts       # 帧循环与 deltaTime 计算
│   └── webgpu.ts         # WebGPU 设备/适配器初始化
├── shaders/
│   ├── compute.wgsl      # 粒子物理计算着色器
│   ├── render.wgsl       # 粒子顶点 + 片段着色器
│   └── trail.wgsl        # 拖尾淡出效果着色器
├── types.ts              # 接口、常量、物理参数
├── main.ts               # 应用入口
└── style.css             # 全屏画布样式
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (Vite) |
| `npm run build` | TypeScript 检查 + 生产构建 |
| `npm test` | 运行属性测试 (Vitest) |
| `npm run test:coverage` | 覆盖率报告 (v8) |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | TypeScript 严格类型检查 |
| `npm run format` | Prettier 格式化 |

## 测试

使用 [fast-check](https://github.com/dubzzz/fast-check) 属性测试验证仿真正确性：

| 属性 | 验证内容 |
|------|----------|
| 初始化边界 | 所有粒子在画布范围内生成 |
| 物理更新 | 重力、速度、位置积分 |
| 边界反弹 | 粒子在画布边缘正确反射 |
| 排斥力 | 鼠标排斥方向与强度 |
| 颜色映射 | 速度 → 颜色梯度单调性 |

测试文件与源码共存：`buffers.test.ts`、`color.test.ts`、`physics.test.ts`、`types.test.ts`。

## 物理参数

| 参数 | 值 | 单位 |
|------|-----|------|
| 粒子数量 | 10,000 | — |
| 重力加速度 | 600 | px/s² |
| 阻尼系数 | 0.9 | — |
| 排斥半径 | 200 | px |
| 排斥强度 | 3,000 | px/s |
| 最大速度 | 800 | px/s |
| DeltaTime 上限 | 50 | ms |

## 技术栈

| 类别 | 技术 |
|------|------|
| GPU API | WebGPU + WGSL 计算着色器 |
| 语言 | TypeScript 5.6（严格模式） |
| 构建 | Vite 6 |
| 渲染 | WebGPU 渲染管线 + Canvas |
| 测试 | Vitest + fast-check（属性测试） |
| 代码规范 | ESLint + Prettier |
| CI | GitHub Actions |

## 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 113+ | 稳定 |
| Edge | 113+ | 稳定 |
| Safari | 17+（macOS 14+） | 稳定 |
| Firefox | Nightly | 需启用标志 |

查看 [caniuse.com/webgpu](https://caniuse.com/webgpu) 获取最新支持状态。

## 许可证

MIT — [项目主页](https://lessup.github.io/particle-fluid-sim/)
