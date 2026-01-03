import { Pipelines, ParticleBuffers } from '../types';

// Import shader sources as strings
import computeShaderSource from '../shaders/compute.wgsl?raw';
import renderShaderSource from '../shaders/render.wgsl?raw';
import trailShaderSource from '../shaders/trail.wgsl?raw';

/**
 * Create the compute pipeline for particle physics
 */
export function createComputePipeline(
  device: GPUDevice
): { pipeline: GPUComputePipeline; bindGroupLayout: GPUBindGroupLayout } {
  const computeModule = device.createShaderModule({
    label: 'Compute Shader',
    code: computeShaderSource,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    label: 'Compute Bind Group Layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'storage' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: 'uniform' },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: 'Compute Pipeline Layout',
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createComputePipeline({
    label: 'Compute Pipeline',
    layout: pipelineLayout,
    compute: {
      module: computeModule,
      entryPoint: 'main',
    },
  });

  return { pipeline, bindGroupLayout };
}

/**
 * Create the render pipeline for particle rendering
 */
export function createRenderPipeline(
  device: GPUDevice,
  format: GPUTextureFormat
): { pipeline: GPURenderPipeline; bindGroupLayout: GPUBindGroupLayout } {
  const renderModule = device.createShaderModule({
    label: 'Render Shader',
    code: renderShaderSource,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    label: 'Render Bind Group Layout',
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'read-only-storage' },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.VERTEX,
        buffer: { type: 'uniform' },
      },
    ],
  });

  const pipelineLayout = device.createPipelineLayout({
    label: 'Render Pipeline Layout',
    bindGroupLayouts: [bindGroupLayout],
  });

  const pipeline = device.createRenderPipeline({
    label: 'Render Pipeline',
    layout: pipelineLayout,
    vertex: {
      module: renderModule,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module: renderModule,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one',
            },
          },
        },
      ],
    },
    primitive: {
      topology: 'point-list',
    },
  });

  return { pipeline, bindGroupLayout };
}

/**
 * Create the trail pipeline for fade effect
 */
export function createTrailPipeline(
  device: GPUDevice,
  format: GPUTextureFormat
): GPURenderPipeline {
  const trailModule = device.createShaderModule({
    label: 'Trail Shader',
    code: trailShaderSource,
  });

  const pipeline = device.createRenderPipeline({
    label: 'Trail Pipeline',
    layout: 'auto',
    vertex: {
      module: trailModule,
      entryPoint: 'vertexMain',
    },
    fragment: {
      module: trailModule,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one',
            },
          },
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
    },
  });

  return pipeline;
}

/**
 * Create all pipelines and bind groups
 */
export function createPipelines(
  device: GPUDevice,
  format: GPUTextureFormat,
  buffers: ParticleBuffers
): Pipelines {
  // Create pipelines
  const { pipeline: computePipeline, bindGroupLayout: computeBindGroupLayout } =
    createComputePipeline(device);

  const { pipeline: renderPipeline, bindGroupLayout: renderBindGroupLayout } =
    createRenderPipeline(device, format);

  const trailPipeline = createTrailPipeline(device, format);

  // Create bind groups
  const computeBindGroup = device.createBindGroup({
    label: 'Compute Bind Group',
    layout: computeBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: buffers.particleBuffer } },
      { binding: 1, resource: { buffer: buffers.uniformBuffer } },
    ],
  });

  const renderBindGroup = device.createBindGroup({
    label: 'Render Bind Group',
    layout: renderBindGroupLayout,
    entries: [
      { binding: 0, resource: { buffer: buffers.particleBuffer } },
      { binding: 1, resource: { buffer: buffers.uniformBuffer } },
    ],
  });

  return {
    computePipeline,
    renderPipeline,
    trailPipeline,
    computeBindGroup,
    renderBindGroup,
  };
}
