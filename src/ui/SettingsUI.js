/**
 * Aethrava - Graphics & Audio Settings Modal
 * Controls master volume, rendering scale, shadow fidelity, and touch toggles.
 */

export class SettingsUI {
  constructor(engine, lighting, gameState, touchControls) {
    this.engine = engine;
    this.lighting = lighting;
    this.gameState = gameState;
    this.touchControls = touchControls;
    this.isOpen = false;

    this.createDOM();
    this.applySettings(this.gameState.settings);
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-settings-modal';
    this.container.className = 'hidden';

    this.container.innerHTML = `
      <div class="settings-card">
        <div class="settings-header">
          <h2 class="settings-title">SETTINGS</h2>
          <button class="settings-close-btn" id="settings-close-btn">&times;</button>
        </div>

        <div class="settings-body">
          <!-- Audio Volume -->
          <div class="setting-item">
            <div class="setting-label">
              <span>Master Volume</span>
              <span id="volume-val">80%</span>
            </div>
            <input type="range" id="volume-slider" min="0" max="100" value="80" class="custom-slider" />
          </div>

          <!-- Graphics Quality -->
          <div class="setting-item">
            <div class="setting-label">
              <span>Graphics Quality</span>
              <span id="quality-desc" class="sub-label">Balanced Fidelity & Battery</span>
            </div>
            <div class="quality-selector">
              <button class="quality-btn" data-quality="low">LOW</button>
              <button class="quality-btn" data-quality="medium">MEDIUM</button>
              <button class="quality-btn active" data-quality="high">HIGH</button>
            </div>
          </div>

          <!-- Touch Controls Toggle -->
          <div class="setting-item">
            <div class="setting-label">
              <span>On-Screen Touch Controls</span>
              <span class="sub-label">Virtual Joystick & Buttons</span>
            </div>
            <button class="toggle-switch-btn" id="toggle-touch-switch">ENABLED</button>
          </div>
        </div>

        <div class="settings-footer">
          <button class="settings-save-btn" id="settings-done-btn">DONE</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.volumeSlider = this.container.querySelector('#volume-slider');
    this.volumeVal = this.container.querySelector('#volume-val');
    this.qualityDesc = this.container.querySelector('#quality-desc');
    this.qualityButtons = this.container.querySelectorAll('.quality-btn');
    this.touchSwitchBtn = this.container.querySelector('#toggle-touch-switch');
    this.closeBtn = this.container.querySelector('#settings-close-btn');
    this.doneBtn = this.container.querySelector('#settings-done-btn');

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.doneBtn.addEventListener('click', () => this.close());

    // Volume Slider
    this.volumeSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value);
      this.volumeVal.innerText = `${vol}%`;
      this.gameState.settings.volume = vol;
    });

    // Quality buttons
    this.qualityButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.qualityButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const quality = btn.getAttribute('data-quality');
        this.gameState.settings.graphicsQuality = quality;
        this.applyGraphicsQuality(quality);
      });
    });

    // Touch Switch
    this.touchSwitchBtn.addEventListener('click', () => {
      this.touchControls.toggleVisible();
      this.updateTouchSwitchState();
    });
  }

  updateTouchSwitchState() {
    if (this.touchControls.visible) {
      this.touchSwitchBtn.innerText = 'ENABLED';
      this.touchSwitchBtn.className = 'toggle-switch-btn active';
    } else {
      this.touchSwitchBtn.innerText = 'DISABLED';
      this.touchSwitchBtn.className = 'toggle-switch-btn';
    }
  }

  applySettings(settings) {
    if (!settings) return;
    if (settings.volume !== undefined) {
      this.volumeSlider.value = settings.volume;
      this.volumeVal.innerText = `${settings.volume}%`;
    }
    if (settings.graphicsQuality) {
      this.applyGraphicsQuality(settings.graphicsQuality);
      this.qualityButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-quality') === settings.graphicsQuality);
      });
    }
    this.updateTouchSwitchState();
  }

  applyGraphicsQuality(quality) {
    const renderer = this.engine.renderer;
    const sunLight = this.lighting?.sunLight;

    if (quality === 'low') {
      renderer.setPixelRatio(1.0);
      if (sunLight) {
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
      }
      this.qualityDesc.innerText = 'Optimized for older phones & power saving';
    } else if (quality === 'medium') {
      renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
      if (sunLight) {
        sunLight.shadow.mapSize.width = 1536;
        sunLight.shadow.mapSize.height = 1536;
      }
      this.qualityDesc.innerText = 'Balanced performance and visual clarity';
    } else { // High
      renderer.setPixelRatio(Math.min(2.0, window.devicePixelRatio));
      if (sunLight) {
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
      }
      this.qualityDesc.innerText = 'Full resolution, sharp shadows & post-fx';
    }
  }

  open() {
    this.isOpen = true;
    this.updateTouchSwitchState();
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
  }
}
