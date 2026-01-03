import { describe, it, expect } from 'vitest';
import {
  PARTICLE_COUNT,
  PARTICLE_SIZE,
  WORKGROUP_SIZE,
  REPULSION_RADIUS,
  GRAVITY,
  DAMPING,
} from './types';

describe('Types and Constants', () => {
  describe('Constants validation', () => {
    it('should have valid PARTICLE_COUNT', () => {
      expect(PARTICLE_COUNT).toBe(10000);
      expect(PARTICLE_COUNT).toBeGreaterThan(0);
      expect(Number.isInteger(PARTICLE_COUNT)).toBe(true);
    });

    it('should have valid PARTICLE_SIZE', () => {
      expect(PARTICLE_SIZE).toBe(16); // 4 floats * 4 bytes
      expect(PARTICLE_SIZE % 4).toBe(0); // Must be aligned
    });

    it('should have valid WORKGROUP_SIZE', () => {
      expect(WORKGROUP_SIZE).toBe(64);
      expect(WORKGROUP_SIZE).toBeGreaterThan(0);
      expect(WORKGROUP_SIZE).toBeLessThanOrEqual(256); // WebGPU limit
    });

    it('should have valid REPULSION_RADIUS', () => {
      expect(REPULSION_RADIUS).toBe(200);
      expect(REPULSION_RADIUS).toBeGreaterThan(0);
    });

    it('should have valid GRAVITY', () => {
      expect(GRAVITY.x).toBe(0);
      expect(GRAVITY.y).toBe(0.1);
    });

    it('should have valid DAMPING', () => {
      expect(DAMPING).toBe(0.9);
      expect(DAMPING).toBeGreaterThan(0);
      expect(DAMPING).toBeLessThanOrEqual(1);
    });

    it('should have PARTICLE_COUNT that works with WORKGROUP_SIZE', () => {
      // Compute shader dispatches ceil(PARTICLE_COUNT / WORKGROUP_SIZE) workgroups
      const workgroups = Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE);
      expect(workgroups).toBeGreaterThan(0);
      expect(workgroups * WORKGROUP_SIZE).toBeGreaterThanOrEqual(PARTICLE_COUNT);
    });
  });
});
