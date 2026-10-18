/**
 * Aethrava - Global Game Configuration
 * Phase 1 Foundation
 */

export const GAME_CONFIG = {
  // Player mechanics
  player: {
    walkSpeed: 6.0,
    runSpeed: 11.5,
    acceleration: 35.0,
    deceleration: 25.0,
    jumpForce: 10.5,
    gravity: 26.0,
    turnSpeed: 12.0,
    capsuleHeight: 1.8,
    capsuleRadius: 0.45,
    eyeGlowIntensity: 2.5
  },

  // Third-person camera
  camera: {
    fov: 60,
    near: 0.1,
    far: 800,
    defaultDistance: 5.2,
    minDistance: 2.2,
    maxDistance: 9.0,
    heightOffset: 1.55,
    shoulderOffset: 0.25, // Subtle over-the-shoulder framing
    minPitch: -0.38, // Look up angle limit (~ -22 deg)
    maxPitch: 1.25,  // Look down angle limit (~ +72 deg)
    mouseSensitivity: 0.0022,
    touchSensitivity: 0.0035,
    smoothing: 0.14,
    minGroundClearance: 0.45
  },

  // Environment & lighting
  world: {
    fogNear: 15,
    fogFar: 220,
    fogColor: 0xa8bed1,
    skyElevation: 28, // Sun elevation angle in degrees
    skyAzimuth: 195,  // Sun azimuth angle in degrees
    terrainSize: 320,
    terrainSegments: 128
  },

  // Rendering & mobile optimization
  rendering: {
    maxPixelRatio: 2.0,
    shadowMapSize: 2048,
    shadowDistance: 65,
    toneMappingExposure: 1.05
  }
};
