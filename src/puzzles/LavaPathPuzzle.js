import * as THREE from 'three';

/**
 * Aethrava - The Molten Crossing (Lava Path Puzzle)
 * A boiling river of lava spanning the Molten Chasm.
 * Submerged obsidian stepping stones are revealed and illuminated only via Eye Vision [V].
 */
export class LavaPathPuzzle {
  constructor(scene, world, gameState, audioManager) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;

    this.isEyeVisionActive = false;
    this.isSolved = false;

    // Chasm boundaries: x: [-35, 35], z: [52, 70]
    this.chasmMinZ = 52;
    this.chasmMaxZ = 70;
    this.lavaLevel = -1.2;

    this.createLavaChasm();
    this.createSteppingStones();
  }

  createLavaChasm() {
    this.chasmGroup = new THREE.Group();

    // 1. Molten Lava Surface
    const lavaGeo = new THREE.PlaneGeometry(80, 22, 16, 8);
    lavaGeo.rotateX(-Math.PI / 2);

    this.lavaMat = new THREE.MeshStandardMaterial({
      color: 0xff3700,
      emissive: 0xff4500,
      emissiveIntensity: 3.0,
      roughness: 0.2,
      metalness: 0.1
    });

    this.lavaMesh = new THREE.Mesh(lavaGeo, this.lavaMat);
    this.lavaMesh.position.set(0, this.lavaLevel, 61);
    this.chasmGroup.add(this.lavaMesh);

    // Dynamic lava lights
    for (let i = 0; i < 3; i++) {
      const lavaLight = new THREE.PointLight(0xff4500, 2.5, 18.0);
      lavaLight.position.set((i - 1) * 22, this.lavaLevel + 1.2, 61);
      this.chasmGroup.add(lavaLight);
    }

    this.scene.add(this.chasmGroup);
  }

  createSteppingStones() {
    // 7 Sinuous Stepping Stone positions from south bank to north bank
    this.stonePositions = [
      { x: -1.5, z: 53.5 },
      { x: -3.8, z: 56.5 },
      { x: -1.0, z: 59.5 },
      { x:  2.5, z: 62.0 },
      { x:  4.2, z: 64.8 },
      { x:  1.8, z: 67.5 },
      { x: -0.5, z: 70.2 }
    ];

    this.stoneRadius = 1.35;
    this.stoneMeshes = [];

    const stoneGeo = new THREE.CylinderGeometry(1.2, 1.4, 1.8, 10);
    this.obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.8,
      metalness: 0.2
    });

    this.runeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });

    const runeRingGeo = new THREE.RingGeometry(0.5, 0.95, 12);
    runeRingGeo.rotateX(-Math.PI / 2);

    this.stonePositions.forEach((pos, idx) => {
      const stoneGroup = new THREE.Group();
      stoneGroup.position.set(pos.x, this.lavaLevel - 0.2, pos.z);

      const stoneMesh = new THREE.Mesh(stoneGeo, this.obsidianMat);
      stoneMesh.position.y = 0.5;
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      stoneGroup.add(stoneMesh);

      // Glowing Eye Vision Runic Emblem on stone top
      const runeMesh = new THREE.Mesh(runeRingGeo, this.runeMat);
      runeMesh.position.y = 1.41;
      stoneGroup.add(runeMesh);

      this.scene.add(stoneGroup);
      this.stoneMeshes.push({ group: stoneGroup, pos, runeMesh, baseY: this.lavaLevel - 0.2 });
    });
  }

  onEyeVisionStateChange(isActive) {
    this.isEyeVisionActive = isActive;

    this.stoneMeshes.forEach((stone, idx) => {
      if (isActive) {
        // Raise stones and illuminate cyan runes
        stone.group.position.y = stone.baseY + 0.35;
        stone.runeMesh.material.opacity = 0.9;
      } else {
        stone.group.position.y = stone.baseY;
        stone.runeMesh.material.opacity = 0.15;
      }
    });
  }

  update(delta, elapsed, player) {
    if (!player) return;

    // Animated pulsating lava glow
    if (this.lavaMat) {
      const pulse = 2.6 + Math.sin(elapsed * 3.0) * 0.5;
      this.lavaMat.emissiveIntensity = pulse;
    }

    // Check player interaction with the lava chasm
    const px = player.position.x;
    const pz = player.position.z;

    // Inside chasm zone?
    if (pz >= this.chasmMinZ && pz <= this.chasmMaxZ && Math.abs(px) < 32) {
      // Check if player is standing on any stepping stone
      let onSafeStone = false;
      for (let i = 0; i < this.stonePositions.length; i++) {
        const s = this.stonePositions[i];
        const dist = Math.hypot(px - s.x, pz - s.z);
        if (dist <= this.stoneRadius) {
          onSafeStone = true;
          break;
        }
      }

      if (!onSafeStone) {
        // In lava! Push player back safely to south bank with warning
        player.position.z = this.chasmMinZ - 1.2;
        player.position.y = this.world.getGroundHeight(player.position.x, player.position.z);
        player.velocity.set(0, 0, 0);

        this.gameState.emit('notification', {
          title: 'Extreme Heat!',
          message: 'The boiling magma is lethal. Activate Eye Vision [V] to reveal the submerged stepping stones.',
          type: 'trust-negative'
        });
      }
    }

    // Reached north bank?
    if (pz >= this.chasmMaxZ + 1.0 && !this.isSolved) {
      this.isSolved = true;
      if (this.audio) this.audio.playChime('success');

      if (this.gameState.getQuestState('q_molten_crossing') === 'active') {
        this.gameState.completeObjective('q_molten_crossing', 'obj_cross_lava');
      }

      this.gameState.emit('notification', {
        title: 'Molten Chasm Traversed',
        message: 'You have safely crossed into the Temple of the Sacred Pyre!',
        type: 'quest'
      });
    }
  }
}
