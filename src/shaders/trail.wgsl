// Trail effect shader
// Draws a fullscreen semi-transparent black quad to create fade effect

struct VertexOutput {
  @builtin(position) position: vec4f,
}

// Fullscreen quad vertices (triangle strip)
// Positions in NDC: covers entire screen
const QUAD_POSITIONS = array<vec2f, 4>(
  vec2f(-1.0, -1.0),  // bottom-left
  vec2f( 1.0, -1.0),  // bottom-right
  vec2f(-1.0,  1.0),  // top-left
  vec2f( 1.0,  1.0),  // top-right
);

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(QUAD_POSITIONS[vertexIndex], 0.0, 1.0);
  return output;
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  // Semi-transparent black for trail fade effect
  // Lower alpha = longer trails
  return vec4f(0.0, 0.0, 0.0, 0.05);
}
