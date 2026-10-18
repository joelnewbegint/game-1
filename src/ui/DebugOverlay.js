/**
 * Aethrava - HUD & Diagnostic Debug Overlay
 * Displays FPS, player position, camera pitch/yaw, renderer statistics, input mode,
 * and Eye Vision status/energy.
 */

export class DebugOverlay {
  constructor(engine, player, cameraController, inputManager, touchControls, onOpenJournal, onOpenPause, onToggleEye, onOpenBook) {
    this.engine = engine;
    this.player = player;
    this.cameraController = cameraController;
    this.inputManager = inputManager;
    this.touchControls = touchControls;
    this.onOpenJournal = onOpenJournal;
    this.onOpenPause = onOpenPause;
    this.onToggleEye = onToggleEye;
    this.onOpenBook = onOpenBook;

    this.visible = true; // Visible by default for diagnostics

    // 1. Create Top-Right Quick Toggle Bar
    this.topBar = document.createElement('div');
    this.topBar.id = 'aethrava-top-bar';
    this.topBar.innerHTML = `
      <button id="btn-top-eye" class="hud-pill-btn cyan-accent" title="Toggle Eye Vision (V)">EYE (V)</button>
      <button id="btn-top-book" class="hud-pill-btn gold-accent" title="The Book of Fractured Truths (B)">BOOK (B)</button>
      <button id="btn-top-journal" class="hud-pill-btn gold-accent" title="Open Grimoire & Journal (J or I)">JOURNAL (J)</button>
      <button id="btn-top-pause" class="hud-pill-btn" title="Pause Game (ESC)">PAUSE</button>
      <button id="toggle-debug-btn" class="hud-pill-btn active" title="Toggle Debug Info (~ or F3)">DEBUG</button>
      <button id="toggle-touch-btn" class="hud-pill-btn" title="Toggle Virtual Touch Controls">TOUCH UI</button>
    `;
    document.body.appendChild(this.topBar);

    // 2. Create Debug Stats Panel
    this.panel = document.createElement('div');
    this.panel.id = 'aethrava-debug-panel';
    this.panel.innerHTML = `
      <div class="debug-header">
        <span class="debug-title">AETHRAVA // PHASE 3 DEBUG</span>
        <span class="debug-toggle-hint">[~ or F3 to toggle]</span>
      </div>
      <div class="debug-grid">
        <div class="debug-row">
          <span class="lbl">FPS</span>
          <span class="val" id="dbg-fps">60</span>
        </div>
        <div class="debug-row">
          <span class="lbl">Eye Vision</span>
          <span class="val" id="dbg-eye-status">Inactive (100%)</span>
        </div>
        <div class="debug-row">
          <span class="lbl">Player Pos</span>
          <span class="val" id="dbg-pos">X: 0.0, Y: 0.0, Z: 0.0</span>
        </div>
        <div class="debug-row">
          <span class="lbl">Speed</span>
          <span class="val" id="dbg-speed">0.0 m/s</span>
        </div>
        <div class="debug-row">
          <span class="lbl">State</span>
          <span class="val" id="dbg-state">Grounded (Idle)</span>
        </div>
        <div class="debug-row">
          <span class="lbl">Camera Pitch/Yaw</span>
          <span class="val" id="dbg-cam">0° / 0°</span>
        </div>
        <div class="debug-row">
          <span class="lbl">Draw Calls / Tris</span>
          <span class="val" id="dbg-render">0 / 0</span>
        </div>
      </div>
    `;
    document.body.appendChild(this.panel);

    // Elements
    this.fpsEl = this.panel.querySelector('#dbg-fps');
    this.eyeStatusEl = this.panel.querySelector('#dbg-eye-status');
    this.posEl = this.panel.querySelector('#dbg-pos');
    this.speedEl = this.panel.querySelector('#dbg-speed');
    this.stateEl = this.panel.querySelector('#dbg-state');
    this.camEl = this.panel.querySelector('#dbg-cam');
    this.renderEl = this.panel.querySelector('#dbg-render');

    this.toggleDebugBtn = this.topBar.querySelector('#toggle-debug-btn');
    this.toggleTouchBtn = this.topBar.querySelector('#toggle-touch-btn');
    this.journalBtn = this.topBar.querySelector('#btn-top-journal');
    this.pauseBtn = this.topBar.querySelector('#btn-top-pause');
    this.eyeBtn = this.topBar.querySelector('#btn-top-eye');
    this.bookBtn = this.topBar.querySelector('#btn-top-book');

    // Bind toggles
    this.toggleDebugBtn.addEventListener('click', () => this.toggle());
    this.toggleTouchBtn.addEventListener('click', () => {
      this.touchControls.toggleVisible();
      this.toggleTouchBtn.classList.toggle('active', this.touchControls.visible);
    });

    if (this.journalBtn) {
      this.journalBtn.addEventListener('click', () => {
        if (this.onOpenJournal) this.onOpenJournal();
      });
    }

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        if (this.onOpenPause) this.onOpenPause();
      });
    }

    if (this.eyeBtn) {
      this.eyeBtn.addEventListener('click', () => {
        if (this.onToggleEye) this.onToggleEye();
      });
    }

    if (this.bookBtn) {
      this.bookBtn.addEventListener('click', () => {
        if (this.onOpenBook) this.onOpenBook();
      });
    }

    if (this.touchControls.visible) {
      this.toggleTouchBtn.classList.add('active');
    }

    // Connect to input manager's debug key event
    this.inputManager.onToggleDebug = () => this.toggle();
  }

  toggle() {
    this.visible = !this.visible;
    this.panel.style.display = this.visible ? 'block' : 'none';
    this.toggleDebugBtn.classList.toggle('active', this.visible);
  }

  update(delta, eyeVisionSystem) {
    if (!this.visible) return;

    // 1. FPS
    const fps = this.engine.time.fps;
    this.fpsEl.innerText = `${fps}`;
    if (fps >= 50) {
      this.fpsEl.className = 'val good';
    } else if (fps >= 30) {
      this.fpsEl.className = 'val warn';
    } else {
      this.fpsEl.className = 'val bad';
    }

    // 2. Eye Vision Status
    if (eyeVisionSystem) {
      const active = eyeVisionSystem.isActive;
      const energy = Math.round(eyeVisionSystem.energy);
      this.eyeStatusEl.innerText = `${active ? 'ACTIVE' : 'Inactive'} (${energy}%)`;
      this.eyeStatusEl.className = active ? 'val good' : 'val';
      this.eyeBtn.classList.toggle('active', active);
    }

    // 3. Position
    const pos = this.player.position;
    this.posEl.innerText = `X: ${pos.x.toFixed(1)}, Y: ${pos.y.toFixed(1)}, Z: ${pos.z.toFixed(1)}`;

    // 4. Speed & State
    this.speedEl.innerText = `${this.player.speed.toFixed(1)} m/s`;
    let state = this.player.isGrounded ? 'Grounded' : 'Airborne';
    if (this.player.isGrounded) {
      if (this.player.isRunning) state += ' (Sprinting)';
      else if (this.player.isMoving) state += ' (Walking)';
      else state += ' (Idle)';
    }
    this.stateEl.innerText = state;

    // 5. Camera
    const pitchDeg = Math.round(this.cameraController.pitch * (180 / Math.PI));
    const yawDeg = Math.round(this.cameraController.yaw * (180 / Math.PI)) % 360;
    this.camEl.innerText = `P: ${pitchDeg}°, Y: ${yawDeg}°`;

    // 6. Renderer stats
    const renderInfo = this.engine.renderer.info.render;
    this.renderEl.innerText = `${renderInfo.calls} calls / ${renderInfo.triangles.toLocaleString()} tris`;
  }
}
