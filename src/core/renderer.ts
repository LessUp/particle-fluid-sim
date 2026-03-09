import { WebGPUContext, Pipelines, ParticleBuffers, Vec2, PARTICLE_COUNT, WORKGROUP_SIZE } from '../types';
import { updateUniformBuffer } from './buffers';

/**
 * Renderer class manages the render loop
 */
export class Renderer {
  private ctx: WebGPUContext;
  private pipelines: Pipelines;
  private buffers: ParticleBuffers;
  private getMousePosition: () => Vec2;
  private onFrame?: () => void;
  private animationId: number | null = null;
  private isRunning = false;
  private lastFrameTime = 0;

  constructor(
    ctx: WebGPUContext,
    pipelines: Pipelines,
    buffers: ParticleBuffers,
    getMousePosition: () => Vec2,
    onFrame?: () => void
  ) {
    this.ctx = ctx;
    this.pipelines = pipelines;
    this.buffers = buffers;
    this.getMousePosition = getMousePosition;
    this.onFrame = onFrame;
  }

  /**
   * Start the render loop
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = 0;
    this.animationId = requestAnimationFrame(this.loop);
  }

  /**
   * Stop the render loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Main render loop
   */
  private loop = (timestamp: number): void => {
    if (!this.isRunning) return;

    // Calculate deltaTime in seconds, capped to prevent spiral of death
    const dt = this.lastFrameTime === 0
      ? 1.0 / 60.0
      : Math.min((timestamp - this.lastFrameTime) / 1000.0, 0.05);
    this.lastFrameTime = timestamp;

    this.render(dt);
    this.onFrame?.();
    this.animationId = requestAnimationFrame(this.loop);
  };

  /**
   * Render a single frame
   */
  private render(deltaTime: number): void {
    const { device, context, canvas } = this.ctx;
    const { computePipeline, renderPipeline, trailPipeline, computeBindGroup, renderBindGroup } =
      this.pipelines;

    // Update uniforms with current canvas size, mouse position, and deltaTime
    const mousePos = this.getMousePosition();
    updateUniformBuffer(
      device,
      this.buffers.uniformBuffer,
      canvas.width,
      canvas.height,
      mousePos.x,
      mousePos.y,
      deltaTime
    );

    // Get current texture to render to
    const textureView = context.getCurrentTexture().createView();

    // Create command encoder
    const commandEncoder = device.createCommandEncoder({
      label: 'Main Command Encoder',
    });

    // === Compute Pass ===
    const computePass = commandEncoder.beginComputePass({
      label: 'Compute Pass',
    });
    computePass.setPipeline(computePipeline);
    computePass.setBindGroup(0, computeBindGroup);
    // Dispatch enough workgroups to cover all particles
    const workgroupCount = Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE);
    computePass.dispatchWorkgroups(workgroupCount);
    computePass.end();

    // === Trail Pass (fade effect) ===
    const trailPass = commandEncoder.beginRenderPass({
      label: 'Trail Pass',
      colorAttachments: [
        {
          view: textureView,
          loadOp: 'load', // Keep previous frame
          storeOp: 'store',
        },
      ],
    });
    trailPass.setPipeline(trailPipeline);
    trailPass.draw(4); // Fullscreen quad (4 vertices)
    trailPass.end();

    // === Render Pass (particles) ===
    const renderPass = commandEncoder.beginRenderPass({
      label: 'Render Pass',
      colorAttachments: [
        {
          view: textureView,
          loadOp: 'load', // Keep trail effect
          storeOp: 'store',
        },
      ],
    });
    renderPass.setPipeline(renderPipeline);
    renderPass.setBindGroup(0, renderBindGroup);
    renderPass.draw(PARTICLE_COUNT); // One vertex per particle
    renderPass.end();

    // Submit commands
    device.queue.submit([commandEncoder.finish()]);
  }
}

/**
 * Create and return a renderer instance
 */
export function createRenderer(
  ctx: WebGPUContext,
  pipelines: Pipelines,
  buffers: ParticleBuffers,
  getMousePosition: () => Vec2,
  onFrame?: () => void
): Renderer {
  return new Renderer(ctx, pipelines, buffers, getMousePosition, onFrame);
}
