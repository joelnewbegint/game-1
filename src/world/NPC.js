import * as THREE from 'three';

/**
 * Aethrava - Lorekeeper Elara NPC (Test NPC)
 * Embercrest elder scholar who guides the player and grants quests.
 */
export class NPC {
  constructor(scene, world, config = {}) {
    this.scene = scene;
    this.world = world;
    this.id = config.id || 'elara';
    this.name = config.name || 'Lorekeeper Elara';
    this.clanId = config.clanId || 'embercrest';
    this.dialogueTreeId = config.dialogueTreeId || 'elara_dialogue';
    this.interactionRadius = config.radius || 3.0;

    this.position = new THREE.Vector3(config.x || 3.5, 0, config.z || 2.2);
    this.position.y = this.world.getGroundHeight(this.position.x, this.position.z);

    this.createModel();
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // Robes & fabrics
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x4a1d13, // Deep Embercrest terracotta
      roughness: 0.8
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a047, // Gold embroidered borders
      roughness: 0.5,
      metalness: 0.2
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.6
    });

    // 1. Robe Torso & Skirt
    const skirtGeo = new THREE.ConeGeometry(0.55, 1.3, 12, 1, true);
    const skirt = new THREE.Mesh(skirtGeo, robeMat);
    skirt.position.y = 0.65;
    skirt.castShadow = true;
    this.mesh.add(skirt);

    const torsoGeo = new THREE.CylinderGeometry(0.32, 0.4, 0.8, 12);
    const torso = new THREE.Mesh(torsoGeo, robeMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    this.mesh.add(torso);

    // Sash / gold mantle
    const sashGeo = new THREE.TorusGeometry(0.38, 0.08, 6, 16);
    sashGeo.rotateX(Math.PI / 2);
    const sash = new THREE.Mesh(sashGeo, trimMat);
    sash.position.y = 1.05;
    this.mesh.add(sash);

    // 2. Head & Veil
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 1.85;

    const hoodGeo = new THREE.SphereGeometry(0.3, 14, 12);
    const hood = new THREE.Mesh(hoodGeo, robeMat);
    hood.castShadow = true;
    this.headGroup.add(hood);

    const faceGeo = new THREE.SphereGeometry(0.22, 10, 10);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.position.set(0, -0.02, 0.12);
    face.scale.set(0.9, 1.0, 0.85);
    this.headGroup.add(face);

    this.mesh.add(this.headGroup);

    // 3. Lorekeeper's Fire Staff
    this.staffGroup = new THREE.Group();
    this.staffGroup.position.set(0.48, 0, 0.2);

    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2817, roughness: 0.9 });
    const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.3, 8);
    const shaft = new THREE.Mesh(shaftGeo, woodMat);
    shaft.position.y = 1.15;
    shaft.castShadow = true;
    this.staffGroup.add(shaft);

    // Crystal head of staff
    const crystalGeo = new THREE.OctahedronGeometry(0.18);
    this.crystalMat = new THREE.MeshStandardMaterial({
      color: 0xff5c2b,
      emissive: 0xff4500,
      emissiveIntensity: 2.2,
      roughness: 0.2
    });
    this.staffCrystal = new THREE.Mesh(crystalGeo, this.crystalMat);
    this.staffCrystal.position.y = 2.35;
    this.staffGroup.add(this.staffCrystal);

    this.staffLight = new THREE.PointLight(0xff6622, 1.5, 4.0);
    this.staffLight.position.y = 2.4;
    this.staffGroup.add(this.staffLight);

    this.mesh.add(this.staffGroup);

    // Turn Elara slightly towards the central dais
    this.mesh.rotation.y = -Math.PI * 0.35;

    this.scene.add(this.mesh);
  }

  update(delta, elapsed) {
    // Subtle idle breathing and crystal float
    if (this.staffCrystal) {
      this.staffCrystal.rotation.y = elapsed * 1.5;
      const pulse = 1.8 + Math.sin(elapsed * 3) * 0.4;
      this.crystalMat.emissiveIntensity = pulse;
      this.staffLight.intensity = pulse * 0.8;
    }
    if (this.headGroup) {
      this.headGroup.position.y = 1.85 + Math.sin(elapsed * 1.8) * 0.015;
    }
  }

  getPromptText() {
    return `Speak with ${this.name}`;
  }

  getInteractionPosition() {
    return new THREE.Vector3(this.position.x, this.position.y + 1.8, this.position.z);
  }
}
