import * as THREE from 'three';

/**
 * Aethrava - World Pickup Item Entity
 * Floating, glowing relic that can be collected in the world.
 */
export class PickupItem {
  constructor(scene, world, config = {}) {
    this.scene = scene;
    this.world = world;
    this.id = config.id || 'pickup_fire_fragment';
    this.itemId = config.itemId || 'ancient_fire_fragment';
    this.name = config.name || 'Ancient Fire Fragment';
    this.interactionRadius = config.radius || 2.6;
    this.collected = false;

    this.position = new THREE.Vector3(config.x || 0, 0, config.z || 30.5);
    this.baseY = this.world.getGroundHeight(this.position.x, this.position.z) + 1.1;
    this.position.y = this.baseY;

    this.createModel();
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    // Glowing crystalline fire shard
    const shardGeo = new THREE.OctahedronGeometry(0.38, 0);
    shardGeo.scale(0.8, 1.4, 0.8);

    this.shardMat = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff6600,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.1
    });

    this.shardMesh = new THREE.Mesh(shardGeo, this.shardMat);
    this.mesh.add(this.shardMesh);

    // Outer rotating energy ring
    const ringGeo = new THREE.TorusGeometry(0.55, 0.035, 8, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfde047,
      transparent: true,
      opacity: 0.75
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.mesh.add(this.ringMesh);

    // Warm point light illuminating the ground
    this.light = new THREE.PointLight(0xff6600, 2.0, 5.5);
    this.mesh.add(this.light);

    this.scene.add(this.mesh);
  }

  update(delta, elapsed) {
    if (this.collected || !this.mesh.visible) return;

    // Floating bob & rotation
    const bob = Math.sin(elapsed * 2.5) * 0.15;
    this.mesh.position.y = this.baseY + bob;

    this.shardMesh.rotation.y = elapsed * 1.8;
    this.shardMesh.rotation.x = Math.sin(elapsed) * 0.2;

    this.ringMesh.rotation.x = elapsed * 1.2;
    this.ringMesh.rotation.y = elapsed * 0.8;

    // Emissive flame flickering
    const pulse = 2.4 + Math.sin(elapsed * 4.0) * 0.6;
    this.shardMat.emissiveIntensity = pulse;
    this.light.intensity = pulse * 0.8;
  }

  getPromptText() {
    return `Collect ${this.name}`;
  }

  getInteractionPosition() {
    return new THREE.Vector3(this.mesh.position.x, this.mesh.position.y + 0.6, this.mesh.position.z);
  }

  collect(gameState) {
    if (this.collected) return;
    this.collected = true;
    this.mesh.visible = false;

    // Add item to inventory
    gameState.addItem(this.itemId);

    // Advance quest objective if relevant
    if (gameState.getQuestState('q_ember_relic') === 'active') {
      gameState.completeObjective('q_ember_relic', 'obj_retrieve_fragment');
    }
  }

  syncWithState(gameState) {
    if (gameState.hasItem(this.itemId) || gameState.getQuestState('q_ember_relic') === 'completed') {
      this.collected = true;
      this.mesh.visible = false;
    } else {
      this.collected = false;
      this.mesh.visible = true;
    }
  }
}
