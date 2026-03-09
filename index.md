---
layout: default
title: Particle Fluid Simulation
---

# WebGPU Particle Fluid Simulation

10K 粒子实时流体仿真 — 基于 WebGPU Compute Shader，支持拖尾效果和实时交互。

## 核心特性

- **WebGPU Compute Shader** — GPU 并行粒子物理计算
- **SPH 流体模拟** — Smoothed Particle Hydrodynamics 算法
- **拖尾效果** — 粒子运动轨迹可视化
- **实时交互** — 鼠标吸引/排斥粒子
- **参数可调** — 粘度、密度、重力等参数实时调节

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

> 需要支持 WebGPU 的浏览器（Chrome 113+, Edge 113+）。

## 技术栈

| 类别 | 技术 |
|------|------|
| GPU | WebGPU + WGSL |
| 语言 | TypeScript |
| 构建 | Vite |
| 渲染 | Canvas 2D / WebGPU |

## 链接

- [GitHub 仓库](https://github.com/LessUp/particle-fluid-sim)
- [README](README.md)
