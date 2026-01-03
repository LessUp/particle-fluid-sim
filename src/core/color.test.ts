import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  velocityToColor,
  velocityMagnitude,
  getSpeedFactor,
  CYAN,
  PURPLE,
  MAX_SPEED,
} from './color';
import { Vec2 } from '../types';

// Arbitrary for velocity
const velocityArb = fc.record({
  x: fc.float({ min: -20, max: 20, noNaN: true }),
  y: fc.float({ min: -20, max: 20, noNaN: true }),
});

describe('Color Module', () => {
  /**
   * Feature: webgpu-particle-fluid-sim, Property 6: Velocity-Based Color Mapping
   * For any particle with velocity v:
   * - Color computed as mix(cyan, purple, t) where t = clamp(|v| / 10.0, 0, 1)
   * - Zero velocity = cyan (0, 1, 1)
   * - Velocity magnitude >= 10 = purple (0.8, 0.2, 1.0)
   * - Brightness = 0.5 + t * 0.5
   * Validates: Requirements 5.2, 5.3
   */
  describe('Property 6: Velocity-Based Color Mapping', () => {
    it('should return cyan for zero velocity', () => {
      const velocity: Vec2 = { x: 0, y: 0 };
      const color = velocityToColor(velocity);

      // At zero velocity, t = 0, brightness = 0.5
      // Color = cyan * 0.5 = (0, 0.5, 0.5)
      expect(color.r).toBeCloseTo(CYAN.r * 0.5, 5);
      expect(color.g).toBeCloseTo(CYAN.g * 0.5, 5);
      expect(color.b).toBeCloseTo(CYAN.b * 0.5, 5);
    });

    it('should return purple for high velocity (>= MAX_SPEED)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: MAX_SPEED, max: 50, noNaN: true }),
          fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
          (speed, angle) => {
            const velocity: Vec2 = {
              x: Math.cos(angle) * speed,
              y: Math.sin(angle) * speed,
            };
            const color = velocityToColor(velocity);

            // At max speed, t = 1, brightness = 1.0
            // Color = purple * 1.0 = (0.9, 0.3, 1.0)
            expect(color.r).toBeCloseTo(PURPLE.r, 4);
            expect(color.g).toBeCloseTo(PURPLE.g, 4);
            expect(color.b).toBeCloseTo(PURPLE.b, 4);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should interpolate color based on speed', () => {
      fc.assert(
        fc.property(velocityArb, (velocity) => {
          const color = velocityToColor(velocity);
          const speed = velocityMagnitude(velocity);
          const t = Math.min(speed / MAX_SPEED, 1.0);
          const brightness = 0.5 + t * 0.5;

          // Expected color = mix(cyan, purple, t) * brightness
          const expectedR = (CYAN.r + (PURPLE.r - CYAN.r) * t) * brightness;
          const expectedG = (CYAN.g + (PURPLE.g - CYAN.g) * t) * brightness;
          const expectedB = (CYAN.b + (PURPLE.b - CYAN.b) * t) * brightness;

          expect(color.r).toBeCloseTo(expectedR, 4);
          expect(color.g).toBeCloseTo(expectedG, 4);
          expect(color.b).toBeCloseTo(expectedB, 4);
        }),
        { numRuns: 100 }
      );
    });

    it('should have brightness between 0.5 and 1.0', () => {
      fc.assert(
        fc.property(velocityArb, (velocity) => {
          const color = velocityToColor(velocity);
          // Brightness should be between 0.5 and 1.0
          // For cyan (0, 1, 1), the max channel is g or b = 1
          // After brightness: max = 1 * brightness
          const maxChannel = Math.max(color.r, color.g, color.b);

          // Max channel should be approximately brightness (for pure colors)
          // This is a weaker check since mixed colors behave differently
          expect(maxChannel).toBeGreaterThanOrEqual(0.5 * 0.99);
          expect(maxChannel).toBeLessThanOrEqual(1.0 * 1.01);
        }),
        { numRuns: 100 }
      );
    });

    it('should produce colors in valid RGB range (0-1)', () => {
      fc.assert(
        fc.property(velocityArb, (velocity) => {
          const color = velocityToColor(velocity);

          expect(color.r).toBeGreaterThanOrEqual(0);
          expect(color.r).toBeLessThanOrEqual(1);
          expect(color.g).toBeGreaterThanOrEqual(0);
          expect(color.g).toBeLessThanOrEqual(1);
          expect(color.b).toBeGreaterThanOrEqual(0);
          expect(color.b).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should have speed factor between 0 and 1', () => {
      fc.assert(
        fc.property(velocityArb, (velocity) => {
          const factor = getSpeedFactor(velocity);
          expect(factor).toBeGreaterThanOrEqual(0);
          expect(factor).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should increase brightness with speed', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: 5, noNaN: true }),
          fc.float({ min: 0, max: Math.fround(Math.PI * 2), noNaN: true }),
          (slowSpeed, angle) => {
            const fastSpeed = slowSpeed + 3;
            
            const slowVel: Vec2 = {
              x: Math.cos(angle) * slowSpeed,
              y: Math.sin(angle) * slowSpeed,
            };
            const fastVel: Vec2 = {
              x: Math.cos(angle) * fastSpeed,
              y: Math.sin(angle) * fastSpeed,
            };

            const slowColor = velocityToColor(slowVel);
            const fastColor = velocityToColor(fastVel);

            // Fast particle should have higher brightness (sum of RGB)
            const slowBrightness = slowColor.r + slowColor.g + slowColor.b;
            const fastBrightness = fastColor.r + fastColor.g + fastColor.b;

            expect(fastBrightness).toBeGreaterThanOrEqual(slowBrightness - 0.01);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


describe('Color Edge Cases', () => {
  describe('velocityMagnitude', () => {
    it('should return 0 for zero velocity', () => {
      expect(velocityMagnitude({ x: 0, y: 0 })).toBe(0);
    });

    it('should handle unit vectors', () => {
      expect(velocityMagnitude({ x: 1, y: 0 })).toBe(1);
      expect(velocityMagnitude({ x: 0, y: 1 })).toBe(1);
    });

    it('should handle diagonal vectors', () => {
      const mag = velocityMagnitude({ x: 3, y: 4 });
      expect(mag).toBe(5); // 3-4-5 triangle
    });

    it('should handle negative velocities', () => {
      const mag = velocityMagnitude({ x: -3, y: -4 });
      expect(mag).toBe(5);
    });
  });

  describe('getSpeedFactor', () => {
    it('should return 0 for zero velocity', () => {
      expect(getSpeedFactor({ x: 0, y: 0 })).toBe(0);
    });

    it('should return 1 for velocity at MAX_SPEED', () => {
      expect(getSpeedFactor({ x: MAX_SPEED, y: 0 })).toBe(1);
    });

    it('should return 1 for velocity above MAX_SPEED', () => {
      expect(getSpeedFactor({ x: MAX_SPEED * 2, y: 0 })).toBe(1);
    });

    it('should return 0.5 for half MAX_SPEED', () => {
      expect(getSpeedFactor({ x: MAX_SPEED / 2, y: 0 })).toBeCloseTo(0.5, 5);
    });
  });

  describe('velocityToColor edge cases', () => {
    it('should handle very small velocities', () => {
      const color = velocityToColor({ x: 0.001, y: 0.001 });
      
      // Should be close to cyan with low brightness
      expect(color.r).toBeCloseTo(0, 2);
      expect(color.g).toBeCloseTo(0.5, 1);
      expect(color.b).toBeCloseTo(0.5, 1);
    });

    it('should handle very large velocities', () => {
      const color = velocityToColor({ x: 1000, y: 1000 });
      
      // Should be purple with full brightness
      expect(color.r).toBeCloseTo(PURPLE.r, 4);
      expect(color.g).toBeCloseTo(PURPLE.g, 4);
      expect(color.b).toBeCloseTo(PURPLE.b, 4);
    });

    it('should produce consistent colors for same speed different directions', () => {
      const speed = 5;
      const angles = [0, Math.PI / 4, Math.PI / 2, Math.PI];
      
      const colors = angles.map(angle => 
        velocityToColor({
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        })
      );

      // All colors should be the same (speed is the same)
      for (let i = 1; i < colors.length; i++) {
        expect(colors[i].r).toBeCloseTo(colors[0].r, 4);
        expect(colors[i].g).toBeCloseTo(colors[0].g, 4);
        expect(colors[i].b).toBeCloseTo(colors[0].b, 4);
      }
    });
  });
});
