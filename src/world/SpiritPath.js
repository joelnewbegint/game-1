import * as THREE from 'three';

/**
 * Aethrava - Spirit Path Entity
 * A luminous trail of celestial runes that only materializes under Eye Vision,
 * leading Kaelen toward hidden knowledge and secret alcoves.
 */
export class SpiritPath {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;

    this.mesh = new THREE.Group();
    this.runes = [];

    this.createPath();

    // Invisible until Eye Vision activates
    this.mesh.visible = false;
    this.scene.add(this.mesh);
  }

  createPath() {
    // Waypoints for the spirit path winding around the ancient ruins to a hidden page
    const waypoints = [
      { x: 2.0, z: -4.0 },
      { x: -3.5, z: -8.0 },
      { x: -9.0, z: -10.5 },
      { x: -14.0, z: -7.5 },
      { x: -18.5, z: -2.0 },
      { x: -21.0, z: 5.0 }
    ];

    const runeGeo = new THREE.RingGeometry(0.35, 0.7, 16);
    runeGeo.rotateX(-Math.PI / 2);

    this.runeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });

    waypoints.forEach((pt, index) => {
      const y = this.world.getGroundHeight(pt.x, pt.z) + 0.08;
      const runeMesh = new THREE.Mesh(runeGeo, this.runeMaterial);
      runeMesh.position.set(pt.x, y, pt.z);
      runeMesh.rotation.y = index * 0.4;
      this.mesh.add(runeMesh);
      this.runes.push(runeMesh);

      // Inner ocular glyph
      const innerGeo = new THREE.CircleGeometry(0.2, 12);
      innerGeo.rotateX(-Math.PI / 2);
      const innerMesh = new THREE.Mesh(innerGeo, this.runeMaterial);
      innerMesh.position.set(pt.x, y + 0.01, pt.z);
      this.mesh.add(innerMesh);
    });
  }

  onEyeVisionStateChange(isActive) {
    this.mesh.visible = isActive;
  }

  update(delta, elapsed) {
    if (!this.mesh.visible) return;

    // Sequential pulsing wave along the spirit path
    const basePulse = 0.6 + Math.sin(elapsed * 3.0) * 0.35;
    this.runeMaterial.opacity = THREE.MathUtils.clamp(basePulse, 0.3, 0.95);

    for (let i = 0; i < this.runes.length; i++) {
      this.runes[i].rotation.y = elapsed * 0.5 + i * 0.3;
    }
  }
}
