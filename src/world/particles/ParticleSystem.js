import * as THREE from 'three';

/**
 * Aethrava - High-Performance Volcanic Particle System
 * Manages floating embers, volcanic ash, and forge smoke columns with zero performance overhead.
 */
export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;

    this.createEmbers();
    this.createForgeSmoke();
    this.createSeaMist();
  }

  createEmbers() {
    this.emberCount = 350;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.emberCount * 3);
    const scales = new Float32Array(this.emberCount);
    this.emberVelocities = [];

    // Distribute around starting area & village
    for (let i = 0; i < this.emberCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 160 + 20;

      scales[i] = 0.5 + Math.random() * 1.5;

      this.emberVelocities.push({
        vy: 0.8 + Math.random() * 1.6,
        vx: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        swaySpeed: 1.0 + Math.random() * 2.0
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Canvas particle texture for smooth round glowing ember
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 230, 120, 1)');
    grad.addColorStop(0.3, 'rgba(255, 90, 20, 0.8)');
    grad.addColorStop(0.8, 'rgba(255, 40, 0, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.2,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.emberMesh = new THREE.Points(geometry, material);
    this.scene.add(this.emberMesh);
  }

  createForgeSmoke() {
    this.smokeCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.smokeCount * 3);
    this.smokeVelocities = [];

    // Clustered over Kael's forge (around x: -18, z: -25) and Great Pyre (x: 16, z: -22)
    for (let i = 0; i < this.smokeCount; i++) {
      const isForge = i < this.smokeCount / 2;
      const baseOrigin = isForge ? { x: -18, z: -25 } : { x: 16, z: -22 };

      positions[i * 3] = baseOrigin.x + (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = 2.0 + Math.random() * 18;
      positions[i * 3 + 2] = baseOrigin.z + (Math.random() - 0.5) * 4;

      this.smokeVelocities.push({
        baseOrigin,
        vy: 1.2 + Math.random() * 1.5,
        growth: 0.1
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const smokeMaterial = new THREE.PointsMaterial({
      size: 3.5,
      color: 0x474f59,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });

    this.smokeMesh = new THREE.Points(geometry, smokeMaterial);
    this.scene.add(this.smokeMesh);
  }

  createSeaMist() {
    this.mistCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.mistCount * 3);
    const scales = new Float32Array(this.mistCount);
    this.mistVelocities = [];

    // Distribute along eastern coastal shelf (x: 80 to 180, z: -40 to 160)
    for (let i = 0; i < this.mistCount; i++) {
      positions[i * 3] = 80 + Math.random() * 100;
      positions[i * 3 + 1] = 0.5 + Math.random() * 10;
      positions[i * 3 + 2] = -40 + Math.random() * 200;

      scales[i] = 1.0 + Math.random() * 2.0;

      this.mistVelocities.push({
        vx: (Math.random() - 0.5) * 0.3 - 0.2, // Drifting inland with sea breeze
        vy: 0.15 + Math.random() * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
        sway: 0.5 + Math.random() * 1.5
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const mistMat = new THREE.PointsMaterial({
      size: 4.5,
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.mistMesh = new THREE.Points(geometry, mistMat);
    this.scene.add(this.mistMesh);
  }

  update(delta, elapsed, playerPos) {
    // 1. Update Embers
    if (this.emberMesh) {
      const pos = this.emberMesh.geometry.attributes.position;
      for (let i = 0; i < this.emberCount; i++) {
        let y = pos.getY(i);
        let x = pos.getX(i);
        let z = pos.getZ(i);

        const v = this.emberVelocities[i];
        y += v.vy * delta;
        x += Math.sin(elapsed * v.swaySpeed + i) * 0.05 + v.vx * delta;
        z += Math.cos(elapsed * v.swaySpeed + i) * 0.05 + v.vz * delta;

        // Reset if reached ceiling or drifted too far
        if (y > 28) {
          y = 0.5;
          if (playerPos) {
            x = playerPos.x + (Math.random() - 0.5) * 120;
            z = playerPos.z + (Math.random() - 0.5) * 120;
          }
        }

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }

    // 2. Update Smoke
    if (this.smokeMesh) {
      const pos = this.smokeMesh.geometry.attributes.position;
      for (let i = 0; i < this.smokeCount; i++) {
        let y = pos.getY(i);
        const v = this.smokeVelocities[i];
        y += v.vy * delta;

        if (y > 24) {
          y = 2.0;
          pos.setX(i, v.baseOrigin.x + (Math.random() - 0.5) * 2);
          pos.setZ(i, v.baseOrigin.z + (Math.random() - 0.5) * 2);
        }

        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    // 3. Update Sea Mist
    if (this.mistMesh) {
      const pos = this.mistMesh.geometry.attributes.position;
      for (let i = 0; i < this.mistCount; i++) {
        let y = pos.getY(i);
        let x = pos.getX(i);
        let z = pos.getZ(i);

        const v = this.mistVelocities[i];
        x += v.vx * delta;
        y += Math.sin(elapsed * v.sway + i) * 0.02 + v.vy * delta;
        z += v.vz * delta;

        if (y > 14 || x < 70) {
          y = 0.5;
          x = 80 + Math.random() * 100;
          z = -40 + Math.random() * 200;
        }

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }
  }
}

