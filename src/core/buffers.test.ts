import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { initializeParticles, validateParticleData } from './buffers';
import { Vec2, PARTICLE_COUNT } from '../types';

// Arbitrary for canvas size
const canvasSizeArb = fc.record({
  x: fc.float({ min: 100, max: 2000, noNaN: true }),
  y: fc.float({ min: 100, max: 2000, noNaN: true }),
});

describe('Buffers Module', () => {
  /**
   * Feature: webgpu-particle-fluid-sim, Property 2: Particle Initialization Bounds
   * For any particle after initialization, its position (x, y) should satisfy:
   * 0 <= x <= canvasWidth and 0 <= y <= canvasHeight
   * Validates: Requirements 2.3
   */
  describe('Property 2: Particle Initialization Bounds', () => {
    it('should initialize all particles within canvas bounds', () => {
      fc.assert(
        fc.property(canvasSizeArb, (canvasSize) => {
          const data = initializeParticles(canvasSize);

          // Check every particle
          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const offset = i * 4;
            const x = data[offset + 0];
            const y = data[offset + 1];

            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThanOrEqual(canvasSize.x);
            expect(y).toBeGreaterThanOrEqual(0);
            expect(y).toBeLessThanOrEqual(canvasSize.y);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should create correct number of particles', () => {
      fc.assert(
        fc.property(canvasSizeArb, (canvasSize) => {
          const data = initializeParticles(canvasSize);
          expect(data.length).toBe(PARTICLE_COUNT * 4);
        }),
        { numRuns: 100 }
      );
    });

    it('should validate particle data correctly', () => {
      fc.assert(
        fc.property(canvasSizeArb, (canvasSize) => {
          const data = initializeParticles(canvasSize);
          expect(validateParticleData(data, canvasSize)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect out-of-bounds particles', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);

      // Manually set one particle out of bounds
      data[0] = canvasSize.x + 100;

      expect(validateParticleData(data, canvasSize)).toBe(false);
    });

    it('should initialize particles with reasonable velocities', () => {
      fc.assert(
        fc.property(canvasSizeArb, (canvasSize) => {
          const data = initializeParticles(canvasSize);

          for (let i = 0; i < PARTICLE_COUNT; i++) {
            const offset = i * 4;
            const vx = data[offset + 2];
            const vy = data[offset + 3];

            // Velocities should be within expected range (-2 to 2)
            expect(vx).toBeGreaterThanOrEqual(-2);
            expect(vx).toBeLessThanOrEqual(2);
            expect(vy).toBeGreaterThanOrEqual(-2);
            expect(vy).toBeLessThanOrEqual(2);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});


describe('Buffers Edge Cases', () => {
  describe('initializeParticles edge cases', () => {
    it('should handle very small canvas', () => {
      const canvasSize: Vec2 = { x: 1, y: 1 };
      const data = initializeParticles(canvasSize);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const offset = i * 4;
        expect(data[offset + 0]).toBeGreaterThanOrEqual(0);
        expect(data[offset + 0]).toBeLessThanOrEqual(1);
        expect(data[offset + 1]).toBeGreaterThanOrEqual(0);
        expect(data[offset + 1]).toBeLessThanOrEqual(1);
      }
    });

    it('should handle very large canvas', () => {
      const canvasSize: Vec2 = { x: 10000, y: 10000 };
      const data = initializeParticles(canvasSize);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const offset = i * 4;
        expect(data[offset + 0]).toBeGreaterThanOrEqual(0);
        expect(data[offset + 0]).toBeLessThanOrEqual(10000);
        expect(data[offset + 1]).toBeGreaterThanOrEqual(0);
        expect(data[offset + 1]).toBeLessThanOrEqual(10000);
      }
    });

    it('should produce different positions for different particles', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);

      // Check that not all particles have the same position
      const positions = new Set<string>();
      for (let i = 0; i < Math.min(100, PARTICLE_COUNT); i++) {
        const offset = i * 4;
        const key = `${data[offset]},${data[offset + 1]}`;
        positions.add(key);
      }

      // Should have many unique positions
      expect(positions.size).toBeGreaterThan(90);
    });

    it('should produce different velocities for different particles', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);

      // Check that not all particles have the same velocity
      const velocities = new Set<string>();
      for (let i = 0; i < Math.min(100, PARTICLE_COUNT); i++) {
        const offset = i * 4;
        const key = `${data[offset + 2]},${data[offset + 3]}`;
        velocities.add(key);
      }

      // Should have many unique velocities
      expect(velocities.size).toBeGreaterThan(90);
    });
  });

  describe('validateParticleData edge cases', () => {
    it('should return true for empty-ish valid data', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = new Float32Array(PARTICLE_COUNT * 4);
      
      // All zeros are valid (within bounds)
      expect(validateParticleData(data, canvasSize)).toBe(true);
    });

    it('should detect particle at negative x', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);
      
      data[0] = -1; // First particle x is negative
      
      expect(validateParticleData(data, canvasSize)).toBe(false);
    });

    it('should detect particle at negative y', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);
      
      data[1] = -1; // First particle y is negative
      
      expect(validateParticleData(data, canvasSize)).toBe(false);
    });

    it('should detect particle beyond canvas width', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);
      
      data[0] = 801; // First particle x is beyond width
      
      expect(validateParticleData(data, canvasSize)).toBe(false);
    });

    it('should detect particle beyond canvas height', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);
      
      data[1] = 601; // First particle y is beyond height
      
      expect(validateParticleData(data, canvasSize)).toBe(false);
    });

    it('should detect out-of-bounds particle in middle of array', () => {
      const canvasSize: Vec2 = { x: 800, y: 600 };
      const data = initializeParticles(canvasSize);
      
      // Set particle 500 out of bounds
      const offset = 500 * 4;
      data[offset] = 1000;
      
      expect(validateParticleData(data, canvasSize)).toBe(false);
    });
  });
});
