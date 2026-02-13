# WebGPU Particle Fluid Simulation

A high-performance particle fluid simulation using WebGPU compute shaders. This project demonstrates heterogeneous computing with 10,000 particles rendered in real-time with physics simulation, mouse interaction, and visual trail effects.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-005A9C?logo=webgpu&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)

## Features

- 🚀 **10,000 particles** simulated in real-time using GPU compute shaders
- 🎯 **Mouse interaction** - particles are repelled by the cursor
- 🌊 **Physics simulation** - gravity, velocity, and boundary bouncing
- ✨ **Visual effects** - color gradients based on velocity and trail effects
- 📱 **Responsive** - fullscreen canvas that adapts to window size
- 🧪 **Well tested** - property-based testing with fast-check

## Requirements

- Node.js 18+
- A browser with WebGPU support (Chrome 113+, Edge 113+)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in a WebGPU-enabled browser
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Open Vitest UI |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
src/
├── core/                 # Core modules
│   ├── buffers.ts       # GPU buffer management
│   ├── color.ts         # Velocity-to-color mapping
│   ├── input.ts         # Mouse input handling
│   ├── physics.ts       # Physics calculations (testable)
│   ├── pipelines.ts     # WebGPU pipeline creation
│   ├── renderer.ts      # Render loop
│   └── webgpu.ts        # WebGPU initialization
├── shaders/             # WGSL shaders
│   ├── compute.wgsl     # Particle physics compute shader
│   ├── render.wgsl      # Particle rendering shaders
│   └── trail.wgsl       # Trail effect shader
├── types.ts             # TypeScript interfaces and constants
├── main.ts              # Application entry point
└── style.css            # Styles
```

## Architecture

The simulation uses a heterogeneous computing model:

- **CPU (TypeScript)**: Initialization, event handling, data transfer coordination
- **GPU (WGSL)**: Particle physics computation and rendering

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        CPU (Host)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Init    │  │  Mouse   │  │  Render  │  │  Data    │   │
│  │  WebGPU  │  │  Events  │  │  Loop    │  │ Transfer │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       GPU (Device)                          │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │   Compute Pass      │  │      Render Pass            │  │
│  │  ┌───────────────┐  │  │  ┌─────────┐  ┌─────────┐  │  │
│  │  │ Physics       │  │  │  │ Vertex  │  │Fragment │  │  │
│  │  │ Gravity       │  │  │  │ Shader  │  │ Shader  │  │  │
│  │  │ Repulsion     │  │  │  └─────────┘  └─────────┘  │  │
│  │  │ Boundaries    │  │  │                            │  │
│  │  └───────────────┘  │  │  Trail Effect + Blending   │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Testing

The project uses property-based testing with [fast-check](https://github.com/dubzzz/fast-check) to verify correctness properties:

- **Property 2**: Particle initialization bounds
- **Property 3**: Physics update correctness
- **Property 4**: Boundary bounce behavior
- **Property 5**: Repulsion force application
- **Property 6**: Velocity-based color mapping

Run tests:

```bash
npm test
```

## Configuration

### Particle Count

Edit `src/types.ts` to change the number of particles:

```typescript
export const PARTICLE_COUNT = 10000;
```

### Physics Parameters

```typescript
export const GRAVITY: Vec2 = { x: 0.0, y: 0.1 };
export const DAMPING = 0.9;
export const REPULSION_RADIUS = 200;
```

## Browser Support

WebGPU is required. Check [caniuse.com/webgpu](https://caniuse.com/webgpu) for current browser support.

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 113+ |
| Edge | 113+ |
| Firefox | Behind flag |
| Safari | 17+ (macOS 14+) |

## License

MIT
