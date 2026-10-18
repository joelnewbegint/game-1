import * as THREE from 'three';

/**
 * Aethrava - The Pillars of Ignareth (Temple Prism Puzzle)
 * Three rotating igneous focus prisms on pedestals.
 * The player rotates each prism by 90° until solar light converges on the Caldera Sun Gate.
 */
export class TemplePrismPuzzle {
  constructor(scene, world, gameState, audioManager, onUnlockGate) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;
    this.onUnlockGate = onUnlockGate;

    this.isAligned = false;
    this.isUnlocked = false;

    // Prisms configuration (Left, Center, Right)
    this.prisms = [
      { id: 'prism_left', x: -8, z: 98, angle: 90, targetAngle: 0 },
      { id: 'prism_center', x: 0, z: 92, angle: 90, targetAngle: 0 },
      { id: 'prism_right', x: 8, z: 98, angle: 270, targetAngle: 0 }
    ];

    this.gatePos = new THREE.Vector3(0, 0, 108);
    this.gatePos.y = this.world.getGroundHeight(this.gatePos.x, this.gatePos.z);

    this.createTempleGate();
    this.createPrismPedestals();
    this.createLightBeams();
  }

  createTempleGate() {
    this.gateGroup = new THREE.Group();
    this.gateGroup.position.copy(this.gatePos);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 1.2,
      roughness: 0.3
    });

    // Grand Portal Pillars
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

    // Central Sun Seal (Lock receptacle)
    const sealGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.4, 16);
    sealGeo.rotateX(Math.PI / 2);
    this.sunSealMesh = new THREE.Mesh(sealGeo, goldMat);
    this.sunSealMesh.position.set(0, 4.5, 0.2);
    this.gateGroup.add(this.sunSealMesh);

    this.scene.add(this.gateGroup);
  }

  createPrismPedestals() {
    this.prismMeshes = [];
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.8 });
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff3700,
      emissiveIntensity: 2.2,
      roughness: 0.1
    });

    const pedestalGeo = new THREE.CylinderGeometry(0.8, 1.1, 2.2, 8);
    const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
    crystalGeo.scale(0.8, 1.4, 0.8);

    this.prisms.forEach((p, idx) => {
      const y = this.world.getGroundHeight(p.x, p.z);
      const group = new THREE.Group();
      group.position.set(p.x, y, p.z);

      const pedestal = new THREE.Mesh(pedestalGeo, stoneMat);
      pedestal.position.y = 1.1;
      pedestal.castShadow = true;
      group.add(pedestal);

      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.7;
      crystal.castShadow = true;
      group.add(crystal);

      // Light pointing from crystal
      const light = new THREE.PointLight(0xff6600, 1.8, 6.0);
      light.position.y = 2.8;
      group.add(light);

      group.rotation.y = THREE.MathUtils.degToRad(p.angle);

      this.scene.add(group);
      this.prismMeshes.push({ group, crystal, data: p, idx });
    });
  }

  createLightBeams() {
    // 3 Laser beams that connect from each prism to the Gate Sun Seal when aligned
    this.beamGroup = new THREE.Group();
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.beams = [];
    this.prisms.forEach(p => {
      const start = new THREE.Vector3(p.x, this.world.getGroundHeight(p.x, p.z) + 2.7, p.z);
      const end = new THREE.Vector3(this.gatePos.x, this.gatePos.y + 4.5, this.gatePos.z);
      const dist = start.distanceTo(end);

      const beamGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
      beamGeo.rotateX(Math.PI / 2);
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);

      // Position halfway between start and end and lookAt end
      beamMesh.position.copy(start).lerp(end, 0.5);
      beamMesh.lookAt(end);

      this.beamGroup.add(beamMesh);
      this.beams.push(beamMesh);
    });

    this.beamGroup.visible = false;
    this.scene.add(this.beamGroup);
  }

  rotatePrism(idx) {
    const p = this.prisms[idx];
    p.angle = (p.angle + 90) % 360;

    const meshObj = this.prismMeshes[idx];
    meshObj.group.rotation.y = THREE.MathUtils.degToRad(p.angle);

    if (this.audio) this.audio.playChime('puzzle');

    this.checkAlignment();
  }

  checkAlignment() {
    // Check if all 3 prisms are at angle 0°
    const allAligned = this.prisms.every(p => p.angle === p.targetAngle);

    if (allAligned && !this.isAligned) {
      this.isAligned = true;
      this.beamGroup.visible = true;

      if (this.audio) this.audio.playChime('success');

      if (this.gameState.getQuestState('q_temple_prisms') === 'active') {
        this.gameState.completeObjective('q_temple_prisms', 'obj_align_prisms');
      }

      this.gameState.emit('notification', {
        title: 'Solar Prisms Aligned!',
        message: 'The light beams focus on the Caldera Gate. Insert the Obsidian Sun Key to enter.',
        type: 'quest'
      });
    } else if (!allAligned) {
      this.isAligned = false;
      this.beamGroup.visible = false;
    }
  }

  unlockGate() {
    if (!this.isAligned) {
      this.gameState.emit('notification', {
        title: 'Gate Sealed',
        message: 'The sun seal remains dark. Align the three Pyre Focus Prisms first.',
        type: 'trust-negative'
      });
      return;
    }

    if (!this.gameState.hasItem('temple_sun_key')) {
      this.gameState.emit('notification', {
        title: 'Key Required',
        message: 'You need the Obsidian Sun Key forged in Cinderfall.',
        type: 'trust-negative'
      });
      return;
    }

    if (this.isUnlocked) return;
    this.isUnlocked = true;

    if (this.gameState.getQuestState('q_temple_prisms') === 'active') {
      this.gameState.completeQuest('q_temple_prisms');
      this.gameState.startQuest('q_burning_mother');
    }

    if (this.audio) this.audio.playChime('success');

    this.gameState.emit('notification', {
      title: 'Caldera Gate Opened!',
      message: 'Entering Ignareth\'s Caldera Sanctum...',
      type: 'quest-completed'
    });

    if (this.onUnlockGate) {
      this.onUnlockGate();
    }
  }

  update(delta, elapsed) {
    if (this.beamGroup && this.beamGroup.visible) {
      const pulse = 0.7 + Math.sin(elapsed * 6.0) * 0.25;
      this.beams.forEach(b => {
        b.material.opacity = pulse;
      });
    }
  }
}
