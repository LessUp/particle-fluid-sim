---
layout: default
title: Particle Fluid Simulation
---

# WebGPU Particle Fluid Simulation

[![CI](https://github.com/LessUp/particle-fluid-sim/actions/workflows/ci.yml/badge.svg)](https://github.com/LessUp/particle-fluid-sim/actions/workflows/ci.yml)
[![Pages](https://github.com/LessUp/particle-fluid-sim/actions/workflows/pages.yml/badge.svg)](https://github.com/LessUp/particle-fluid-sim/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-005A9C?logo=webgpu&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

A high-performance particle fluid simulation running **10,000 particles in real-time** using WebGPU compute shaders. All physics — gravity, mouse repulsion, boundary bouncing — runs entirely on the GPU via WGSL compute shaders, with velocity-based color mapping and visual trail effects.

## Highlights

- **GPU Compute Physics** — All particle simulation runs in WebGPU compute shaders (WGSL), zero CPU physics
- **Frame-Rate Independent** — Physics scales by `deltaTime`, consistent behavior at any FPS
- **Mouse / Touch Interaction** — Particles are repelled by cursor or touch in real-time
- **Visual Trail Effects** — Motion trails rendered via a dedicated trail shader pass
- **Velocity-Based Coloring** — Dynamic HSL color gradients reflect particle speed
- **Velocity Clamping** — `MAX_SPEED = 800 px/s` prevents physics explosion
- **Responsive Fullscreen** — Adapts to any window size; proper resize handling without memory leaks
- **Property-Based Testing** — Correctness verified with [fast-check](https://github.com/dubzzz/fast-check)

## Architecture

The simulation uses a **heterogeneous computing model** — the CPU handles initialization, events, and render loop coordination while the GPU performs all physics computation and rendering:

```
┌──────────────────────────────────────────────────────────┐
│                     CPU  (TypeScript)                      │
│  Init WebGPU  ·  Mouse/Touch  ·  Render Loop  ·  Uniforms│
└───────────────────────────┬──────────────────────────────┘
                            │  Uniform Buffer (deltaTime,
                            │  mouse pos, canvas size)
┌───────────────────────────▼──────────────────────────────┐
│                      GPU  (WGSL)                          │
│                                                           │
│  ┌─────────────────────┐    ┌──────────────────────────┐ │
│  │   Compute Pass      │    │      Render Pass         │ │
│  │  ┌───────────────┐  │    │  ┌────────┐ ┌─────────┐ │ │
│  │  │ Gravity ×dt   │  │    │  │ Vertex │ │Fragment │ │ │
│  │  │ Repulsion ×dt │  │    │  │ Shader │ │ Shader  │ │ │
│  │  │ Velocity clamp│  │    │  └────────┘ └─────────┘ │ │
│  │  │ Boundary      │  │    │                         │ │
│  │  └───────────────┘  │    │  Trail Pass + Blending  │ │
│  └─────────────────────┘    └──────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Render Pipeline

Each frame executes three GPU passes in sequence:

| Pass | Shader | Purpose |
|------|--------|---------|
| **Compute** | `compute.wgsl` | Update particle positions and velocities |
| **Trail** | `trail.wgsl` | Fade previous frame for motion trail effect |
| **Render** | `render.wgsl` | Draw particles as points with velocity-based color |

## Project Structure

```
src/
├── core/
│   ├── buffers.ts        # GPU buffer creation and management
│   ├── color.ts          # Velocity → HSL color mapping
│   ├── input.ts          # Mouse and touch input handling
│   ├── physics.ts        # CPU-side physics (testable reference)
│   ├── pipelines.ts      # WebGPU compute + render pipeline setup
│   ├── renderer.ts       # Frame loop with deltaTime calculation
│   └── webgpu.ts         # WebGPU device/adapter initialization
├── shaders/
│   ├── compute.wgsl      # Particle physics compute shader
│   ├── render.wgsl       # Particle vertex + fragment shaders
│   └── trail.wgsl        # Trail fade-out effect shader
├── types.ts              # Interfaces, constants, physics parameters
├── main.ts               # Application entry point
└── style.css             # Fullscreen canvas styles
```

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173 in a WebGPU-enabled browser
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | TypeScript check + production build |
| `npm test` | Run property-based tests (Vitest) |
| `npm run test:coverage` | Coverage report (v8 provider) |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript strict type check |
| `npm run format` | Format with Prettier |

## Testing

Property-based testing with [fast-check](https://github.com/dubzzz/fast-check) verifies simulation correctness across random inputs:

| Property | What It Verifies |
|----------|-----------------|
| Initialization bounds | All particles spawn within canvas dimensions |
| Physics update | Gravity, velocity, and position integration |
| Boundary bounce | Particles reflect correctly at canvas edges |
| Repulsion force | Mouse repulsion direction and magnitude |
| Color mapping | Velocity → color gradient is monotonic |

Test files are co-located with source: `buffers.test.ts`, `color.test.ts`, `physics.test.ts`, `types.test.ts`.

## Physics Parameters

| Parameter | Value | Unit |
|-----------|-------|------|
| Particle count | 10,000 | — |
| Gravity | 600 | px/s² |
| Damping | 0.9 | — |
| Repulsion radius | 200 | px |
| Repulsion strength | 3,000 | px/s |
| Max speed | 800 | px/s |
| DeltaTime cap | 50 | ms |

All physics constants are defined in `src/types.ts` and the WGSL compute shader.

## Tech Stack

| Category | Technology |
|----------|------------|
| GPU API | WebGPU + WGSL compute shaders |
| Language | TypeScript 5.6 (strict mode) |
| Build | Vite 6 |
| Rendering | WebGPU render pipeline + Canvas |
| Testing | Vitest + fast-check (property-based) |
| Linting | ESLint + Prettier |
| CI | GitHub Actions |

## Browser Support

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 113+ | Stable |
| Edge | 113+ | Stable |
| Safari | 17+ (macOS 14+) | Stable |
| Firefox | Nightly | Behind flag |

Check [caniuse.com/webgpu](https://caniuse.com/webgpu) for latest support status.

---

[View on GitHub](https://github.com/LessUp/particle-fluid-sim) · [README](README.md) · [简体中文](README.zh-CN.md)
