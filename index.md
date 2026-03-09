---
layout: default
title: Particle Fluid Simulation
---

# WebGPU Particle Fluid Simulation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-005A9C?logo=webgpu&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

A high-performance particle fluid simulation running **10,000 particles in real-time** using WebGPU compute shaders. Features physics simulation with gravity and mouse interaction, velocity-based color mapping, and visual trail effects — all computed on the GPU.

## Key Features

- **GPU Compute Physics** — All particle simulation runs in WebGPU compute shaders (WGSL)
- **Mouse Interaction** — Particles are repelled by cursor movement in real-time
- **Visual Trail Effects** — Motion trails rendered via a separate trail shader pass
- **Velocity-Based Coloring** — Dynamic color gradients reflect particle speed
- **Responsive Fullscreen** — Adapts to any window size automatically
- **Property-Based Testing** — Correctness verified with [fast-check](https://github.com/dubzzz/fast-check)

## Architecture

The simulation uses a **heterogeneous computing model** — the CPU handles initialization and event coordination while the GPU performs all physics and rendering:

```
┌─────────────────────────────────────────────────────────┐
│                    CPU  (TypeScript)                     │
│  Init WebGPU  ·  Mouse Events  ·  Render Loop  ·  Data │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│                    GPU  (WGSL)                           │
│  ┌───────────────────┐    ┌───────────────────────────┐ │
│  │   Compute Pass    │    │      Render Pass          │ │
│  │  Gravity          │    │  Vertex + Fragment Shader │ │
│  │  Repulsion        │    │  Trail Effect + Blending  │ │
│  │  Boundary Bounce  │    │                           │ │
│  └───────────────────┘    └───────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:5173 in a WebGPU-enabled browser
```

> **Requires** WebGPU support: Chrome 113+, Edge 113+, Safari 18+.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm test` | Run property-based tests |
| `npm run test:coverage` | Coverage report |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript type check |

## Testing

Correctness properties verified via fast-check:

| Property | What It Verifies |
|----------|-----------------|
| Initialization bounds | All particles spawn within canvas |
| Physics update | Gravity, velocity, position integration |
| Boundary bounce | Particles reflect correctly at edges |
| Repulsion force | Mouse repulsion direction and magnitude |
| Color mapping | Velocity → color gradient is monotonic |

## Tech Stack

| Category | Technology |
|----------|------------|
| GPU | WebGPU + WGSL |
| Language | TypeScript 5.6 |
| Build | Vite 5 |
| Rendering | WebGPU render pipeline + Canvas |
| Testing | Vitest + fast-check |
| Linting | ESLint + Prettier |

---

[View on GitHub](https://github.com/LessUp/particle-fluid-sim) · [README](README.md)
