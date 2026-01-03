import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  applyGravity,
  applyBoundaryBounce,
  calculateRepulsion,
  updateParticle,
} from './physics';
import { Particle, GRAVITY, REPULSION_RADIUS } from '../types';

// Arbitraries for property-based testing
const vec2Arb = fc.record({
  x: fc.float({ min: -1000, max: 1000, noNaN: true }),
  y: fc.float({ min: -1000, max: 1000, noNaN: true }),
});

const canvasSizeArb = fc.record({
  x: fc.float({ min: 100, max: 2000, noNaN: true }),
  y: fc.float({ min: 100, max: 2000, noNaN: true }),
});

const particleArb = fc.record({
  x: fc.float({ min: 0, max: 1000, noNaN: true }),
  y: fc.float({ min: 0, max: 1000, noNaN: true }),
  vx: fc.float({ min: -10, max: 10, noNaN: true }),
  vy: fc.float({ min: -10, max: 10, noNaN: true }),
});

describe('Physics Module', () => {
  /**
   * Feature: webgpu-particle-fluid-sim, Property 3: Physics Update Correctness
   * For any particle not at a boundary, after one compute shader execution:
   * - new_velocity = old_velocity + gravity
   * - new_position = old_position + new_velocity
   * Validates: Requirements 3.1, 3.4
   */
  describe('Property 3: Physics Update Correctness', () => {
    it('should apply gravity correctly to velocity', () => {
      fc.assert(
        fc.property(vec2Arb, (velocity) => {
          const result = applyGravity(velocity, GRAVITY);
          expect(result.x).toBeCloseTo(velocity.x + GRAVITY.x, 5);
          expect(result.y).toBeCloseTo(velocity.y + GRAVITY.y, 5);
        }),
        { numRuns: 100 }
      );
    });

    it('should update position by velocity after gravity', () => {
      fc.assert(
        fc.property(
          canvasSizeArb,
          fc.float({ min: 100, max: 500, noNaN: true }),
          fc.float({ min: 100, max: 500, noNaN: true }),
          fc.float({ min: -2, max: 2, noNaN: true }),
          fc.float({ min: -2, max: 2, noNaN: true }),
          (canvasSize, px, py, vx, vy) => {
            // Particle well within bounds (won't hit boundary)
            const particle: Particle = {
              x: Math.min(px, canvasSize.x - 50),
              y: Math.min(py, canvasSize.y - 50),
              vx,
              vy,
            };
            // Mouse far away (no repulsion)
            const mousePos = { x: -1000, y: -1000 };

            const result = updateParticle(particle, canvasSize, mousePos, GRAVITY);

            // Expected velocity after gravity
            const expectedVx = particle.vx + GRAVITY.x;
            const expectedVy = particle.vy + GRAVITY.y;

            // Expected position after velocity update
            const expectedX = particle.x + expectedVx;
            const expectedY = particle.y + expectedVy;

            // If still in bounds, position should match
            if (expectedX >= 0 && expectedX <= canvasSize.x &&
                expectedY >= 0 && expectedY <= canvasSize.y) {
              expect(result.x).toBeCloseTo(expectedX, 4);
              expect(result.y).toBeCloseTo(expectedY, 4);
              expect(result.vx).toBeCloseTo(expectedVx, 4);
              expect(result.vy).toBeCloseTo(expectedVy, 4);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: webgpu-particle-fluid-sim, Property 4: Boundary Bounce Behavior
   * For any particle whose position would exceed canvas bounds:
   * - Position should be clamped to valid range [0, canvasSize]
   * - Velocity component perpendicular to boundary should be negated
   * Validates: Requirements 3.2
   */
  describe('Property 4: Boundary Bounce Behavior', () => {
    it('should clamp position to canvas bounds', () => {
      fc.assert(
        fc.property(vec2Arb, vec2Arb, canvasSizeArb, (position, velocity, canvasSize) => {
          const result = applyBoundaryBounce(position, velocity, canvasSize);

          // Position should always be within bounds
          expect(result.position.x).toBeGreaterThanOrEqual(0);
          expect(result.position.x).toBeLessThanOrEqual(canvasSize.x);
          expect(result.position.y).toBeGreaterThanOrEqual(0);
          expect(result.position.y).toBeLessThanOrEqual(canvasSize.y);
        }),
        { numRuns: 100 }
      );
    });

    it('should reverse velocity when hitting boundary', () => {
      fc.assert(
        fc.property(
          canvasSizeArb,
          fc.float({ min: 1, max: 10, noNaN: true }),
          (canvasSize, speed) => {
            // Particle moving right, past right boundary
            const position = { x: canvasSize.x + 10, y: canvasSize.y / 2 };
            const velocity = { x: speed, y: 0 };

            const result = applyBoundaryBounce(position, velocity, canvasSize);

            // Velocity X should be reversed (negative)
            expect(result.velocity.x).toBeLessThan(0);
            // Position should be clamped
            expect(result.position.x).toBe(canvasSize.x);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply damping when bouncing', () => {
      const damping = 0.9;
      fc.assert(
        fc.property(
          canvasSizeArb,
          fc.float({ min: 1, max: 10, noNaN: true }),
          (canvasSize, speed) => {
            // Particle past left boundary
            const position = { x: -10, y: canvasSize.y / 2 };
            const velocity = { x: -speed, y: 0 };

            const result = applyBoundaryBounce(position, velocity, canvasSize, damping);

            // Velocity should be reversed and damped
            expect(Math.abs(result.velocity.x)).toBeCloseTo(speed * damping, 5);
            expect(result.velocity.x).toBeGreaterThan(0); // Now moving right
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should keep particle in bounds after full update', () => {
      fc.assert(
        fc.property(particleArb, canvasSizeArb, (particle, canvasSize) => {
          // Mouse far away
          const mousePos = { x: -1000, y: -1000 };
          const result = updateParticle(particle, canvasSize, mousePos);

          expect(result.x).toBeGreaterThanOrEqual(0);
          expect(result.x).toBeLessThanOrEqual(canvasSize.x);
          expect(result.y).toBeGreaterThanOrEqual(0);
          expect(result.y).toBeLessThanOrEqual(canvasSize.y);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: webgpu-particle-fluid-sim, Property 5: Repulsion Force Application
   * For any particle within 200 pixels of mouse:
   * - Repulsion force should be applied away from cursor
   * - Force magnitude inversely proportional to distance
   * For particles beyond 200 pixels: no repulsion
   * Validates: Requirements 4.2, 4.3
   */
  describe('Property 5: Repulsion Force Application', () => {
    it('should apply no repulsion when particle is outside radius', () => {
      fc.assert(
        fc.property(
          vec2Arb,
          fc.float({ min: REPULSION_RADIUS + 1, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
          (mousePos, distance, angle) => {
            // Position particle at exact distance from mouse
            const position = {
              x: mousePos.x + Math.cos(angle) * distance,
              y: mousePos.y + Math.sin(angle) * distance,
            };

            const force = calculateRepulsion(position, mousePos);

            expect(force.x).toBe(0);
            expect(force.y).toBe(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply repulsion away from mouse when inside radius', () => {
      fc.assert(
        fc.property(
          vec2Arb,
          fc.float({ min: 10, max: REPULSION_RADIUS - 1, noNaN: true }),
          fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
          (mousePos, distance, angle) => {
            // Position particle at exact distance from mouse
            const position = {
              x: mousePos.x + Math.cos(angle) * distance,
              y: mousePos.y + Math.sin(angle) * distance,
            };

            const force = calculateRepulsion(position, mousePos);

            // Force should be non-zero
            const forceMag = Math.sqrt(force.x * force.x + force.y * force.y);
            expect(forceMag).toBeGreaterThan(0);

            // Force direction should be away from mouse (opposite to toMouse vector)
            const toMouseX = mousePos.x - position.x;
            const toMouseY = mousePos.y - position.y;
            const dotProduct = force.x * toMouseX + force.y * toMouseY;
            
            // Dot product should be negative (force points away)
            expect(dotProduct).toBeLessThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should apply stronger force when closer to mouse', () => {
      fc.assert(
        fc.property(
          vec2Arb,
          fc.float({ min: 20, max: 100, noNaN: true }),
          fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
          (mousePos, nearDistance, angle) => {
            const farDistance = nearDistance + 50;
            
            // Skip if far distance exceeds radius
            if (farDistance >= REPULSION_RADIUS) return;

            const nearPos = {
              x: mousePos.x + Math.cos(angle) * nearDistance,
              y: mousePos.y + Math.sin(angle) * nearDistance,
            };
            const farPos = {
              x: mousePos.x + Math.cos(angle) * farDistance,
              y: mousePos.y + Math.sin(angle) * farDistance,
            };

            const nearForce = calculateRepulsion(nearPos, mousePos);
            const farForce = calculateRepulsion(farPos, mousePos);

            const nearMag = Math.sqrt(nearForce.x ** 2 + nearForce.y ** 2);
            const farMag = Math.sqrt(farForce.x ** 2 + farForce.y ** 2);

            // Closer particle should receive stronger force
            expect(nearMag).toBeGreaterThan(farMag);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


describe('Physics Edge Cases', () => {
  describe('applyGravity edge cases', () => {
    it('should handle zero gravity', () => {
      const velocity = { x: 5, y: 5 };
      const zeroGravity = { x: 0, y: 0 };
      const result = applyGravity(velocity, zeroGravity);
      
      expect(result.x).toBe(velocity.x);
      expect(result.y).toBe(velocity.y);
    });

    it('should handle negative gravity (upward force)', () => {
      const velocity = { x: 0, y: 0 };
      const negativeGravity = { x: 0, y: -0.1 };
      const result = applyGravity(velocity, negativeGravity);
      
      expect(result.y).toBeLessThan(0);
    });

    it('should handle horizontal gravity', () => {
      const velocity = { x: 0, y: 0 };
      const horizontalGravity = { x: 0.1, y: 0 };
      const result = applyGravity(velocity, horizontalGravity);
      
      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBe(0);
    });
  });

  describe('applyBoundaryBounce edge cases', () => {
    it('should handle particle exactly at boundary', () => {
      const canvasSize = { x: 800, y: 600 };
      const position = { x: 800, y: 600 };
      const velocity = { x: 1, y: 1 };
      
      const result = applyBoundaryBounce(position, velocity, canvasSize);
      
      expect(result.position.x).toBe(canvasSize.x);
      expect(result.position.y).toBe(canvasSize.y);
    });

    it('should handle particle at origin', () => {
      const canvasSize = { x: 800, y: 600 };
      const position = { x: 0, y: 0 };
      const velocity = { x: -1, y: -1 };
      
      const result = applyBoundaryBounce(position, velocity, canvasSize);
      
      expect(result.position.x).toBe(0);
      expect(result.position.y).toBe(0);
    });

    it('should handle zero velocity at boundary', () => {
      const canvasSize = { x: 800, y: 600 };
      const position = { x: 850, y: 300 };
      const velocity = { x: 0, y: 0 };
      
      const result = applyBoundaryBounce(position, velocity, canvasSize);
      
      expect(result.position.x).toBe(canvasSize.x);
      // Zero velocity stays zero (or becomes -0 which is equal to 0)
      expect(result.velocity.x).toBeCloseTo(0, 10);
    });

    it('should handle very small canvas', () => {
      const canvasSize = { x: 1, y: 1 };
      const position = { x: 0.5, y: 0.5 };
      const velocity = { x: 0.1, y: 0.1 };
      
      const result = applyBoundaryBounce(position, velocity, canvasSize);
      
      expect(result.position.x).toBeGreaterThanOrEqual(0);
      expect(result.position.x).toBeLessThanOrEqual(canvasSize.x);
    });
  });

  describe('calculateRepulsion edge cases', () => {
    it('should handle particle at exact mouse position', () => {
      const position = { x: 100, y: 100 };
      const mousePos = { x: 100, y: 100 };
      
      const force = calculateRepulsion(position, mousePos);
      
      // Should return zero force to avoid division by zero
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    it('should handle particle exactly at radius boundary', () => {
      const mousePos = { x: 0, y: 0 };
      const position = { x: REPULSION_RADIUS, y: 0 };
      
      const force = calculateRepulsion(position, mousePos);
      
      // At exactly the radius, should have no force
      expect(force.x).toBe(0);
      expect(force.y).toBe(0);
    });

    it('should handle particle just inside radius', () => {
      const mousePos = { x: 0, y: 0 };
      // Particle to the LEFT of mouse (negative x)
      const position = { x: -(REPULSION_RADIUS - 1), y: 0 };
      
      const force = calculateRepulsion(position, mousePos);
      
      // Should have some repulsion force
      // Force pushes particle away from mouse (more negative x)
      expect(force.x).toBeLessThan(0);
      expect(force.y).toBeCloseTo(0, 10);
    });

    it('should handle negative coordinates', () => {
      const mousePos = { x: -100, y: -100 };
      const position = { x: -50, y: -50 };
      
      const force = calculateRepulsion(position, mousePos);
      
      // Force should push particle away from mouse
      const forceMag = Math.sqrt(force.x ** 2 + force.y ** 2);
      expect(forceMag).toBeGreaterThan(0);
    });
  });

  describe('updateParticle integration', () => {
    it('should handle particle with zero velocity', () => {
      const particle: Particle = { x: 400, y: 300, vx: 0, vy: 0 };
      const canvasSize = { x: 800, y: 600 };
      const mousePos = { x: -1000, y: -1000 };
      
      const result = updateParticle(particle, canvasSize, mousePos);
      
      // Should only have gravity applied
      expect(result.vx).toBeCloseTo(GRAVITY.x, 5);
      expect(result.vy).toBeCloseTo(GRAVITY.y, 5);
    });

    it('should handle particle near mouse with high velocity', () => {
      const particle: Particle = { x: 100, y: 100, vx: 10, vy: 10 };
      const canvasSize = { x: 800, y: 600 };
      const mousePos = { x: 150, y: 150 };
      
      const result = updateParticle(particle, canvasSize, mousePos);
      
      // Particle should be pushed away from mouse
      expect(result.x).toBeGreaterThanOrEqual(0);
      expect(result.y).toBeGreaterThanOrEqual(0);
    });

    it('should handle corner collision', () => {
      const particle: Particle = { x: -10, y: -10, vx: -5, vy: -5 };
      const canvasSize = { x: 800, y: 600 };
      const mousePos = { x: -1000, y: -1000 };
      
      const result = updateParticle(particle, canvasSize, mousePos);
      
      // Should be clamped to corner
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      // Velocities should be reversed
      expect(result.vx).toBeGreaterThan(0);
      expect(result.vy).toBeGreaterThan(0);
    });
  });
});
