import { Particle, Vec2, GRAVITY, DAMPING, REPULSION_RADIUS } from '../types';

/**
 * Apply gravity to particle velocity
 */
export function applyGravity(velocity: Vec2, gravity: Vec2 = GRAVITY): Vec2 {
  return {
    x: velocity.x + gravity.x,
    y: velocity.y + gravity.y,
  };
}

/**
 * Calculate repulsion force from mouse
 * Returns the force vector to add to velocity
 */
export function calculateRepulsion(
  position: Vec2,
  mousePos: Vec2,
  radius: number = REPULSION_RADIUS
): Vec2 {
  const dx = mousePos.x - position.x;
  const dy = mousePos.y - position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // No repulsion if outside radius or at exact same position
  if (dist >= radius || dist === 0) {
    return { x: 0, y: 0 };
  }

  // Normalize direction and apply inverse distance force
  const nx = dx / dist;
  const ny = dy / dist;
  const forceMagnitude = -50.0 / dist;

  return {
    x: nx * forceMagnitude,
    y: ny * forceMagnitude,
  };
}

/**
 * Apply boundary bounce to particle
 * Returns updated position and velocity
 */
export function applyBoundaryBounce(
  position: Vec2,
  velocity: Vec2,
  canvasSize: Vec2,
  damping: number = DAMPING
): { position: Vec2; velocity: Vec2 } {
  let newVx = velocity.x;
  let newVy = velocity.y;
  let newX = position.x;
  let newY = position.y;

  // X boundary
  if (newX < 0 || newX > canvasSize.x) {
    newVx *= -damping;
    newX = Math.max(0, Math.min(newX, canvasSize.x));
  }

  // Y boundary
  if (newY < 0 || newY > canvasSize.y) {
    newVy *= -damping;
    newY = Math.max(0, Math.min(newY, canvasSize.y));
  }

  return {
    position: { x: newX, y: newY },
    velocity: { x: newVx, y: newVy },
  };
}

/**
 * Update a single particle for one frame
 * This mirrors the WGSL compute shader logic exactly
 */
export function updateParticle(
  particle: Particle,
  canvasSize: Vec2,
  mousePos: Vec2,
  gravity: Vec2 = GRAVITY
): Particle {
  // 1. Apply gravity
  let vx = particle.vx + gravity.x;
  let vy = particle.vy + gravity.y;

  // 2. Apply mouse repulsion
  const repulsion = calculateRepulsion(
    { x: particle.x, y: particle.y },
    mousePos
  );
  vx += repulsion.x;
  vy += repulsion.y;

  // 3. Update position
  let x = particle.x + vx;
  let y = particle.y + vy;

  // 4. Apply boundary bounce
  const bounced = applyBoundaryBounce(
    { x, y },
    { x: vx, y: vy },
    canvasSize
  );

  return {
    x: bounced.position.x,
    y: bounced.position.y,
    vx: bounced.velocity.x,
    vy: bounced.velocity.y,
  };
}
