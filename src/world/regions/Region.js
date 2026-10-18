import * as THREE from 'three';

/**
 * Aethrava - Base Region Module Architecture
 * Standardized template class for all five elemental regions in Aethrava:
 * 1. Embercrest (Fire)
 * 2. Tidewrought (Water)
 * 3. Stonebound (Earth)
 * 4. Skyreavers (Wind)
 * 5. Veilborn (Spirit)
 *
 * Each region subclass encapsulates:
 * - Heightmap & terrain biome geometry with custom PBR materials
 * - Regional landmarks, settlements, architecture, and sacred shrines
 * - Clan NPCs with dialogue trees and trust modifiers
 * - Sacred beasts and ambient wildlife
 * - Environmental puzzles tied to the regional element
 * - Collectible lore pages and key items
 * - Region-specific audio and lighting parameters
 */
export class Region {
  /**
   * @param {THREE.Scene} scene
   * @param {Engine} engine
   * @param {World} world
   * @param {GameState} gameState
   * @param {AudioManager} audio
   * @param {EyeVisionSystem} eyeVision
   * @param {Object} regionData JSON configuration for this region
   */
  constructor(scene, engine, world, gameState, audio, eyeVision, regionData) {
    this.scene = scene;
    this.engine = engine;
    this.world = world;
    this.gameState = gameState;
    this.audio = audio;
    this.eyeVision = eyeVision;
    this.data = regionData || {};

    this.id = this.data.id || 'unknown_region';
    this.name = this.data.name || 'Unnamed Region';

    // Container groups for easy toggling and batch rendering
    this.regionGroup = new THREE.Group();
    this.scene.add(this.regionGroup);

    // Entity registries
    this.npcs = [];
    this.puzzles = {};
    this.pickups = [];
    this.wildlife = [];
    this.interactables = [];
    this.collidables = [];
    this.animatedObjects = [];

    this.isInitialized = false;
  }

  /**
   * Lifecycle: Initializes the region world objects
   */
  init() {
    this.buildTerrain();
    this.buildLandmarks();
    this.spawnNPCs();
    this.spawnWildlife();
    this.spawnPuzzles();
    this.spawnLorePickups();
    this.isInitialized = true;
  }

  /**
   * Override in subclass: Custom heightmap & biome mesh creation
   */
  buildTerrain() {}

  /**
   * Override in subclass: Architecture, settlements, and shrines
   */
  buildLandmarks() {}

  /**
   * Override in subclass: Spawn Clan Chieftain, Smith, Priestess, etc.
   */
  spawnNPCs() {}

  /**
   * Override in subclass: Sacred animals and ambient fauna
   */
  spawnWildlife() {}

  /**
   * Override in subclass: Three regional puzzle types
   */
  spawnPuzzles() {}

  /**
   * Override in subclass: Collectible lore pages
   */
  spawnLorePickups() {}

  /**
   * Register an interactable entity with the global InteractionSystem
   */
  registerInteractable(entity) {
    if (entity) {
      this.interactables.push(entity);
    }
  }

  /**
   * Per-frame simulation tick
   * @param {number} delta Time since last frame (seconds)
   * @param {number} elapsed Total runtime (seconds)
   * @param {Player} player Player reference
   */
  update(delta, elapsed, player) {
    // 1. Update NPCs
    for (let i = 0; i < this.npcs.length; i++) {
      if (this.npcs[i].update) {
        this.npcs[i].update(delta, elapsed);
      }
    }

    // 2. Update Wildlife
    for (let i = 0; i < this.wildlife.length; i++) {
      if (this.wildlife[i].update) {
        this.wildlife[i].update(delta, elapsed, player);
      }
    }

    // 3. Update Puzzles
    for (const key in this.puzzles) {
      if (this.puzzles[key].update) {
        this.puzzles[key].update(delta, elapsed, player);
      }
    }

    // 4. Update Pickups
    for (let i = 0; i < this.pickups.length; i++) {
      if (this.pickups[i].update) {
        this.pickups[i].update(delta, elapsed);
      }
    }

    // 5. Update custom animated objects (lava, spinning wheels, etc.)
    for (let i = 0; i < this.animatedObjects.length; i++) {
      if (this.animatedObjects[i].update) {
        this.animatedObjects[i].update(delta, elapsed);
      }
    }
  }

  /**
   * Returns all collidable meshes for the camera and player raycasters
   */
  getCollidables() {
    return this.collidables;
  }

  /**
   * Cleans up all Three.js meshes and listeners upon region exit
   */
  destroy() {
    if (this.regionGroup) {
      this.scene.remove(this.regionGroup);
    }
    this.npcs = [];
    this.puzzles = {};
    this.pickups = [];
    this.wildlife = [];
    this.interactables = [];
    this.collidables = [];
    this.animatedObjects = [];
    this.isInitialized = false;
  }
}
