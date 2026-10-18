import * as THREE from 'three';

/**
 * Aethrava - The Drowned Causeway (Sunken Path Puzzle)
 * A flooded ocean tidal chasm spanning the coastal crossing.
 * Submerged coral causeway pillars are revealed and illuminated only via Eye Vision [V].
 */
export class SunkenPathPuzzle {
  constructor(scene, world, gameState, audioManager) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;

    this.isEyeVisionActive = false;
    this.isSolved = false;

    // Chasm boundaries: x: [95, 155], z: [52, 72]
    this.chasmMinZ = 52;
    this.chasmMaxZ = 72;
    this.chasmMinX = 95;
    this.chasmMaxX = 155;
    this.waterLevel = -0.5;

    this.createWaterChasm();
    this.createSteppingStones();
  }

  createWaterChasm() {
    this.chasmGroup = new THREE.Group();

    // 1. Churning Ocean Water Surface
    const waterGeo = new THREE.PlaneGeometry(65, 24, 16, 8);
    waterGeo.rotateX(-Math.PI / 2);

    this.waterMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.4,
      transparent: true,
      opacity: 0.85
    });

    this.waterMesh = new THREE.Mesh(waterGeo, this.waterMat);
    this.waterMesh.position.set(125, this.waterLevel, 62);
    this.chasmGroup.add(this.waterMesh);

    // Oceanic point lights
    for (let i = 0; i < 3; i++) {
      const waterLight = new THREE.PointLight(0x38bdf8, 2.0, 16.0);
      waterLight.position.set(110 + i * 15, this.waterLevel + 1.0, 62);
      this.chasmGroup.add(waterLight);
    }

    this.scene.add(this.chasmGroup);
  }

  createSteppingStones() {
    // 7 Sinuous Stepping Stone positions from south shore to north shore
    this.stonePositions = [
      { x: 123.5, z: 53.5 },
      { x: 121.2, z: 56.5 },
      { x: 124.0, z: 59.8 },
      { x: 127.5, z: 62.5 },
      { x: 129.2, z: 65.5 },
      { x: 126.8, z: 68.5 },
      { x: 124.5, z: 71.5 }
    ];

    this.stoneRadius = 1.45;
    this.stoneMeshes = [];

    const stoneGeo = new THREE.CylinderGeometry(1.3, 1.5, 2.2, 10);
    this.coralMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });

    this.runeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });

    const runeRingGeo = new THREE.RingGeometry(0.5, 1.05, 12);
    runeRingGeo.rotateX(-Math.PI / 2);

    this.stonePositions.forEach((pos) => {
      const stoneGroup = new THREE.Group();
      stoneGroup.position.set(pos.x, this.waterLevel - 0.35, pos.z);

      const stoneMesh = new THREE.Mesh(stoneGeo, this.coralMat);
      stoneMesh.position.y = 0.5;
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      stoneGroup.add(stoneMesh);

      const runeMesh = new THREE.Mesh(runeRingGeo, this.runeMat);
      runeMesh.position.y = 1.61;
      stoneGroup.add(runeMesh);

      this.scene.add(stoneGroup);
      this.stoneMeshes.push({ group: stoneGroup, pos, runeMesh, baseY: this.waterLevel - 0.35 });
    });
  }

  onEyeVisionStateChange(isActive) {
    this.isEyeVisionActive = isActive;

    this.stoneMeshes.forEach((stone) => {
      if (isActive) {
        stone.group.position.y = stone.baseY + 0.45;
        stone.runeMesh.material.opacity = 0.95;
      } else {
        stone.group.position.y = stone.baseY;
        stone.runeMesh.material.opacity = 0.15;
      }
    });

    if (this.waterMat) {
      this.waterMat.opacity = isActive ? 0.45 : 0.85;
    }
  }

  update(delta, elapsed, player) {
    if (!player) return;

    // Animated water pulse
    if (this.waterMat) {
      const pulse = 0.7 + Math.sin(elapsed * 2.5) * 0.3;
      this.waterMat.emissiveIntensity = pulse;
    }

    const px = player.position.x;
    const pz = player.position.z;

    // Inside flooded zone?
    if (pz >= this.chasmMinZ && pz <= this.chasmMaxZ && px >= this.chasmMinX && px <= this.chasmMaxX) {
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
        // Deep water undertow! Push player back safely to south shore with alert
        player.position.z = this.chasmMinZ - 1.2;
        player.position.y = this.world.getGroundHeight(player.position.x, player.position.z);
        player.velocity.set(0, 0, 0);

        this.gameState.emit('notification', {
          title: 'Strong Undertow!',
          message: 'The surging ocean tide is deep and treacherous. Activate Eye Vision [V] to reveal the submerged causeway.',
          type: 'trust-negative'
        });
      }
    }

    // Reached north shore?
    if (pz >= this.chasmMaxZ + 1.0 && px >= this.chasmMinX && px <= this.chasmMaxX && !this.isSolved) {
      this.isSolved = true;
      if (this.audio) this.audio.playChime('success');

      if (this.gameState.getQuestState('q_sunken_depths') === 'active') {
        this.gameState.completeObjective('q_sunken_depths', 'obj_cross_sunken');
      }

      this.gameState.emit('notification', {
        title: 'Drowned Causeway Crossed',
        message: 'You have safely navigated the submerged arches to the Temple of Tides!',
        type: 'quest'
      });
    }
  }
}
