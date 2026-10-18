import * as THREE from 'three';

/**
 * Aethrava - Dynamic Day/Night Cycle
 * Advances solar arc, shifts sky scattering uniforms and fog colors,
 * dynamically highlighting molten lava and glowing runes at night.
 */
export class DayNightCycle {
  constructor(skyDome, lighting, scene) {
    this.skyDome = skyDome;
    this.lighting = lighting;
    this.scene = scene;

    // Time: 0 to 24 hours (Starts at 17.5: Golden Volcanic Hour)
    this.time = 17.2;
    this.timeSpeed = 0.04; // 1 full game day = ~10 minutes, or adjustable

    // Color definitions
    this.dayFog = new THREE.Color(0xa8bed1);
    this.sunsetFog = new THREE.Color(0xc25b38);
    this.nightFog = new THREE.Color(0x0f1524);

    this.currentFog = new THREE.Color();
  }

  update(delta) {
    this.time = (this.time + this.timeSpeed * delta) % 24;

    // Calculate solar elevation:
    // 6.0 = Sunrise (0 deg), 12.0 = Noon (+60 deg), 18.0 = Sunset (0 deg), 0.0 = Midnight (-60 deg)
    const normalizedTime = (this.time - 6) / 24;
    const elevation = Math.sin(normalizedTime * Math.PI * 2) * 55;
    const azimuth = 180 + (this.time / 24) * 360;

    // Update SkyDome
    if (this.skyDome) {
      this.skyDome.updateSunPosition(elevation, azimuth);
    }

    // Adjust lighting intensities
    if (this.lighting && this.lighting.sunLight) {
      if (elevation > 0) {
        const factor = Math.min(1.0, elevation / 15);
        this.lighting.sunLight.intensity = factor * 2.2;
        this.lighting.ambientLight.intensity = 0.35 + factor * 0.35;
      } else {
        // Night
        this.lighting.sunLight.intensity = 0.05;
        this.lighting.ambientLight.intensity = 0.25; // Soft nocturnal glow
      }
    }

    // Blend Scene Fog
    if (this.scene && this.scene.fog) {
      if (elevation > 15) {
        this.currentFog.copy(this.dayFog);
      } else if (elevation > -5) {
        // Sunset transition
        const t = (elevation + 5) / 20;
        this.currentFog.lerpColors(this.sunsetFog, this.dayFog, t);
      } else {
        // Night transition
        const t = Math.max(0, (elevation + 20) / 15);
        this.currentFog.lerpColors(this.nightFog, this.sunsetFog, t);
      }
      this.scene.fog.color.copy(this.currentFog);
    }
  }

  setTime(hour) {
    this.time = hour % 24;
  }
}
