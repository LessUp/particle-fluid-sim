import { WebGPUContext } from '../types';

/**
 * Display error message to user
 */
export function showError(message: string): void {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #1a1a2e; color: #ff6b6b;
    padding: 20px; border-radius: 8px;
    font-family: monospace; text-align: center;
    max-width: 80%; z-index: 1000;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
}

/**
 * Initialize WebGPU and return context
 */
export async function initWebGPU(canvas: HTMLCanvasElement): Promise<WebGPUContext> {
  // Check WebGPU support
  if (!navigator.gpu) {
    showError('WebGPU is not supported. Please use Chrome 113+ or Edge 113+.');
    throw new Error('WebGPU not supported');
  }

  // Request adapter
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    showError('Failed to get GPU adapter. Your GPU may not support WebGPU.');
    throw new Error('No GPU adapter found');
  }

  // Request device
  const device = await adapter.requestDevice();
  if (!device) {
    showError('Failed to get GPU device.');
    throw new Error('No GPU device found');
  }

  // Handle device lost
  device.lost.then((info) => {
    console.error('WebGPU device lost:', info.message);
    if (info.reason !== 'destroyed') {
      showError('GPU device lost. Please refresh the page.');
    }
  });

  // Get canvas context
  const context = canvas.getContext('webgpu');
  if (!context) {
    showError('Failed to get WebGPU canvas context.');
    throw new Error('No WebGPU context');
  }

  // Get preferred format
  const format = navigator.gpu.getPreferredCanvasFormat();

  // Configure context
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  return { adapter, device, context, format, canvas };
}

/**
 * Set canvas to current window size (call on init and on resize)
 */
export function setupCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Reconfigure context after resize
 */
export function reconfigureContext(ctx: WebGPUContext): void {
  ctx.context.configure({
    device: ctx.device,
    format: ctx.format,
    alphaMode: 'premultiplied',
  });
}
