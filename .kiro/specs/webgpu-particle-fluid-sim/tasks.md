# Implementation Plan: WebGPU Particle Fluid Simulation

## Overview

本实现计划将 WebGPU 粒子流体模拟系统分解为可执行的编码任务。采用增量开发方式，每个任务都建立在前一个任务的基础上，确保代码始终可运行。

使用 Vite + TypeScript 作为开发环境，fast-check 作为属性测试库。

## Tasks

- [x] 1. 项目初始化和基础结构
  - [x] 1.1 使用 Vite 创建 TypeScript 项目
    - 运行 `npm create vite@latest . -- --template vanilla-ts`
    - 安装依赖 `npm install`
    - 配置 TypeScript 支持 WebGPU 类型
    - _Requirements: 1.1_

  - [x] 1.2 创建项目目录结构
    - 创建 `src/core/` 目录存放核心模块
    - 创建 `src/shaders/` 目录存放 WGSL 着色器
    - 创建 `src/types.ts` 定义类型接口
    - _Requirements: 1.1_

- [x] 2. WebGPU 初始化模块
  - [x] 2.1 实现 WebGPU 设备初始化
    - 创建 `src/core/webgpu.ts`
    - 实现 `initWebGPU()` 函数获取 adapter 和 device
    - 实现错误处理和用户提示
    - _Requirements: 1.1, 1.2, 1.4_

  - [x] 2.2 实现 Canvas 配置
    - 配置 canvas 全屏自适应
    - 监听 window resize 事件
    - 配置 GPUCanvasContext
    - _Requirements: 1.3_

- [x] 3. 粒子数据管理模块
  - [x] 3.1 实现粒子物理逻辑（可测试模块）
    - 创建 `src/core/physics.ts`
    - 实现 `updateParticle()` 纯函数（与 shader 逻辑一致）
    - 实现 `applyGravity()`, `applyBoundaryBounce()`, `applyRepulsion()` 函数
    - _Requirements: 3.1, 3.2, 3.4, 4.2, 4.3_

  - [x] 3.2 编写物理模块属性测试
    - **Property 3: Physics Update Correctness**
    - **Property 4: Boundary Bounce Behavior**
    - **Property 5: Repulsion Force Application**
    - **Validates: Requirements 3.1, 3.2, 3.4, 4.2, 4.3**

  - [x] 3.3 实现 Buffer 创建和初始化
    - 创建 `src/core/buffers.ts`
    - 实现 `createParticleBuffer()` 创建 10,000 粒子的 storage buffer
    - 实现 `createUniformBuffer()` 创建 uniform buffer
    - 实现 `initializeParticles()` 随机初始化粒子位置和速度
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.4 编写粒子初始化属性测试
    - **Property 2: Particle Initialization Bounds**
    - **Validates: Requirements 2.3**

- [x] 4. Checkpoint - 确保基础模块测试通过
  - 运行所有测试确保通过
  - 如有问题请询问用户

- [x] 5. Shader 实现
  - [x] 5.1 实现 Compute Shader
    - 创建 `src/shaders/compute.wgsl`
    - 实现粒子位置更新逻辑
    - 实现边界反弹逻辑
    - 实现鼠标排斥力逻辑
    - 实现重力效果
    - _Requirements: 3.1, 3.2, 3.4, 4.2, 4.3_

  - [x] 5.2 实现 Render Shaders
    - 创建 `src/shaders/render.wgsl`
    - 实现 Vertex Shader（粒子位置转 NDC）
    - 实现 Fragment Shader（速度-颜色映射）
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 5.3 实现颜色映射逻辑（可测试模块）
    - 创建 `src/core/color.ts`
    - 实现 `velocityToColor()` 纯函数
    - _Requirements: 5.2, 5.3_

  - [x] 5.4 编写颜色映射属性测试
    - **Property 6: Velocity-Based Color Mapping**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 5.5 实现拖尾效果 Shader
    - 创建 `src/shaders/trail.wgsl`
    - 实现全屏四边形顶点着色器
    - 实现半透明黑色片段着色器
    - _Requirements: 6.1, 6.2_

- [x] 6. Pipeline 创建
  - [x] 6.1 实现 Compute Pipeline
    - 创建 `src/core/pipelines.ts`
    - 创建 compute shader module
    - 创建 compute pipeline 和 bind group layout
    - _Requirements: 3.3_

  - [x] 6.2 实现 Render Pipeline
    - 创建 render shader module
    - 配置 render pipeline（点图元、混合模式）
    - 创建 bind group
    - _Requirements: 5.1_

  - [x] 6.3 实现 Trail Pipeline
    - 创建 trail shader module
    - 配置 trail pipeline（三角形带、alpha 混合）
    - _Requirements: 6.2_

- [x] 7. 渲染循环和交互
  - [x] 7.1 实现鼠标交互
    - 创建 `src/core/input.ts`
    - 监听 mousemove 事件
    - 实现 `updateMousePosition()` 更新 uniform buffer
    - _Requirements: 4.1_

  - [x] 7.2 实现渲染循环
    - 创建 `src/core/renderer.ts`
    - 实现 `render()` 函数
    - 按顺序执行：更新 uniforms → Compute pass → Trail pass → Render pass
    - 使用 requestAnimationFrame 循环
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 8. 主程序集成
  - [x] 8.1 整合所有模块
    - 更新 `src/main.ts`
    - 初始化 WebGPU
    - 创建 buffers 和 pipelines
    - 启动渲染循环
    - _Requirements: 1.1, 7.1_

  - [x] 8.2 添加 HTML 和样式
    - 更新 `index.html` 添加 canvas 元素
    - 添加全屏样式和错误提示样式
    - _Requirements: 1.3_

- [x] 9. Final Checkpoint - 确保所有测试通过
  - 运行所有属性测试和单元测试
  - 验证视觉效果（粒子运动、反弹、拖尾、鼠标交互）
  - 如有问题请询问用户

## Notes

- 所有测试任务均为必做，确保代码正确性
- 每个任务都引用了具体的需求条款以确保可追溯性
- Checkpoint 任务用于增量验证
- 属性测试验证核心物理和颜色逻辑的正确性
- Shader 逻辑与 TypeScript 模块保持一致，便于测试
