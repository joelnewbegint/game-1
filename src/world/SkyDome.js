import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - SkyDome & Atmospheric Scattering
 * Uses physical Rayleigh/Mie scattering model and syncs with scene fog and sun light.
 */
export class SkyDome {
  constructor(scene, lighting) {
    this.scene = scene;
    this.lighting = lighting;

    // 1. Three.js Sky Object
    this.sky = new Sky();
    this.sky.scale.setScalar(1000);
    this.scene.add(this.sky);

    // Sky shader uniforms
    const uniforms = this.sky.material.uniforms;
    uniforms['turbidity'].value = 4.0;
    uniforms['rayleigh'].value = 1.8;
    uniforms['mieCoefficient'].value = 0.005;
    uniforms['mieDirectionalG'].value = 0.8;

    // 2. Realistic Distance Fog
    this.scene.fog = new THREE.FogExp2(GAME_CONFIG.world.fogColor, 0.0065);

    // 3. Compute initial sun position
    this.sunVector = new THREE.Vector3();
    this.updateSunPosition(GAME_CONFIG.world.skyElevation, GAME_CONFIG.world.skyAzimuth);
  }

  updateSunPosition(elevationDegrees, azimuthDegrees) {
    const phi = THREE.MathUtils.degToRad(90 - elevationDegrees);
    const theta = THREE.MathUtils.degToRad(azimuthDegrees);

    this.sunVector.setFromSphericalCoords(1, phi, theta);
    this.sky.material.uniforms['sunPosition'].value.copy(this.sunVector);

    const sunOffset = this.sunVector.clone().multiplyScalar(100);
    this.lighting.setSunOffset(sunOffset);
    this.lighting.setSunPosition(this.sunVector);
  }
}
