import * as THREE from 'three';
import { LORE_PAGES } from '../data/lorePages.js';

/**
 * Aethrava - Collectible Lore Page Entity
 * In-world parchment page object.
 * Can be normal or hidden (only revealed and collectible via Eye Vision).
 */
export class LorePagePickup {
  constructor(scene, world, config = {}) {
    this.scene = scene;
    this.world = world;
    this.pageId = config.pageId || 'lore_ember_2';
    this.requiresEyeVision = !!config.requiresEyeVision;
    this.interactionRadius = config.radius || 2.5;
    this.collected = false;
    this.isEyeVisionActive = false;

    this.position = new THREE.Vector3(config.x || 0, 0, config.z || 0);
    this.baseY = this.world.getGroundHeight(this.position.x, this.position.z) + (config.yOffset || 0.85);
    this.position.y = this.baseY;

    this.pageData = LORE_PAGES[this.pageId] || { title: 'Unknown Lore Fragment', clanColor: '#38bdf8' };

    this.createModel();
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // 1. Ancient Parchment Page Geometry
    const pageGeo = new THREE.PlaneGeometry(0.55, 0.75, 4, 4);
    // Subtle curl on vertices
    const pos = pageGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 5) * 0.04);
    }
    pageGeo.computeVertexNormals();

    const color = this.requiresEyeVision ? 0x00f0ff : 0xfde047;
    const emissive = this.requiresEyeVision ? 0x00d8ff : 0xf59e0b;

    this.mat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: emissive,
      emissiveIntensity: this.requiresEyeVision ? 2.5 : 1.2,
      roughness: 0.4,
      side: THREE.DoubleSide
    });

    this.pageMesh = new THREE.Mesh(pageGeo, this.mat);
    this.pageMesh.rotation.x = -Math.PI / 4;
    this.mesh.add(this.pageMesh);

    // 2. Glowing Rune / Eye Glyph hovering above
    const runeGeo = this.requiresEyeVision ? new THREE.RingGeometry(0.12, 0.22, 16) : new THREE.OctahedronGeometry(0.12);
    const runeMat = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    this.runeMesh = new THREE.Mesh(runeGeo, runeMat);
    this.runeMesh.position.y = 0.55;
    this.mesh.add(this.runeMesh);

    // 3. Point Light
    this.light = new THREE.PointLight(color, this.requiresEyeVision ? 2.2 : 1.2, 4.5);
    this.light.position.y = 0.4;
    this.mesh.add(this.light);

    // Initial visibility
    if (this.requiresEyeVision) {
      this.mesh.visible = false;
    }

    this.scene.add(this.mesh);
  }

  onEyeVisionStateChange(isActive) {
    this.isEyeVisionActive = isActive;
    if (this.collected) {
      this.mesh.visible = false;
      return;
    }

    if (this.requiresEyeVision) {
      this.mesh.visible = isActive;
    }
  }

  update(delta, elapsed) {
    if (this.collected || !this.mesh.visible) return;

    // Floating bob & rotation
    const bob = Math.sin(elapsed * 2.2 + this.position.x) * 0.12;
    this.mesh.position.y = this.baseY + bob;

    this.pageMesh.rotation.y = elapsed * 0.9;
    this.runeMesh.rotation.y = elapsed * 1.8;
    this.runeMesh.rotation.z = Math.sin(elapsed) * 0.3;

    // Emissive pulsing
    const pulse = 1.5 + Math.sin(elapsed * 3.5) * 0.5;
    this.mat.emissiveIntensity = pulse * (this.requiresEyeVision ? 1.5 : 1.0);
    this.light.intensity = pulse;
  }

  getPromptText() {
    if (this.requiresEyeVision) {
      return `[Eye Vision] Uncover Page: ${this.pageData.title}`;
    }
    return `Collect Lore Page: ${this.pageData.title}`;
  }

  getInteractionPosition() {
    return new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 0.4, this.mesh.position.z);
  }

  collect(gameState) {
    if (this.collected) return;
    if (this.requiresEyeVision && !this.isEyeVisionActive) return;

    this.collected = true;
    this.mesh.visible = false;

    // Add page to inventory in GameState
    gameState.addLorePage(this.pageId);
  }

  syncWithState(gameState) {
    if (gameState.inventory.lorePages.includes(this.pageId)) {
      this.collected = true;
      this.mesh.visible = false;
    } else {
      this.collected = false;
      if (this.requiresEyeVision) {
        this.mesh.visible = this.isEyeVisionActive;
      } else {
        this.mesh.visible = true;
      }
    }
  }
}
