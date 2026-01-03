// Particle data structure (matches WGSL struct)
export interface Particle {
  x: number;      // position x
  y: number;      // position y
  vx: number;     // velocity x
  vy: number;     // velocity y
}

// 2D Vector type
export interface Vec2 {
  x: number;
  y: number;
}

// Uniform data structure
export interface Uniforms {
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
}

// WebGPU context after initialization
export interface WebGPUContext {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  canvas: HTMLCanvasElement;
}

// Buffer collection
export interface ParticleBuffers {
  particleBuffer: GPUBuffer;
  uniformBuffer: GPUBuffer;
}

// Pipeline collection
export interface Pipelines {
  computePipeline: GPUComputePipeline;
  renderPipeline: GPURenderPipeline;
  trailPipeline: GPURenderPipeline;
  computeBindGroup: GPUBindGroup;
  renderBindGroup: GPUBindGroup;
}

// Color type (RGB, 0-1 range)
export interface Color {
  r: number;
  g: number;
  b: number;
}

// Constants
export const PARTICLE_COUNT = 10000;
export const PARTICLE_SIZE = 16; // 4 floats * 4 bytes
export const WORKGROUP_SIZE = 64;
export const REPULSION_RADIUS = 200;
export const GRAVITY: Vec2 = { x: 0.0, y: 0.1 };
export const DAMPING = 0.9;
