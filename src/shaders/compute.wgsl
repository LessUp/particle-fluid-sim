// Particle structure: position (x, y) and velocity (vx, vy)
struct Particle {
  position: vec2f,
  velocity: vec2f,
}

// Uniform data: canvas size and mouse position
struct Uniforms {
  canvasSize: vec2f,
  mousePos: vec2f,
}

// Particle storage buffer (read/write)
@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;

// Uniform buffer (read only)
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// Constants
const GRAVITY: vec2f = vec2f(0.0, 0.1);
const REPULSION_RADIUS: f32 = 200.0;
const REPULSION_STRENGTH: f32 = 50.0;
const DAMPING: f32 = 0.9;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3u) {
  let index = id.x;
  
  // Bounds check
  if (index >= arrayLength(&particles)) {
    return;
  }
  
  var p = particles[index];
  
  // 1. Apply gravity
  p.velocity += GRAVITY;
  
  // 2. Apply mouse repulsion force
  let toMouse = uniforms.mousePos - p.position;
  let dist = length(toMouse);
  
  if (dist < REPULSION_RADIUS && dist > 0.0) {
    // Repulsion force: away from mouse, inversely proportional to distance
    let direction = normalize(toMouse);
    let force = direction * (-REPULSION_STRENGTH / dist);
    p.velocity += force;
  }
  
  // 3. Update position
  p.position += p.velocity;
  
  // 4. Boundary collision detection and bounce
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
