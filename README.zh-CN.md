# WebGPU 粒子流体仿真

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-005A9C?logo=webgpu&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)

[English](README.md) | 简体中文

使用 WebGPU 计算着色器的高性能粒子流体仿真。10,000 个粒子实时渲染，带物理仿真、鼠标交互和视觉拖尾效果。

## 特性

- **10,000 个粒子** — GPU 计算着色器实时仿真
- **鼠标交互** — 粒子被光标排斥
- **物理仿真** — 重力、速度、边界反弹
- **视觉效果** — 基于速度的颜色渐变和拖尾效果
- **性能监控** — 实时 FPS 显示
- **响应式** — 自适应窗口大小

## 快速开始

```bash
npm install
npm run dev
# 打开 http://localhost:5173
```

## 技术栈

- TypeScript + Vite
- WebGPU + WGSL 计算着色器
- Canvas 2D 渲染

## 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 113+ | ✅ 稳定 |
| Edge | 113+ | ✅ 稳定 |
| Firefox | Nightly | ⚠️ 需启用标志 |
| Safari | 17+ | ⚠️ 预览版 |

## 项目结构

```
├── src/
│   ├── main.ts          # 入口
│   ├── simulation.ts    # 粒子仿真逻辑
│   ├── renderer.ts      # WebGPU 渲染器
│   └── shaders/         # WGSL 计算着色器
├── index.html
└── vite.config.ts
```

## 许可证

MIT License
