import { initWebGPU, setupCanvas, showError } from './core/webgpu';
import { createBuffers } from './core/buffers';
import { createPipelines } from './core/pipelines';
import { createMouseHandler } from './core/input';
import { createRenderer } from './core/renderer';
import { PARTICLE_COUNT } from './types';
import './style.css';

/**
 * Create FPS counter element
 */
function createFPSCounter(): { update: () => void; element: HTMLElement } {
  const element = document.createElement('div');
  element.id = 'fps-counter';
  element.innerHTML = `
    <div class="fps-value">-- FPS</div>
    <div class="particle-count">${PARTICLE_COUNT.toLocaleString()} particles</div>
  `;
  document.body.appendChild(element);

  let frameCount = 0;
  let lastTime = performance.now();

  return {
    element,
    update: () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastTime));
        element.querySelector('.fps-value')!.textContent = `${fps} FPS`;
        frameCount = 0;
        lastTime = now;
      }
    },
  };
}

/**
 * Create info overlay
 */
function createInfoOverlay(): HTMLElement {
  const element = document.createElement('div');
  element.id = 'info-overlay';
  element.innerHTML = `
    <h1>WebGPU Particle Fluid Simulation</h1>
    <p>Move your mouse to interact with particles</p>
    <p class="hint">Particles are repelled by the cursor</p>
  `;
  document.body.appendChild(element);

  // Fade out after 3 seconds
  setTimeout(() => {
    element.classList.add('fade-out');
  }, 3000);

  return element;
}

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  // Get canvas element
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  if (!canvas) {
    showError('Canvas element not found');
    return;
  }

  // Setup canvas for fullscreen
  setupCanvas(canvas);

  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'loading';
  loadingDiv.textContent = 'Initializing WebGPU...';
  document.body.appendChild(loadingDiv);

  try {
    // Initialize WebGPU
    console.log('Initializing WebGPU...');
    const ctx = await initWebGPU(canvas);
    console.log('WebGPU initialized successfully');

    // Create buffers
    console.log('Creating buffers...');
    const buffers = createBuffers(ctx.device, {
      x: canvas.width,
      y: canvas.height,
    });
    console.log('Buffers created');

    // Create pipelines
    console.log('Creating pipelines...');
    const pipelines = createPipelines(ctx.device, ctx.format, buffers);
    console.log('Pipelines created');

    // Remove loading indicator
    loadingDiv.remove();

    // Setup mouse input
    const mouseHandler = createMouseHandler(canvas);

    // Create FPS counter
    const fpsCounter = createFPSCounter();

    // Create info overlay
    createInfoOverlay();

    // Create renderer with FPS callback
    const renderer = createRenderer(
      ctx,
      pipelines,
      buffers,
      mouseHandler.getMousePosition,
      fpsCounter.update
    );

    // Handle window resize (single handler, no duplicates)
    const handleResize = () => {
      setupCanvas(canvas);
      ctx.context.configure({
        device: ctx.device,
        format: ctx.format,
        alphaMode: 'premultiplied',
      });
    };
    window.addEventListener('resize', handleResize);

    // Start render loop
    console.log('Starting render loop...');
    renderer.start();
    console.log('Particle simulation running!');

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      renderer.stop();
      mouseHandler.destroy();
    });

  } catch (error) {
    loadingDiv.remove();
    console.error('Failed to initialize:', error);
    if (error instanceof Error) {
      showError(`Initialization failed: ${error.message}`);
    }
  }
}

// Run main when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}
