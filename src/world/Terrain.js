import * as THREE from 'three';
import { GAME_CONFIG } from '../data/gameConfig.js';

/**
 * Aethrava - World Terrain & Environment
 * Creates textured terrain with analytical heightmap, fantasy ruins, and standing monoliths.
 */
export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.size = GAME_CONFIG.world.terrainSize;
    this.segments = GAME_CONFIG.world.terrainSegments;
    this.collidableObjects = [];

    // 1. Procedural ground textures
    const { diffuseMap, normalMap, roughnessMap } = this.generateProceduralTextures();

    // 2. Terrain Geometry with natural rolling terrain
    const geometry = new THREE.PlaneGeometry(this.size, this.size, this.segments, this.segments);
    geometry.rotateX(-Math.PI / 2);

    const posAttr = geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = this.getHeight(x, z);
      posAttr.setY(i, y);
    }
    geometry.computeVertexNormals();

    // 3. Terrain Material
    const material = new THREE.MeshStandardMaterial({
      map: diffuseMap,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
    this.collidableObjects.push(this.mesh);

    // 4. Add Landmark Props (Ancient Ruins of the First Eye)
    this.createLandmarks();
  }

  /**
   * Analytical height function for instantaneous zero-latency ground collision
   */
  getHeight(x, z) {
    // Keep central starting clearing flat
    const distFromOrigin = Math.sqrt(x * x + z * z);
    const clearingRadius = 14;
    const blendZone = 25;

    // Subtle gentle rolling hills
    const hill1 = Math.sin(x * 0.035) * Math.cos(z * 0.035) * 3.2;
    const hill2 = Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.07 + 0.8) * 1.4;
    const hill3 = Math.sin(x * 0.015 - 0.5) * Math.cos(z * 0.018 + 0.5) * 5.0;
    const rawHeight = hill1 + hill2 + hill3;

    if (distFromOrigin < clearingRadius) {
      return 0;
    } else if (distFromOrigin < clearingRadius + blendZone) {
      const t = (distFromOrigin - clearingRadius) / blendZone;
      const smoothT = t * t * (3 - 2 * t);
      return rawHeight * smoothT;
    } else {
      return rawHeight;
    }
  }

  generateProceduralTextures() {
    const canvasSize = 512;

    // Diffuse Canvas
    const dCanvas = document.createElement('canvas');
    dCanvas.width = canvasSize;
    dCanvas.height = canvasSize;
    const dCtx = dCanvas.getContext('2d');

    // Base earth/grass gradient
    dCtx.fillStyle = '#3a4e2f';
    dCtx.fillRect(0, 0, canvasSize, canvasSize);

    // Multi-frequency noise specks
    const imgData = dCtx.getImageData(0, 0, canvasSize, canvasSize);
    const data = imgData.data;

    // Simple pseudo-random hash for deterministic texture
    const hash = (x, y) => {
      let n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return n - Math.floor(n);
    };

    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        const idx = (y * canvasSize + x) * 4;
        const n1 = hash(x * 0.05, y * 0.05);
        const n2 = hash(x * 0.2, y * 0.2);
        const n3 = Math.sin(x * 0.04) * Math.cos(y * 0.04) * 0.5 + 0.5;

        // Rich fantasy meadow palette (warm lush grass, dry earth, subtle moss)
        const r = Math.floor(48 + n1 * 25 + n2 * 15 + n3 * 10);
        const g = Math.floor(75 + n1 * 35 + n2 * 20 + n3 * 25);
        const b = Math.floor(38 + n1 * 18 + n2 * 12);

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }
    dCtx.putImageData(imgData, 0, 0);

    // Normal Map Canvas
    const nCanvas = document.createElement('canvas');
    nCanvas.width = canvasSize;
    nCanvas.height = canvasSize;
    const nCtx = nCanvas.getContext('2d');
    const nImgData = nCtx.createImageData(canvasSize, canvasSize);
    const nData = nImgData.data;

    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        const idx = (y * canvasSize + x) * 4;
        const nx = Math.floor(128 + (hash(x * 0.15, y * 0.15) - 0.5) * 50);
        const ny = Math.floor(128 + (hash(x * 0.15 + 10, y * 0.15 + 10) - 0.5) * 50);
        nData[idx] = nx;
        nData[idx + 1] = ny;
        nData[idx + 2] = 255;
        nData[idx + 3] = 255;
      }
    }
    nCtx.putImageData(nImgData, 0, 0);

    const diffuseMap = new THREE.CanvasTexture(dCanvas);
    diffuseMap.wrapS = THREE.RepeatWrapping;
    diffuseMap.wrapT = THREE.RepeatWrapping;
    diffuseMap.repeat.set(24, 24);

    const normalMap = new THREE.CanvasTexture(nCanvas);
    normalMap.wrapS = THREE.RepeatWrapping;
    normalMap.wrapT = THREE.RepeatWrapping;
    normalMap.repeat.set(24, 24);

    return { diffuseMap, normalMap, roughnessMap: null };
  }

  createLandmarks() {
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x6e737a,
      roughness: 0.9,
      metalness: 0.1
    });

    const runeMaterial = new THREE.MeshStandardMaterial({
      color: 0x3ac4d6,
      emissive: 0x2194a8,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });

    // 1. Central Ancient Dais (Order of the Open Eye starting shrine)
    const daisGeo = new THREE.CylinderGeometry(6.5, 7.2, 0.45, 16);
    const daisMesh = new THREE.Mesh(daisGeo, stoneMaterial);
    daisMesh.position.set(0, 0.2, 0);
    daisMesh.receiveShadow = true;
    daisMesh.castShadow = true;
    this.scene.add(daisMesh);
    this.collidableObjects.push(daisMesh);

    // Inner eye ring on dais
    const eyeRingGeo = new THREE.TorusGeometry(3.5, 0.12, 8, 32);
    eyeRingGeo.rotateX(Math.PI / 2);
    const eyeRing = new THREE.Mesh(eyeRingGeo, runeMaterial);
    eyeRing.position.set(0, 0.45, 0);
    this.scene.add(eyeRing);

    // Center eye pupil marker
    const pupilGeo = new THREE.SphereGeometry(0.5, 16, 16);
    pupilGeo.scale(1, 0.2, 1);
    const pupil = new THREE.Mesh(pupilGeo, runeMaterial);
    pupil.position.set(0, 0.46, 0);
    this.scene.add(pupil);

    // 2. Standing Monoliths surrounding the shrine (representing the 5 Clans)
    const clanEmissives = [
      0xff5c2b, // Embercrest (Fire)
      0x1d92bd, // Tidewrought (Water)
      0x7a8253, // Stonebound (Earth)
      0x88c9bb, // Skyreavers (Wind)
      0x9368b7  // Veilborn (Spirit)
    ];

    const monolithCount = 5;
    const ringRadius = 11;

    for (let i = 0; i < monolithCount; i++) {
      const angle = (i / monolithCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;
      const y = this.getHeight(x, z);

      // Monolith Pillar
      const pillarGeo = new THREE.BoxGeometry(1.2, 4.5, 1.0);
      const pillar = new THREE.Mesh(pillarGeo, stoneMaterial);
      pillar.position.set(x, y + 2.25, z);
      pillar.rotation.y = -angle + Math.PI / 2;
      pillar.rotation.z = (Math.random() - 0.5) * 0.08;
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.scene.add(pillar);
      this.collidableObjects.push(pillar);

      // Inlaid glowing rune gem
      const runeGeo = new THREE.OctahedronGeometry(0.35);
      const gemMat = new THREE.MeshStandardMaterial({
        color: clanEmissives[i],
        emissive: clanEmissives[i],
        emissiveIntensity: 2.0,
        roughness: 0.1
      });
      const gem = new THREE.Mesh(runeGeo, gemMat);
      gem.position.set(x, y + 3.2, z);
      this.scene.add(gem);
    }

    // 3. Ancient Portal Archway in the distance
    const archX = 0;
    const archZ = 32;
    const archY = this.getHeight(archX, archZ);

    const archPillar1 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 6.0, 1.8), stoneMaterial);
    archPillar1.position.set(archX - 3.5, archY + 3.0, archZ);
    archPillar1.castShadow = true;
    archPillar1.receiveShadow = true;
    this.scene.add(archPillar1);
    this.collidableObjects.push(archPillar1);

    const archPillar2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 6.0, 1.8), stoneMaterial);
    archPillar2.position.set(archX + 3.5, archY + 3.0, archZ);
    archPillar2.castShadow = true;
    archPillar2.receiveShadow = true;
    this.scene.add(archPillar2);
    this.collidableObjects.push(archPillar2);

    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.5, 2.0), stoneMaterial);
    archBeam.position.set(archX, archY + 6.2, archZ);
    archBeam.castShadow = true;
    archBeam.receiveShadow = true;
    this.scene.add(archBeam);
    this.collidableObjects.push(archBeam);

    // 4. Natural scattered boulders around landscape
    const rockGeo = new THREE.DodecahedronGeometry(1.5, 1);
    for (let i = 0; i < 22; i++) {
      const rockMesh = new THREE.Mesh(rockGeo, stoneMaterial);
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 85;
      const rx = Math.cos(angle) * dist;
      const rz = Math.sin(angle) * dist;
      const ry = this.getHeight(rx, rz);

      const scale = 0.8 + Math.random() * 1.6;
      rockMesh.scale.set(scale, scale * (0.6 + Math.random() * 0.5), scale);
      rockMesh.position.set(rx, ry + scale * 0.4, rz);
      rockMesh.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rockMesh.castShadow = true;
      rockMesh.receiveShadow = true;
      this.scene.add(rockMesh);
      this.collidableObjects.push(rockMesh);
    }
  }
}
