// Particle structure: position (x, y) and velocity (vx, vy)
struct Particle {
  position: vec2f,
  velocity: vec2f,
}

// Uniform data: canvas size, mouse position, and timing
struct Uniforms {
  canvasSize: vec2f,
  mousePos: vec2f,
  deltaTime: f32,
  _pad1: f32,
  _pad2: f32,
  _pad3: f32,
}

// Particle storage buffer (read/write)
@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;

// Uniform buffer (read only)
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// Constants
const GRAVITY: vec2f = vec2f(0.0, 600.0);   // pixels/s² (scaled for dt)
const REPULSION_RADIUS: f32 = 200.0;
const REPULSION_STRENGTH: f32 = 3000.0;      // pixels/s (scaled for dt)
const DAMPING: f32 = 0.9;
const MAX_SPEED: f32 = 800.0;               // max pixels/s to prevent explosion

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x;
  
  // Bounds check
  if (index >= arrayLength(&particles)) {
    return;
  }
  
  var p = particles[index];
  let dt = uniforms.deltaTime;
  
  // 1. Apply gravity (acceleration * dt)
  p.velocity += GRAVITY * dt;
  
  // 2. Apply mouse repulsion force
  let toMouse = uniforms.mousePos - p.position;
  let dist = length(toMouse);
  
  if (dist < REPULSION_RADIUS && dist > 0.0) {
    // Repulsion force: away from mouse, inversely proportional to distance
    let direction = normalize(toMouse);
    let force = direction * (-REPULSION_STRENGTH / dist);
    p.velocity += force * dt;
  }
  
  // 3. Clamp velocity to prevent particle explosion
  let speed = length(p.velocity);
  if (speed > MAX_SPEED) {
    p.velocity = normalize(p.velocity) * MAX_SPEED;
  }
  
  // 4. Update position (velocity * dt)
  p.position += p.velocity * dt;
  
  // 5. Boundary collision detection and bounce
  // X boundary
  if (p.position.x < 0.0) {
    p.position.x = 0.0;
    p.velocity.x *= -DAMPING;
  } else if (p.position.x > uniforms.canvasSize.x) {
    p.position.x = uniforms.canvasSize.x;
    p.velocity.x *= -DAMPING;
  }
  
  // Y boundary
  if (p.position.y < 0.0) {
    p.position.y = 0.0;
    p.velocity.y *= -DAMPING;
  } else if (p.position.y > uniforms.canvasSize.y) {
    p.position.y = uniforms.canvasSize.y;
    p.velocity.y *= -DAMPING;
  }
  
  // Write back updated particle
  particles[index] = p;
}
