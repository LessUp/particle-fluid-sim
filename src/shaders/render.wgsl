// Particle structure (must match compute shader)
struct Particle {
  position: vec2f,
  velocity: vec2f,
}

// Uniform data
struct Uniforms {
  canvasSize: vec2f,
  mousePos: vec2f,
}

// Vertex shader output
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) speed: f32,
}

// Particle storage buffer (read only for rendering)
@group(0) @binding(0) var<storage, read> particles: array<Particle>;

// Uniform buffer
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// Color constants
const CYAN: vec3f = vec3f(0.0, 1.0, 1.0);
const PURPLE: vec3f = vec3f(0.9, 0.3, 1.0);
const MAX_SPEED: f32 = 10.0;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let p = particles[vertexIndex];
  
  // Convert pixel position to NDC (-1 to 1)
  let ndc = (p.position / uniforms.canvasSize) * 2.0 - 1.0;
  
  var output: VertexOutput;
  // Flip Y axis (canvas Y grows down, NDC Y grows up)
  output.position = vec4f(ndc.x, -ndc.y, 0.0, 1.0);
  // Pass speed to fragment shader for coloring
  output.speed = length(p.velocity);
  
  return output;
}

@fragment
fn fragmentMain(@location(0) speed: f32) -> @location(0) vec4f {
  // Normalize speed to 0-1 range
  let t = clamp(speed / MAX_SPEED, 0.0, 1.0);
  
  // Interpolate between cyan and purple based on speed
  let color = mix(CYAN, PURPLE, t);
  
  // Brightness increases with speed
  let brightness = 0.5 + t * 0.5;
  
  return vec4f(color * brightness, 1.0);
}
