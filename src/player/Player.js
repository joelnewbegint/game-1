import * as THREE from 'three';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - Hero Character: Kaelen
 * Features procedural stylized fantasy model with Kaelen's signature glowing magic eye.
 */
export class Player {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    // Kinematic & movement state
    this.position = new THREE.Vector3(0, 0, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotationY = 0;
    this.targetRotationY = 0;
    this.isGrounded = true;
    this.isRunning = false;
    this.isMoving = false;
    this.speed = 0;

    // Animation & bobbing state
    this.walkCycle = 0;

    // Create stylized 3D character model
    this.createModel();

    // Set initial position to ground height
    const startY = this.world.getGroundHeight(0, 0);
    this.position.set(0, startY, 0);
    this.mesh.position.copy(this.position);
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.castShadow = true;

    // Materials
    const tunicMaterial = new THREE.MeshStandardMaterial({
      color: 0x222a3f, // Deep indigo traveler cloak
      roughness: 0.8,
      metalness: 0.1
    });

    const leatherMaterial = new THREE.MeshStandardMaterial({
      color: 0x5a3d28, // Brown leather boots & belt
      roughness: 0.85,
      metalness: 0.05
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a373, // Skin tone
      roughness: 0.6
    });

    // 1. Torso & Traveler Tunic
    const torsoGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.9, 12);
    this.torso = new THREE.Mesh(torsoGeo, tunicMaterial);
    this.torso.position.y = 1.15;
    this.torso.castShadow = true;
    this.mesh.add(this.torso);

    // Belt
    const beltGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.12, 12);
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x8a6234, roughness: 0.5 });
    const belt = new THREE.Mesh(beltGeo, beltMat);
    belt.position.y = 0.88;
    belt.castShadow = true;
    this.mesh.add(belt);

    // 2. Head & Hood
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 1.82;

    const hoodGeo = new THREE.SphereGeometry(0.32, 16, 14);
    const hood = new THREE.Mesh(hoodGeo, tunicMaterial);
    hood.castShadow = true;
    this.headGroup.add(hood);

    const faceGeo = new THREE.SphereGeometry(0.24, 12, 12);
    const face = new THREE.Mesh(faceGeo, skinMaterial);
    face.position.set(0, -0.02, 0.12);
    face.scale.set(0.9, 1.0, 0.85);
    this.headGroup.add(face);

    // 3. Kaelen's Magic Glowing Right Eye (Lore signature)
    const magicEyeGeo = new THREE.SphereGeometry(0.065, 12, 12);
    this.magicEyeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8 // Radiant cyan-blue First Eye fragment
    });
    this.magicEye = new THREE.Mesh(magicEyeGeo, this.magicEyeMat);
    this.magicEye.position.set(0.09, 0.02, 0.28);
    this.headGroup.add(this.magicEye);

    // Eye magical outer corona
    const eyeCoronaGeo = new THREE.RingGeometry(0.06, 0.11, 16);
    this.eyeCoronaMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.eyeCorona = new THREE.Mesh(eyeCoronaGeo, this.eyeCoronaMat);
    this.eyeCorona.position.set(0.09, 0.02, 0.29);
    this.headGroup.add(this.eyeCorona);

    // Eye point light that illuminates the path ahead
    this.eyeLight = new THREE.PointLight(0x38bdf8, 2.2, 7.5, 1.8);
    this.eyeLight.position.set(0.12, 0.04, 0.4);
    this.headGroup.add(this.eyeLight);

    // Normal left eye
    const normalEyeGeo = new THREE.SphereGeometry(0.035, 8, 8);
    const normalEyeMat = new THREE.MeshBasicMaterial({ color: 0x27272a });
    const normalEye = new THREE.Mesh(normalEyeGeo, normalEyeMat);
    normalEye.position.set(-0.09, 0.015, 0.28);
    this.headGroup.add(normalEye);

    this.mesh.add(this.headGroup);

    // 4. Cloak Mantle / Shoulders
    const capeGeo = new THREE.ConeGeometry(0.55, 1.1, 8, 1, true);
    capeGeo.rotateX(0.1);
    const capeMat = new THREE.MeshStandardMaterial({
      color: 0x181f30,
      side: THREE.DoubleSide,
      roughness: 0.9
    });
    this.cape = new THREE.Mesh(capeGeo, capeMat);
    this.cape.position.set(0, 1.1, -0.15);
    this.cape.castShadow = true;
    this.mesh.add(this.cape);

    // 5. Legs & Boots
    const legGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.72, 8);
    this.leftLeg = new THREE.Mesh(legGeo, leatherMaterial);
    this.leftLeg.position.set(-0.2, 0.36, 0);
    this.leftLeg.castShadow = true;
    this.mesh.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, leatherMaterial);
    this.rightLeg.position.set(0.2, 0.36, 0);
    this.rightLeg.castShadow = true;
    this.mesh.add(this.rightLeg);

    this.scene.add(this.mesh);
  }

  update(delta, input, cameraYaw) {
    const config = GAME_CONFIG.player;

    // 1. Evaluate movement vector in camera space
    const moveX = input.moveVector.x;
    const moveZ = input.moveVector.z;
    const hasInput = Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05;
    this.isMoving = hasInput;
    this.isRunning = input.isRunning && hasInput;

    const targetMaxSpeed = this.isRunning ? config.runSpeed : config.walkSpeed;

    // Movement direction relative to camera angle
    let targetWorldDir = new THREE.Vector3(0, 0, 0);
    if (hasInput) {
      // Camera forward & right vectors projected onto XZ plane
      const camForward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw)).normalize();
      const camRight = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw)).normalize();

      targetWorldDir.addScaledVector(camForward, -moveZ);
      targetWorldDir.addScaledVector(camRight, moveX);
      targetWorldDir.normalize();

      // Desired face angle
      this.targetRotationY = Math.atan2(targetWorldDir.x, targetWorldDir.z);
    }

    // Smooth rotation towards travel direction
    if (hasInput) {
      let diff = this.targetRotationY - this.rotationY;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.rotationY += diff * Math.min(1.0, config.turnSpeed * delta);
    }

    // Horizontal acceleration & deceleration
    const targetVelX = hasInput ? targetWorldDir.x * targetMaxSpeed : 0;
    const targetVelZ = hasInput ? targetWorldDir.z * targetMaxSpeed : 0;

    const accelRate = hasInput ? config.acceleration : config.deceleration;
    this.velocity.x += (targetVelX - this.velocity.x) * Math.min(1.0, accelRate * delta);
    this.velocity.z += (targetVelZ - this.velocity.z) * Math.min(1.0, accelRate * delta);

    this.speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.z * this.velocity.z);

    // 2. Jump & Vertical Gravity Physics
    const groundY = this.world.getGroundHeight(this.position.x, this.position.z);

    if (this.isGrounded) {
      if (input.consumeJump()) {
        this.velocity.y = config.jumpForce;
        this.isGrounded = false;
      } else {
        this.velocity.y = 0;
        this.position.y = groundY;
      }
    } else {
      // Airborne: apply gravity
      this.velocity.y -= config.gravity * delta;
      this.position.y += this.velocity.y * delta;

      // Ground landing test
      if (this.position.y <= groundY) {
        this.position.y = groundY;
        this.velocity.y = 0;
        this.isGrounded = true;
      }
    }

    // Horizontal position integration
    this.position.x += this.velocity.x * delta;
    this.position.z += this.velocity.z * delta;

    // Keep on ground if grounded
    if (this.isGrounded) {
      this.position.y = this.world.getGroundHeight(this.position.x, this.position.z);
    }

    // Update mesh position and rotation
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotationY;

    // 3. Procedural Walk/Run Bobbing Animation
    if (hasInput && this.isGrounded) {
      const stepFreq = this.isRunning ? 14 : 9;
      this.walkCycle += delta * stepFreq;

      const bobY = Math.abs(Math.sin(this.walkCycle)) * 0.08;
      this.torso.position.y = 1.15 + bobY;
      this.headGroup.position.y = 1.82 + bobY;

      // Leg swing
      const legAngle = Math.sin(this.walkCycle) * 0.45;
      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      // Slight cloak flutter
      this.cape.rotation.x = 0.1 + (this.isRunning ? 0.35 : 0.15) + Math.sin(this.walkCycle * 2) * 0.05;
    } else {
      // Idle pose smooth return
      this.torso.position.y = THREE.MathUtils.lerp(this.torso.position.y, 1.15, 0.1);
      this.headGroup.position.y = THREE.MathUtils.lerp(this.headGroup.position.y, 1.82, 0.1);
      this.leftLeg.rotation.x = THREE.MathUtils.lerp(this.leftLeg.rotation.x, 0, 0.15);
      this.rightLeg.rotation.x = THREE.MathUtils.lerp(this.rightLeg.rotation.x, 0, 0.15);
      this.cape.rotation.x = THREE.MathUtils.lerp(this.cape.rotation.x, 0.1, 0.1);
    }

    // 4. Kaelen's Magic Eye Mystical Pulse Animation
    const pulseTime = performance.now() * 0.003;
    const pulse = 0.85 + Math.sin(pulseTime) * 0.15 + (Math.random() - 0.5) * 0.04;
    this.eyeLight.intensity = 2.2 * pulse;
    this.eyeCorona.scale.setScalar(1.0 + (pulse - 1.0) * 0.6);
  }
}
