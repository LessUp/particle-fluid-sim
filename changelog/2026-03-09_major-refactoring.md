# Major Refactoring - v2.0.0

Date: 2026-03-09

## Bug Fixes

### setupCanvas memory leak (Critical)
- `setupCanvas()` added a new `resize` event listener every time it was called
- Since `main.ts` called it on every window resize, listeners accumulated without bound
- Fixed: `setupCanvas()` now only sets canvas dimensions; caller handles resize events

### Duplicate resize handlers
- Both `setupCanvas()` AND `main.ts` were adding their own `resize` listeners
- Fixed: single named handler in `main.ts`, `setupCanvas()` is a pure size-setter

## Physics Improvements

### Frame-rate independent physics (Critical)
- Physics simulation was entirely frame-rate dependent — gravity, forces, and position updates were applied per-frame with no time scaling
- At 30 FPS the simulation ran at half speed vs 60 FPS
- Added `deltaTime` to:
  - `Uniforms` type (new `deltaTime` field with padding for 16-byte alignment)
  - Uniform buffer (expanded from 16 to 32 bytes)
  - WGSL compute shader `Uniforms` struct
  - `Renderer.loop()` — calculates real dt from `requestAnimationFrame` timestamps
- All physics now scales by dt: `velocity += gravity * dt`, `position += velocity * dt`, `force * dt`
- Constants rescaled to per-second units (GRAVITY: 0.1→600 px/s², REPULSION: 50→3000 px/s)
- deltaTime capped at 50ms to prevent physics explosion when tab is backgrounded

### Velocity clamping
- Added `MAX_SPEED = 800 px/s` in compute shader
- Particles that exceed max speed are clamped to prevent explosion from accumulated forces

## Mobile/Touch Improvements

### Touch scroll prevention
- Added `event.preventDefault()` in `touchmove` handler to prevent page scrolling on mobile
- Used `{ passive: false }` option for the touchmove listener (required for preventDefault to work in Chrome)

## Renderer Improvements

### Proper render loop timing
- `Renderer.start()` now uses `requestAnimationFrame` instead of calling `loop()` directly
- `loop()` receives proper timestamp from rAF for accurate dt calculation
- `lastFrameTime` reset on start for clean first-frame dt

## Version
- Bumped from 1.0.0 to 2.0.0
