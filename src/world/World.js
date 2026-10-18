import { Lighting } from './Lighting.js';
import { SkyDome } from './SkyDome.js';
import { Terrain } from './Terrain.js';

/**
 * Aethrava - World Orchestrator
 * Connects terrain, sky, atmospheric lighting, and environment props.
 */
export class World {
  constructor(scene) {
    this.scene = scene;

    // 1. Lighting
    this.lighting = new Lighting(this.scene);

    // 2. Sky & Atmosphere
    this.skyDome = new SkyDome(this.scene, this.lighting);

    // 3. Terrain
    this.terrain = new Terrain(this.scene);
  }

  update(playerPos) {
    if (this.lighting && playerPos) {
      this.lighting.update(playerPos);
    }
  }

  getGroundHeight(x, z) {
    return this.terrain.getHeight(x, z);
  }

  getCollidables() {
    return this.terrain.collidableObjects;
  }
}
