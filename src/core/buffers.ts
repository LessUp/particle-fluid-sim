import { Vec2, ParticleBuffers, PARTICLE_COUNT, PARTICLE_SIZE } from '../types';

/**
 * Initialize particles with random positions and velocities
 */
export function initializeParticles(canvasSize: Vec2): Float32Array {
  const data = new Float32Array(PARTICLE_COUNT * 4); // 4 floats per particle

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const offset = i * 4;
    // Random position within canvas bounds
    data[offset + 0] = Math.random() * canvasSize.x;     // x
    data[offset + 1] = Math.random() * canvasSize.y;     // y
    // Random velocity (small values)
    data[offset + 2] = (Math.random() - 0.5) * 4;        // vx
    data[offset + 3] = (Math.random() - 0.5) * 4;        // vy
  }

  return data;
}

/**
 * Create particle storage buffer
 */
export function createParticleBuffer(
  device: GPUDevice,
  initialData: Float32Array
): GPUBuffer {
  const buffer = device.createBuffer({
    size: PARTICLE_COUNT * PARTICLE_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    mappedAtCreation: true,
  });

  new Float32Array(buffer.getMappedRange()).set(initialData);
  buffer.unmap();

  return buffer;
}

/**
 * Create uniform buffer for global parameters
 */
export function createUniformBuffer(device: GPUDevice): GPUBuffer {
  return device.createBuffer({
    size: 32, // 8 floats: width, height, mouseX, mouseY, deltaTime, pad*3
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
}

/**
 * Update uniform buffer with new values
 */
export function updateUniformBuffer(
  device: GPUDevice,
  buffer: GPUBuffer,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number,
  deltaTime: number = 1.0 / 60.0
): void {
  const data = new Float32Array([width, height, mouseX, mouseY, deltaTime, 0, 0, 0]);
  device.queue.writeBuffer(buffer, 0, data);
}

/**
 * Create all buffers needed for the particle system
 */
export function createBuffers(
  device: GPUDevice,
  canvasSize: Vec2
): ParticleBuffers {
  const particleData = initializeParticles(canvasSize);
  const particleBuffer = createParticleBuffer(device, particleData);
  const uniformBuffer = createUniformBuffer(device);

  // Initialize uniform buffer
  updateUniformBuffer(
    device,
    uniformBuffer,
    canvasSize.x,
    canvasSize.y,
    -1000, // Mouse starts off-screen
    -1000
  );

  return { particleBuffer, uniformBuffer };
}

/**
 * Validate that particle data is within bounds (for testing)
 */
export function validateParticleData(
  data: Float32Array,
  canvasSize: Vec2
): boolean {
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const offset = i * 4;
    const x = data[offset + 0];
    const y = data[offset + 1];

    if (x < 0 || x > canvasSize.x || y < 0 || y > canvasSize.y) {
      return false;
    }
  }
  return true;
}
