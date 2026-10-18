import { SaveSystem } from '../systems/SaveSystem.js';

/**
 * Aethrava - Main Title Menu
 * Provides 'Continue Journey' (from browser localStorage), 'New Journey', and 'Settings'.
 */
export class MainMenu {
  constructor(gameState, player, settingsUI, onStartGame) {
    this.gameState = gameState;
    this.player = player;
    this.settingsUI = settingsUI;
    this.onStartGame = onStartGame;
    this.isOpen = true;

    this.createDOM();
    this.bindEvents();
    this.refreshSaveState();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-main-menu';
    this.container.className = 'visible';

    this.container.innerHTML = `
      <div class="main-menu-content">
        <div class="menu-eye-emblem">
          <div class="emblem-ring"></div>
          <div class="emblem-pupil"></div>
        </div>

        <h1 class="menu-title">AETHRAVA</h1>
        <p class="menu-tagline">A 3D FANTASY REALM OF THE FIVE GODS</p>

        <div class="menu-actions">
          <button class="menu-btn primary-menu-btn" id="menu-btn-continue" style="display: none;">
            <span class="btn-text">CONTINUE JOURNEY</span>
            <span class="save-preview" id="menu-save-preview"></span>
          </button>

          <button class="menu-btn" id="menu-btn-new">
            <span class="btn-text">NEW JOURNEY</span>
          </button>

          <button class="menu-btn secondary-menu-btn" id="menu-btn-settings">
            <span class="btn-text">SETTINGS</span>
          </button>
        </div>

        <div class="menu-lore-preview">
          <span>"By the Shattered Eye, we see the whole."</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.continueBtn = this.container.querySelector('#menu-btn-continue');
    this.newBtn = this.container.querySelector('#menu-btn-new');
    this.settingsBtn = this.container.querySelector('#menu-btn-settings');
    this.savePreview = this.container.querySelector('#menu-save-preview');
  }

  bindEvents() {
    this.continueBtn.addEventListener('click', () => {
      SaveSystem.load(this.gameState, this.player);
      this.close();
      if (this.onStartGame) this.onStartGame(true);
    });

    this.newBtn.addEventListener('click', () => {
      SaveSystem.clearSave();
      this.gameState.reset();
      this.close();
      if (this.onStartGame) this.onStartGame(false);
    });

    this.settingsBtn.addEventListener('click', () => {
      this.settingsUI.open();
    });
  }

  refreshSaveState() {
    const hasSave = SaveSystem.hasSave();
    const summary = SaveSystem.getSaveSummary();

    if (hasSave && summary) {
      this.continueBtn.style.display = 'flex';
      this.savePreview.innerText = `Saved: ${summary.formattedDate} • Stones: ${summary.stonesCollected}/5`;
    } else {
      this.continueBtn.style.display = 'none';
    }
  }

  open() {
    this.isOpen = true;
    this.refreshSaveState();
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
