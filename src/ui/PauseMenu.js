import { SaveSystem } from '../systems/SaveSystem.js';

/**
 * Aethrava - In-Game Pause Menu
 * Accessible via Escape key or top-bar pause button.
 */
export class PauseMenu {
  constructor(gameState, player, journalUI, settingsUI, onReturnToTitle) {
    this.gameState = gameState;
    this.player = player;
    this.journalUI = journalUI;
    this.settingsUI = settingsUI;
    this.onReturnToTitle = onReturnToTitle;
    this.isOpen = false;

    this.createDOM();
    this.bindEvents();
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-pause-modal';
    this.container.className = 'hidden';

    this.container.innerHTML = `
      <div class="pause-card">
        <h2 class="pause-title">AETHRAVA</h2>
        <span class="pause-subtitle">GAME PAUSED</span>

        <div class="pause-menu-list">
          <button class="pause-menu-btn primary-btn" id="btn-pause-resume">RESUME</button>
          <button class="pause-menu-btn" id="btn-pause-journal">JOURNAL & QUESTS (J)</button>
          <button class="pause-menu-btn" id="btn-pause-inventory">INVENTORY (I)</button>
          <button class="pause-menu-btn" id="btn-pause-save">SAVE GAME</button>
          <button class="pause-menu-btn" id="btn-pause-settings">SETTINGS</button>
          <button class="pause-menu-btn danger-btn" id="btn-pause-title">RETURN TO TITLE</button>
        </div>

        <div class="save-status-msg" id="pause-save-msg"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.resumeBtn = this.container.querySelector('#btn-pause-resume');
    this.journalBtn = this.container.querySelector('#btn-pause-journal');
    this.inventoryBtn = this.container.querySelector('#btn-pause-inventory');
    this.saveBtn = this.container.querySelector('#btn-pause-save');
    this.settingsBtn = this.container.querySelector('#btn-pause-settings');
    this.titleBtn = this.container.querySelector('#btn-pause-title');
    this.saveMsg = this.container.querySelector('#pause-save-msg');
  }

  bindEvents() {
    this.resumeBtn.addEventListener('click', () => this.close());

    this.journalBtn.addEventListener('click', () => {
      this.close();
      this.journalUI.open('quests');
    });

    this.inventoryBtn.addEventListener('click', () => {
      this.close();
      this.journalUI.open('items');
    });

    this.saveBtn.addEventListener('click', () => {
      const ok = SaveSystem.save(this.gameState, this.player);
      if (ok) {
        this.saveMsg.innerText = 'Game saved successfully to browser storage!';
        this.saveMsg.className = 'save-status-msg success';
      } else {
        this.saveMsg.innerText = 'Failed to save game to browser storage.';
        this.saveMsg.className = 'save-status-msg error';
      }
      setTimeout(() => { this.saveMsg.innerText = ''; }, 3000);
    });

    this.settingsBtn.addEventListener('click', () => {
      this.settingsUI.open();
    });

    this.titleBtn.addEventListener('click', () => {
      this.close();
      if (this.onReturnToTitle) this.onReturnToTitle();
    });

    // Escape Key toggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        if (this.settingsUI.isOpen) {
          this.settingsUI.close();
        } else if (this.journalUI.isOpen) {
          this.journalUI.close();
        } else {
          this.toggle();
        }
      }
    });
  }

  open() {
    this.isOpen = true;
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

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }
}
