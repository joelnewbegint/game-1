import * as THREE from 'three';

/**
 * Aethrava - The Harbor Sluice Mechanism (Sluice Puzzle)
 * Interactive water lock and drain station in Thalassport.
 * The player balances 3 sluice valves to drain the sunken harbor pathway.
 */
export class SluicePuzzle {
  constructor(scene, world, gameState, audioManager) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;

    this.position = new THREE.Vector3(138, 0, -12);
    this.position.y = this.world.getGroundHeight(this.position.x, this.position.z);
    this.interactionRadius = 3.2;
    this.isSolved = false;

    // Registers: Valve 1, 2, 3
    this.valve1 = 2;
    this.valve2 = 1;
    this.valve3 = 1;

    this.createModel();
    this.createModal();
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.3 });
    const waterGlowMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 2.0
    });

    // Control Dam Foundation
    const damGeo = new THREE.BoxGeometry(3.5, 1.4, 2.5);
    const dam = new THREE.Mesh(damGeo, stoneMat);
    dam.position.y = 0.7;
    dam.castShadow = true;
    dam.receiveShadow = true;
    this.mesh.add(dam);

    // 3 Turning Bronze Wheels
    for (let i = 0; i < 3; i++) {
      const wheelGeo = new THREE.TorusGeometry(0.35, 0.08, 8, 16);
      const wheel = new THREE.Mesh(wheelGeo, bronzeMat);
      wheel.position.set((i - 1) * 1.0, 1.6, 0.4);
      wheel.rotation.x = Math.PI / 4;
      wheel.castShadow = true;
      this.mesh.add(wheel);
    }

    // Glowing Tidal Indicator Gauge
    const gaugeGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
    gaugeGeo.rotateX(Math.PI / 2);
    this.gaugeMesh = new THREE.Mesh(gaugeGeo, waterGlowMat);
    this.gaugeMesh.position.set(0, 1.8, -0.6);
    this.mesh.add(this.gaugeMesh);

    // Ambient blue point light
    this.sluiceLight = new THREE.PointLight(0x0284c7, 2.0, 8.0);
    this.sluiceLight.position.set(0, 2.2, 0);
    this.mesh.add(this.sluiceLight);

    this.scene.add(this.mesh);
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'aethrava-sluice-puzzle-modal';
    this.modal.className = 'hidden';

    this.modal.innerHTML = `
      <div class="forge-puzzle-card tide-theme">
        <div class="forge-header">
          <h3 class="forge-title" style="color: #38bdf8; text-shadow: 0 0 12px rgba(56, 189, 248, 0.6);">THE HARBOR SLUICE MECHANISM</h3>
          <button class="forge-close-btn" id="sluice-close-btn">&times;</button>
        </div>

        <p class="forge-desc">
          Configure the three tidal lock valves to drain the flooded shallows and uncover the ancient submerged causeway.
          <br><em>"Open Sea-Surge (1), shut Mud-Gate (2), engage Lower Weir Drain (3)."</em>
        </p>

        <div class="forge-registers">
          <!-- Valve 1: Sea-Surge Valve -->
          <div class="forge-register-row">
            <span class="reg-label" style="color: #7dd3fc;">Sea-Surge Valve:</span>
            <div class="reg-selector" id="reg-valve1-selector">
              <button class="reg-btn active" data-val="1">1 (Open Surge)</button>
              <button class="reg-btn" data-val="2">2 (Half Lock)</button>
              <button class="reg-btn" data-val="3">3 (Shut Tight)</button>
            </div>
          </div>

          <!-- Valve 2: Mud-Gate -->
          <div class="forge-register-row">
            <span class="reg-label" style="color: #7dd3fc;">Basin Mud-Gate:</span>
            <div class="reg-selector" id="reg-valve2-selector">
              <button class="reg-btn" data-val="1">1 (Overflow)</button>
              <button class="reg-btn active" data-val="2">2 (Shut Gate)</button>
              <button class="reg-btn" data-val="3">3 (Silt Purge)</button>
            </div>
          </div>

          <!-- Valve 3: Lower Weir Drain -->
          <div class="forge-register-row">
            <span class="reg-label" style="color: #7dd3fc;">Lower Weir Drain:</span>
            <div class="reg-selector" id="reg-valve3-selector">
              <button class="reg-btn active" data-val="1">1 (Idle Pool)</button>
              <button class="reg-btn" data-val="2">2 (Low Flush)</button>
              <button class="reg-btn" data-val="3">3 (Engaged Drain)</button>
            </div>
          </div>
        </div>

        <div class="forge-status" id="sluice-status-text">Valves primed for tidal flush...</div>

        <div class="forge-actions">
          <button class="forge-ignite-btn" id="sluice-drain-btn" style="background: linear-gradient(135deg, #0284c7, #0369a1); border-color: #38bdf8;">ENGAGE SLUICE DRAIN</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.closeBtn = this.modal.querySelector('#sluice-close-btn');
    this.drainBtn = this.modal.querySelector('#sluice-drain-btn');
    this.statusText = this.modal.querySelector('#sluice-status-text');

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());

    const setupSelector = (containerId, onSelect) => {
      const container = this.modal.querySelector(containerId);
      const btns = container.querySelectorAll('.reg-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', () => {
          btns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          onSelect(parseInt(btn.getAttribute('data-val')));
        });
      });
    };

    setupSelector('#reg-valve1-selector', (val) => { this.valve1 = val; });
    setupSelector('#reg-valve2-selector', (val) => { this.valve2 = val; });
    setupSelector('#reg-valve3-selector', (val) => { this.valve3 = val; });

    this.drainBtn.addEventListener('click', () => {
      this.attemptSolve();
    });
  }

  open() {
    this.modal.classList.remove('hidden');
    this.modal.classList.add('visible');
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
  }

  close() {
    this.modal.classList.remove('visible');
    this.modal.classList.add('hidden');
  }

  attemptSolve() {
    // Correct sequence: Valve1 = 1, Valve2 = 2, Valve3 = 3
    if (this.valve1 === 1 && this.valve2 === 2 && this.valve3 === 3) {
      this.isSolved = true;
      this.statusText.innerText = '✓ SLUICE GATES UNLOCKED! Tidal basin draining to sea level!';
      this.statusText.className = 'forge-status success';

      if (this.audio) this.audio.playChime('success');

      // Add Bronze Sluice Crank to inventory
      this.gameState.addItem('sluice_gear_crank');

      // Complete objective in quest
      if (this.gameState.getQuestState('q_tide_sluice') === 'active') {
        this.gameState.completeObjective('q_tide_sluice', 'obj_drain_sluice');
      }

      setTimeout(() => {
        this.close();
      }, 1400);
    } else {
      this.statusText.innerText = '❌ Sea surge backflow! The valves locked up. Follow Scholar Sylas\'s advice.';
      this.statusText.className = 'forge-status error';
    }
  }

  getPromptText() {
    return this.isSolved ? 'Inspect Drained Sluice' : 'Operate Harbor Sluice Valves';
  }

  getInteractionPosition() {
    return new THREE.Vector3(this.position.x, this.position.y + 1.2, this.position.z);
  }

  update(delta, elapsed) {
    if (this.gaugeMesh) {
      const pulse = 1.8 + Math.sin(elapsed * 3.5) * 0.4;
      this.gaugeMesh.material.emissiveIntensity = pulse;
      this.sluiceLight.intensity = pulse;
    }
  }
}
