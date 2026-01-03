# Requirements Document

## Introduction

WebGPU 粒子流体模拟系统 - 一个基于 WebGPU 和 TypeScript 的高性能粒子系统，利用 GPU 计算着色器实现万级粒子的实时物理模拟和渲染，包含边界反弹、鼠标交互排斥力和视觉拖尾效果。

## Glossary

- **WebGPU_System**: WebGPU 初始化和管理模块，负责 Adapter、Device、Context 的获取和配置
- **Particle_Buffer**: GPU 存储缓冲区，存储所有粒子的位置和速度数据
- **Compute_Shader**: GPU 计算着色器，并行执行粒子物理更新
- **Render_Pipeline**: 渲染管线，负责将粒子绘制到屏幕
- **Uniform_Buffer**: 统一缓冲区，用于传递全局参数（画布尺寸、鼠标位置等）

## Requirements

### Requirement 1: WebGPU 初始化

**User Story:** As a developer, I want the WebGPU system to be properly initialized, so that I can use GPU compute and rendering capabilities.

#### Acceptance Criteria

1. WHEN the application starts, THE WebGPU_System SHALL request and obtain a GPU adapter and device
2. WHEN the device is obtained, THE WebGPU_System SHALL configure the canvas context with the preferred format
3. WHEN the canvas is configured, THE WebGPU_System SHALL make the canvas fullscreen and responsive to window resize
4. IF WebGPU is not supported, THEN THE WebGPU_System SHALL display a clear error message to the user

### Requirement 2: 粒子数据管理

**User Story:** As a developer, I want to manage particle data efficiently on the GPU, so that I can simulate thousands of particles in real-time.

#### Acceptance Criteria

1. WHEN the system initializes, THE Particle_Buffer SHALL be created with capacity for 10,000 particles
2. THE Particle_Buffer SHALL store each particle's position (x, y) and velocity (vx, vy) as 32-bit floats
3. WHEN particles are initialized, THE Particle_Buffer SHALL assign random positions within canvas bounds and random velocities
4. THE Uniform_Buffer SHALL store canvas dimensions (width, height) and mouse position (mouseX, mouseY)

### Requirement 3: 粒子物理计算

**User Story:** As a user, I want particles to move and bounce realistically, so that the simulation feels physically plausible.

#### Acceptance Criteria

1. WHEN the Compute_Shader executes, THE Compute_Shader SHALL update each particle's position by adding its velocity
2. WHEN a particle's position exceeds canvas bounds (0 to width/height), THE Compute_Shader SHALL reverse the corresponding velocity component (bounce effect)
3. THE Compute_Shader SHALL use workgroup_size(64) for efficient parallel execution
4. WHEN gravity is enabled, THE Compute_Shader SHALL apply a constant downward acceleration to particle velocities

### Requirement 4: 鼠标交互

**User Story:** As a user, I want particles to react to my mouse cursor, so that I can interact with the simulation.

#### Acceptance Criteria

1. WHEN the mouse moves, THE WebGPU_System SHALL update the mouse position in the Uniform_Buffer
2. WHEN a particle is within 200 pixels of the mouse cursor, THE Compute_Shader SHALL apply a repulsion force away from the cursor
3. THE repulsion force SHALL be inversely proportional to the distance from the cursor (closer = stronger)

### Requirement 5: 粒子渲染

**User Story:** As a user, I want to see particles rendered as colored points, so that I can visualize the simulation.

#### Acceptance Criteria

1. WHEN rendering, THE Render_Pipeline SHALL draw each particle as a 2-pixel point
2. THE Render_Pipeline SHALL color particles based on their velocity magnitude (faster = brighter)
3. THE Render_Pipeline SHALL support color gradients from cyan to purple based on velocity

### Requirement 6: 视觉拖尾效果

**User Story:** As a user, I want particles to leave visual trails, so that the simulation looks more dynamic and appealing.

#### Acceptance Criteria

1. WHEN rendering a new frame, THE Render_Pipeline SHALL NOT clear the previous frame completely
2. THE Render_Pipeline SHALL draw a semi-transparent black rectangle (opacity 0.05) before rendering particles
3. THE trail effect SHALL cause previous particle positions to fade gradually over multiple frames

### Requirement 7: 渲染循环

**User Story:** As a developer, I want a stable render loop, so that the simulation runs smoothly at consistent frame rates.

#### Acceptance Criteria

1. THE WebGPU_System SHALL execute a render loop using requestAnimationFrame
2. WHEN each frame executes, THE WebGPU_System SHALL first run the Compute pass, then the Render pass
3. THE render loop SHALL continue until the application is closed or an error occurs
