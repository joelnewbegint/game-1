import * as THREE from 'three';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - Smooth Third-Person Orbit Camera
 * Implements ground/obstacle raycast collision preventing geometry clipping,
 * spherical orbit controls, and smooth damping.
 */
export class ThirdPersonCamera {
  constructor(camera, world) {
    this.camera = camera;
    this.world = world;

    const config = GAME_CONFIG.camera;
    this.distance = config.defaultDistance;
    this.targetDistance = config.defaultDistance;
    this.pitch = 0.25; // ~14 deg elevation looking down slightly
    this.yaw = 0;      // 0 = facing forward

    this.currentPosition = new THREE.Vector3(0, 3, 5);
    this.currentTarget = new THREE.Vector3(0, 1.5, 0);

    // Collision raycaster
    this.raycaster = new THREE.Raycaster();
    this.raycaster.near = 0.2;
    this.raycaster.far = config.maxDistance + 2.0;

    // Zoom listener (desktop mouse wheel)
    window.addEventListener('wheel', (e) => {
      this.targetDistance += e.deltaY * 0.003;
      this.targetDistance = THREE.MathUtils.clamp(
        this.targetDistance,
        config.minDistance,
        config.maxDistance
      );
    }, { passive: true });
  }

  update(delta, player, input) {
    const config = GAME_CONFIG.camera;

    // 1. Process Look Input (Mouse or Touch)
    const look = input.consumeLookDelta();
    const sensitivity = input.isTouchDevice ? config.touchSensitivity : config.mouseSensitivity;

    this.yaw -= look.x * sensitivity;
    this.pitch += look.y * sensitivity;

    // Clamp pitch to avoid gimbal flipping or looking straight under
    this.pitch = THREE.MathUtils.clamp(this.pitch, config.minPitch, config.maxPitch);

    // Smooth distance zoom
    this.distance = THREE.MathUtils.lerp(this.distance, this.targetDistance, 0.15);

    // 2. Compute Player Focus Target (at chest/eye level)
    const idealTarget = new THREE.Vector3(
      player.position.x,
      player.position.y + config.heightOffset,
      player.position.z
    );

    // Smooth target follow
    this.currentTarget.lerp(idealTarget, 0.25);

    // 3. Spherical coordinates to calculate ideal camera position
    // (pitch: rotation around X, yaw: rotation around Y)
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const cosYaw = Math.cos(this.yaw);
    const sinYaw = Math.sin(this.yaw);

    const dirToCam = new THREE.Vector3(
      sinYaw * cosPitch,
      sinPitch,
      cosYaw * cosPitch
    ).normalize();

    let actualDistance = this.distance;

    // 4. Raycast Collision Detection from target to camera
    this.raycaster.set(this.currentTarget, dirToCam);
    const collidables = this.world.getCollidables();
    const hits = this.raycaster.intersectObjects(collidables, true);

    if (hits.length > 0) {
      const closestHit = hits[0];
      if (closestHit.distance < this.distance) {
        // Prevent clipping by pulling camera inward with safety cushion
        const safeMargin = 0.4;
        actualDistance = Math.max(config.minDistance, closestHit.distance - safeMargin);
      }
    }

    // 5. Calculate Desired Camera Position
    const desiredPos = new THREE.Vector3()
      .copy(this.currentTarget)
      .addScaledVector(dirToCam, actualDistance);

    // 6. Direct Ground Height Check at Camera Coordinates
    // Guarantees camera cannot sink below terrain even under extreme angles
    const groundHeightAtCam = this.world.getGroundHeight(desiredPos.x, desiredPos.z);
    const minCamY = groundHeightAtCam + config.minGroundClearance;
    if (desiredPos.y < minCamY) {
      desiredPos.y = minCamY;
    }

    // 7. Smooth Damped Camera Movement
    this.currentPosition.lerp(desiredPos, 0.22);
    this.camera.position.copy(this.currentPosition);

    // Camera looks at player focus target
    this.camera.lookAt(this.currentTarget);
  }
}
