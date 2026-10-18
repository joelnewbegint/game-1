import * as THREE from 'three';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - World Lighting System
 * Configures directional sun with shadow mapping, ambient fill, and hemisphere bounce light.
 */
export class Lighting {
  constructor(scene) {
    this.scene = scene;

    // 1. Ambient Light (cool skylight fill)
    this.ambientLight = new THREE.AmbientLight(0xd4e2f0, 0.65);
    this.scene.add(this.ambientLight);

    // 2. Hemisphere Light (natural outdoor sky/ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xe8f0f8, 0x3d4332, 0.55);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // 3. Directional Sun Light
    this.sunLight = new THREE.DirectionalLight(0xfff5e4, 2.2);
    this.sunLight.castShadow = true;

    // High quality shadow map setup
    const shadowMapSize = GAME_CONFIG.rendering.shadowMapSize;
    this.sunLight.shadow.mapSize.width = shadowMapSize;
    this.sunLight.shadow.mapSize.height = shadowMapSize;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 250;

    const shadowDist = GAME_CONFIG.rendering.shadowDistance;
    this.sunLight.shadow.camera.left = -shadowDist;
    this.sunLight.shadow.camera.right = shadowDist;
    this.sunLight.shadow.camera.top = shadowDist;
    this.sunLight.shadow.camera.bottom = -shadowDist;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);
  }

  setSunPosition(sunVector) {
    // Position the sun light at a distance along the sun vector
    const distance = 120;
    this.sunLight.position.copy(sunVector).multiplyScalar(distance);
  }

  update(playerPos) {
    if (!playerPos) return;

    // Keep the sun shadow frustum centered smoothly over the player
    this.sunLight.target.position.set(playerPos.x, playerPos.y, playerPos.z);
    this.sunLight.position.x = playerPos.x + this.sunVectorOffset.x;
    this.sunLight.position.y = playerPos.y + this.sunVectorOffset.y;
    this.sunLight.position.z = playerPos.z + this.sunVectorOffset.z;
  }

  setSunOffset(offset) {
    this.sunVectorOffset = offset.clone();
  }
}
