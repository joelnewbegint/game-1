import * as THREE from 'three';

/**
 * Aethrava - The Smith's Crucible (Forge Puzzle)
 * Interactive crucible station in Cinderfall.
 * The player balances Draft (Bellows), Heat (Coals), and Quench (Flux) to smelt the Obsidian Sun Key.
 */
export class ForgePuzzle {
  constructor(scene, world, gameState, audioManager) {
    this.scene = scene;
    this.world = world;
    this.gameState = gameState;
    this.audio = audioManager;

    this.position = new THREE.Vector3(-18, 0, -25);
    this.position.y = this.world.getGroundHeight(this.position.x, this.position.z);
    this.interactionRadius = 3.0;
    this.isSolved = false;

    // Registers: 1, 2, 3
    this.draft = 1;
    this.heat = 1;
    this.flux = 1;

    this.createModel();
    this.createModal();
  }

  createModel() {
    this.mesh = new THREE.Group();
    this.mesh.position.copy(this.position);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.9 });
    const ironMat = new THREE.MeshStandardMaterial({ color: 0x52525b, metalness: 0.8, roughness: 0.3 });
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xff3700,
      emissive: 0xff4500,
      emissiveIntensity: 2.5
    });

    // Forge Base Furnace
    const baseGeo = new THREE.CylinderGeometry(1.6, 2.0, 1.2, 12);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.6;
    base.castShadow = true;
    base.receiveShadow = true;
    this.mesh.add(base);

    // Glowing Crucible Core
    const coreGeo = new THREE.CylinderGeometry(1.0, 0.8, 0.3, 12);
    this.coreMesh = new THREE.Mesh(coreGeo, lavaMat);
    this.coreMesh.position.y = 1.25;
    this.mesh.add(this.coreMesh);

    // Bellows & Iron Trim
    const chimneyGeo = new THREE.CylinderGeometry(0.5, 0.7, 3.5, 8);
    const chimney = new THREE.Mesh(chimneyGeo, stoneMat);
    chimney.position.set(0, 3.0, -1.0);
    chimney.castShadow = true;
    this.mesh.add(chimney);

    // Point light inside furnace
    this.furnaceLight = new THREE.PointLight(0xff4500, 2.0, 6.0);
    this.furnaceLight.position.y = 1.6;
    this.mesh.add(this.furnaceLight);

    this.scene.add(this.mesh);
  }

  createModal() {
    this.modal = document.createElement('div');
    this.modal.id = 'aethrava-forge-puzzle-modal';
    this.modal.className = 'hidden';

    this.modal.innerHTML = `
      <div class="forge-puzzle-card">
        <div class="forge-header">
          <h3 class="forge-title">THE SACRED CRUCIBLE</h3>
          <button class="forge-close-btn" id="forge-close-btn">&times;</button>
        </div>

        <p class="forge-desc">
          Balance the draft, coal heat, and mineral flux to smelt the raw igneous ore into the Obsidian Sun Key.
          <br><em>"Blast the draft (3), feed the coal (2), temper in cold flux (1)."</em>
        </p>

        <div class="forge-registers">
          <!-- Register 1: Bellows (Draft) -->
          <div class="forge-register-row">
            <span class="reg-label">Bellows Draft:</span>
            <div class="reg-selector" id="reg-draft-selector">
              <button class="reg-btn active" data-val="1">1 (Gentle)</button>
              <button class="reg-btn" data-val="2">2 (Brisk)</button>
              <button class="reg-btn" data-val="3">3 (Blast)</button>
            </div>
          </div>

          <!-- Register 2: Coal (Heat) -->
          <div class="forge-register-row">
            <span class="reg-label">Igneous Heat:</span>
            <div class="reg-selector" id="reg-heat-selector">
              <button class="reg-btn active" data-val="1">1 (Smolder)</button>
              <button class="reg-btn" data-val="2">2 (Cherry-Red)</button>
              <button class="reg-btn" data-val="3">3 (Solar White)</button>
            </div>
          </div>

          <!-- Register 3: Flux (Quench) -->
          <div class="forge-register-row">
            <span class="reg-label">Obsidian Flux:</span>
            <div class="reg-selector" id="reg-flux-selector">
              <button class="reg-btn active" data-val="1">1 (Cold Bath)</button>
              <button class="reg-btn" data-val="2">2 (Warm Ash)</button>
              <button class="reg-btn" data-val="3">3 (Molten Slag)</button>
            </div>
          </div>
        </div>

        <div class="forge-status" id="forge-status-text">Ready to strike anvil...</div>

        <div class="forge-actions">
          <button class="forge-ignite-btn" id="forge-ignite-btn">STRIKE & SMELT KEY</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.closeBtn = this.modal.querySelector('#forge-close-btn');
    this.igniteBtn = this.modal.querySelector('#forge-ignite-btn');
    this.statusText = this.modal.querySelector('#forge-status-text');

    this.bindEvents();
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());

    // Register button selector handlers
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

    setupSelector('#reg-draft-selector', (val) => { this.draft = val; });
    setupSelector('#reg-heat-selector', (val) => { this.heat = val; });
    setupSelector('#reg-flux-selector', (val) => { this.flux = val; });

    this.igniteBtn.addEventListener('click', () => {
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
    // Solution sequence: Draft=3, Heat=2, Flux=1
    if (this.draft === 3 && this.heat === 2 && this.flux === 1) {
      this.isSolved = true;
      this.statusText.innerText = '✓ CRUCIBLE BALANCED! The Obsidian Sun Key has been forged!';
      this.statusText.className = 'forge-status success';

      if (this.audio) this.audio.playChime('success');

      // Add Obsidian Sun Key to inventory
      this.gameState.addItem('temple_sun_key');

      // Complete objective in quest
      if (this.gameState.getQuestState('q_forge_crucible') === 'active') {
        this.gameState.completeObjective('q_forge_crucible', 'obj_solve_forge');
      }

      setTimeout(() => {
        this.close();
      }, 1400);
    } else {
      this.statusText.innerText = '❌ The metal fractured! Incorrect thermal ratio. Check Kael\'s advice.';
      this.statusText.className = 'forge-status error';
    }
  }

  getPromptText() {
    return this.isSolved ? 'Inspect Forged Crucible' : 'Operate Forge Crucible';
  }

  getInteractionPosition() {
    return new THREE.Vector3(this.position.x, this.position.y + 1.2, this.position.z);
  }

  update(delta, elapsed) {
    if (this.coreMesh) {
      const pulse = 2.0 + Math.sin(elapsed * 4.0) * 0.5;
      this.coreMesh.material.emissiveIntensity = pulse;
      this.furnaceLight.intensity = pulse;
    }
  }
}
