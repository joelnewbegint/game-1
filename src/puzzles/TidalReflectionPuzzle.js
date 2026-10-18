import * as THREE from 'three';

/**
 * Aethrava - The Mirror of Tides (Tidal Reflection Puzzle)
 * Three rotating pearl focus mirrors on sea-cliff pedestals.
 * The player rotates each mirror by 90° until coastal lunar light converges on the Abyssal Vault Gate.
 */
export class TidalReflectionPuzzle {
  constructor(scene, world, gameState, audioManager, onUnlockVault) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;
    this.onUnlockVault = onUnlockVault;

    this.isAligned = false;
    this.isUnlocked = false;

    // Mirrors configuration (Left, Center, Right)
    this.mirrors = [
      { id: 'mirror_left', x: 117, z: 104, angle: 90, targetAngle: 0 },
      { id: 'mirror_center', x: 125, z: 98, angle: 270, targetAngle: 0 },
      { id: 'mirror_right', x: 133, z: 104, angle: 180, targetAngle: 0 }
    ];

    this.vaultGatePos = new THREE.Vector3(125, 0, 115);
    this.vaultGatePos.y = this.world.getGroundHeight(this.vaultGatePos.x, this.vaultGatePos.z);

    this.createVaultGate();
    this.createMirrorPedestals();
    this.createReflectionBeams();
  }

  createVaultGate() {
    this.gateGroup = new THREE.Group();
    this.gateGroup.position.copy(this.vaultGatePos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 1.2,
      roughness: 0.2
    });

    // Grand Sunken Pillars
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9.0, 2.5), stoneMat);
    p1.position.set(-4.5, 4.5, 0);
    p1.castShadow = true;
    p1.receiveShadow = true;
    this.gateGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 9.0, 2.5), stoneMat);
    p2.position.set(4.5, 4.5, 0);
    p2.castShadow = true;
    p2.receiveShadow = true;
    this.gateGroup.add(p2);

    const arch = new THREE.Mesh(new THREE.BoxGeometry(12.0, 2.0, 3.0), stoneMat);
    arch.position.set(0, 9.5, 0);
    arch.castShadow = true;
    this.gateGroup.add(arch);

    // Central Abyssal Pearl Receptacle
    const receptacleGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.4, 16);
    receptacleGeo.rotateX(Math.PI / 2);
    this.pearlReceptacle = new THREE.Mesh(receptacleGeo, tealMat);
    this.pearlReceptacle.position.set(0, 4.5, 0.2);
    this.gateGroup.add(this.pearlReceptacle);

    this.scene.add(this.gateGroup);
  }

  createMirrorPedestals() {
    this.mirrorMeshes = [];
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const pearlMat = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      emissive: 0x38bdf8,
      emissiveIntensity: 2.0,
      roughness: 0.1
    });

    const pedestalGeo = new THREE.CylinderGeometry(0.8, 1.1, 2.2, 8);
    const mirrorDiscGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16);
    mirrorDiscGeo.rotateX(Math.PI / 2);

    this.mirrors.forEach((m, idx) => {
      const y = this.world.getGroundHeight(m.x, m.z);
      const group = new THREE.Group();
      group.position.set(m.x, y, m.z);

      const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
      pedestal.position.y = 1.1;
      pedestal.castShadow = true;
      group.add(pedestal);

      const disc = new THREE.Mesh(mirrorDiscGeo, pearlMat);
      disc.position.y = 2.6;
      disc.castShadow = true;
      group.add(disc);

      const light = new THREE.PointLight(0x38bdf8, 1.8, 6.0);
      light.position.y = 2.7;
      group.add(light);

      group.rotation.y = THREE.MathUtils.degToRad(m.angle);

      this.scene.add(group);
      this.mirrorMeshes.push({ group, disc, data: m, idx });
    });
  }

  createReflectionBeams() {
    this.beamGroup = new THREE.Group();
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.beams = [];
    this.mirrors.forEach(m => {
      const start = new THREE.Vector3(m.x, this.world.getGroundHeight(m.x, m.z) + 2.6, m.z);
      const end = new THREE.Vector3(this.vaultGatePos.x, this.vaultGatePos.y + 4.5, this.vaultGatePos.z);
      const dist = start.distanceTo(end);

      const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
      beamGeo.rotateX(Math.PI / 2);
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);

      beamMesh.position.copy(start).lerp(end, 0.5);
      beamMesh.lookAt(end);

      this.beamGroup.add(beamMesh);
      this.beams.push(beamMesh);
    });

    this.beamGroup.visible = false;
    this.scene.add(this.beamGroup);
  }

  rotateMirror(idx) {
    const m = this.mirrors[idx];
    m.angle = (m.angle + 90) % 360;

    const meshObj = this.mirrorMeshes[idx];
    meshObj.group.rotation.y = THREE.MathUtils.degToRad(m.angle);

    if (this.audio) this.audio.playChime('puzzle');

    this.checkAlignment();
  }

  checkAlignment() {
    const allAligned = this.mirrors.every(m => m.angle === m.targetAngle);

    if (allAligned && !this.isAligned) {
      this.isAligned = true;
      this.beamGroup.visible = true;

      if (this.audio) this.audio.playChime('success');

      if (this.gameState.getQuestState('q_reflection_altar') === 'active') {
        this.gameState.completeObjective('q_reflection_altar', 'obj_align_mirrors');
      }

      this.gameState.emit('notification', {
        title: 'Tidal Mirrors Aligned!',
        message: 'Lunar reflections converge on the Abyssal Vault. Insert the Luminescent Tidal Pearl.',
        type: 'quest'
      });
    } else if (!allAligned) {
      this.isAligned = false;
      this.beamGroup.visible = false;
    }
  }

  unlockVault() {
    if (!this.isAligned) {
      this.gameState.emit('notification', {
        title: 'Vault Dark',
        message: 'The pearl receptacle remains unlit. Align all three Tidal Pearl Mirrors first.',
        type: 'trust-negative'
      });
      return;
    }

    if (!this.gameState.hasItem('abyssal_prism_pearl')) {
      this.gameState.emit('notification', {
        title: 'Pearl Required',
        message: 'You need the Luminescent Tidal Pearl from Corvo\'s cove.',
        type: 'trust-negative'
      });
      return;
    }

    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.gameState.getQuestState('q_reflection_altar') === 'active') {
      this.gameState.completeQuest('q_reflection_altar');
      this.gameState.startQuest('q_deep_mind_verdict');
    }

    if (this.audio) this.audio.playChime('success');

    this.gameState.emit('notification', {
      title: 'Abyssal Vault Unsealed!',
      message: 'Entering the Sunken Sanctuary of Nerivael the Deep Mind...',
      type: 'quest-completed'
    });

    if (this.onUnlockVault) {
      this.onUnlockVault();
    }
  }

  update(delta, elapsed) {
    if (this.beamGroup && this.beamGroup.visible) {
      const pulse = 0.7 + Math.sin(elapsed * 5.0) * 0.25;
      this.beams.forEach(b => {
        b.material.opacity = pulse;
      });
    }
  }
}
