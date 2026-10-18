import * as THREE from 'three';
import { Time } from './Time.js';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - Core 3D Engine Wrapper
 * Manages Three.js renderer, scene, camera, resize lifecycle, and animation loop.
 */
export class Engine {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.time = new Time();
    this.updateCallbacks = [];
    this.isPaused = false;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.camera.fov,
      aspect,
      GAME_CONFIG.camera.near,
      GAME_CONFIG.camera.far
    );

    // 3. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, GAME_CONFIG.rendering.maxPixelRatio));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = GAME_CONFIG.rendering.toneMappingExposure;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.renderer.domElement.id = 'aethrava-canvas';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.container.appendChild(this.renderer.domElement);

    // 4. Resize listener
    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize);

    // 5. Start animation loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, GAME_CONFIG.rendering.maxPixelRatio));
  }

  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  removeUpdateCallback(callback) {
    const index = this.updateCallbacks.indexOf(callback);
    if (index > -1) {
      this.updateCallbacks.splice(index, 1);
    }
  }

  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    if (this.isPaused) return;

    const delta = this.time.update();
    const elapsed = this.time.elapsed;

    // Call updates
    for (let i = 0; i < this.updateCallbacks.length; i++) {
      this.updateCallbacks[i](delta, elapsed);
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
