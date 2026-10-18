import * as THREE from 'three';

/**
 * Aethrava - The Magic Eye Vision System
 * Toggles Kaelen's First Eye Vision with an energy meter and cooldown.
 * Applies a glowing chromatic filter, pierces lies in dialogue,
 * and reveals hidden spirit paths, secret doors, and hidden artifacts.
 */
export class EyeVisionSystem {
  constructor(engine, player, world, gameState) {
    this.engine = engine;
    this.player = player;
    this.world = world;
    this.gameState = gameState;

    // Vision state
    this.isActive = false;
    this.energy = 100;
    this.maxEnergy = 100;
    this.drainRate = 16.0;   // Drains in ~6.2s of continuous vision
    this.rechargeRate = 20.0; // Recharges in 5s
    this.minEnergyToActivate = 15;
    this.cooldownTimer = 0;

    // Vision-sensitive entities (hidden pages, spirit paths, secret alcoves)
    this.registeredEntities = [];

    // Store original environment values to restore smoothly
    this.originalFogColor = this.engine.scene.fog ? this.engine.scene.fog.color.getHex() : 0xa8bed1;
    this.eyeVisionFogColor = new THREE.Color(0x132238);

    // Callbacks
    this.onToggle = null;

    this.createDOM();
  }

  createDOM() {
    // 1. Post-Processing / Screen Filter Overlay
    this.filterOverlay = document.createElement('div');
    this.filterOverlay.id = 'aethrava-eye-vision-overlay';
    this.filterOverlay.className = 'inactive';
    this.filterOverlay.innerHTML = `
      <div class="eye-vignette"></div>
      <div class="eye-runic-fringe"></div>
      <div class="eye-reticle-ring"></div>
    `;
    document.body.appendChild(this.filterOverlay);

    // 2. HUD Energy Gauge
    this.energyHUD = document.createElement('div');
    this.energyHUD.id = 'aethrava-eye-energy-hud';
    this.energyHUD.innerHTML = `
      <div class="eye-hud-icon" id="eye-hud-toggle-btn" title="Toggle Eye Vision (V)">
        <div class="hud-eye-outer"></div>
        <div class="hud-eye-pupil"></div>
      </div>
      <div class="eye-hud-meter-container">
        <div class="eye-hud-meter-bar" id="eye-energy-bar"></div>
      </div>
      <span class="eye-hud-label">[V] EYE VISION</span>
    `;
    document.body.appendChild(this.energyHUD);

    this.energyBarEl = this.energyHUD.querySelector('#eye-energy-bar');
    this.toggleBtnEl = this.energyHUD.querySelector('#eye-hud-toggle-btn');

    this.toggleBtnEl.addEventListener('click', () => {
      this.toggle();
    });
  }

  register(entity) {
    this.registeredEntities.push(entity);
    // Initialize entity with current vision state
    if (entity.onEyeVisionStateChange) {
      entity.onEyeVisionStateChange(this.isActive);
    }
  }

  unregister(entity) {
    const idx = this.registeredEntities.indexOf(entity);
    if (idx > -1) this.registeredEntities.splice(idx, 1);
  }

  toggle() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    if (this.energy < this.minEnergyToActivate || this.cooldownTimer > 0) {
      // Not enough energy or on cooldown
      this.flashInsufficientEnergy();
      return;
    }

    this.isActive = true;
    this.filterOverlay.className = 'active';
    this.energyHUD.classList.add('active');

    // Notify GameState for dialogue and world logic
    this.gameState.setFlag('eye_vision_active', true);

    // Boost Kaelen's Magic Eye Light
    if (this.player && this.player.eyeLight) {
      this.player.eyeLight.color.setHex(0x00f0ff);
      this.player.eyeLight.intensity = 5.0;
      this.player.eyeLight.distance = 16.0;
    }

    // Shift Scene Fog
    if (this.engine.scene.fog) {
      this.engine.scene.fog.color.copy(this.eyeVisionFogColor);
    }

    // Notify all vision-sensitive world entities
    for (let i = 0; i < this.registeredEntities.length; i++) {
      if (this.registeredEntities[i].onEyeVisionStateChange) {
        this.registeredEntities[i].onEyeVisionStateChange(true);
      }
    }

    this.gameState.emit('notification', {
      title: 'First Eye Vision Awakened',
      message: 'Hidden truths and celestial spirits unveiled.',
      type: 'eye-vision'
    });

    if (this.onToggle) this.onToggle(true);
  }

  deactivate() {
    if (!this.isActive) return;

    this.isActive = false;
    this.filterOverlay.className = 'inactive';
    this.energyHUD.classList.remove('active');

    // Reset GameState flag
    this.gameState.setFlag('eye_vision_active', false);

    // Restore Kaelen's normal eye light
    if (this.player && this.player.eyeLight) {
      this.player.eyeLight.color.setHex(0x38bdf8);
      this.player.eyeLight.intensity = 2.2;
      this.player.eyeLight.distance = 7.5;
    }

    // Restore Scene Fog
    if (this.engine.scene.fog) {
      this.engine.scene.fog.color.setHex(this.originalFogColor);
    }

    // Notify all vision-sensitive entities to hide
    for (let i = 0; i < this.registeredEntities.length; i++) {
      if (this.registeredEntities[i].onEyeVisionStateChange) {
        this.registeredEntities[i].onEyeVisionStateChange(false);
      }
    }

    if (this.onToggle) this.onToggle(false);
  }

  flashInsufficientEnergy() {
    this.energyHUD.classList.add('energy-depleted');
    setTimeout(() => {
      this.energyHUD.classList.remove('energy-depleted');
    }, 400);
  }

  update(delta) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= delta;
    }

    if (this.isActive) {
      // Drain energy while active
      this.energy = Math.max(0, this.energy - this.drainRate * delta);
      if (this.energy <= 0) {
        this.cooldownTimer = 1.8; // 1.8s penalty cooldown
        this.deactivate();
      }
    } else {
      // Recharge energy while inactive
      this.energy = Math.min(this.maxEnergy, this.energy + this.rechargeRate * delta);
    }

    // Update HUD meter width & pulse
    const percent = (this.energy / this.maxEnergy) * 100;
    this.energyBarEl.style.width = `${percent}%`;

    if (this.energy < 25) {
      this.energyHUD.classList.add('low-energy');
    } else {
      this.energyHUD.classList.remove('low-energy');
    }
  }
}
