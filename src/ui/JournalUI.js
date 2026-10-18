import questsData from '../data/quests.json' with { type: 'json' };
import { ITEMS_DATABASE, ELEMENTAL_STONES } from '../data/items.js';
import { LORE_PAGES } from '../data/lorePages.js';
import { CLANS } from '../data/clans.js';

/**
 * Aethrava - Grimoire & Journal UI
 * Unified modal managing Quests, Elemental Stones (5 slots), Key Items,
 * Lore Pages (The Book of Fractured Truths), and Clan Trust meters.
 */
export class JournalUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.isOpen = false;
    this.currentTab = 'quests'; // 'quests' | 'stones' | 'items' | 'lore' | 'clans'

    this.onClose = null;

    this.createDOM();
    this.bindEvents();

    // Re-render when state changes
    this.gameState.on('state_changed', () => {
      if (this.isOpen) this.renderCurrentTab();
    });
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-journal-modal';
    this.container.className = 'hidden';

    this.container.innerHTML = `
      <div class="journal-card">
        <div class="journal-header">
          <h2 class="journal-title">CHRONICLES & ARTIFACTS</h2>
          <button class="journal-close-btn" id="journal-close-btn">&times;</button>
        </div>

        <!-- Navigation Tabs -->
        <div class="journal-nav">
          <button class="journal-tab-btn active" data-tab="quests">QUESTS</button>
          <button class="journal-tab-btn" data-tab="stones">FIRST EYE (5 STONES)</button>
          <button class="journal-tab-btn" data-tab="items">INVENTORY</button>
          <button class="journal-tab-btn" data-tab="lore">LORE PAGES</button>
          <button class="journal-tab-btn" data-tab="clans">CLAN TRUST</button>
        </div>

        <!-- Tab Content Viewport -->
        <div class="journal-content" id="journal-tab-content"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.contentEl = this.container.querySelector('#journal-tab-content');
    this.closeBtn = this.container.querySelector('#journal-close-btn');
    this.tabButtons = this.container.querySelectorAll('.journal-tab-btn');
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());

    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTab = btn.getAttribute('data-tab');
        this.renderCurrentTab();
      });
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyJ') {
        this.toggle('quests');
      } else if (e.code === 'KeyI') {
        this.toggle('items');
      } else if (e.code === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open(tab = 'quests') {
    this.isOpen = true;
    this.currentTab = tab;
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');

    // Update active tab button
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    this.renderCurrentTab();
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
    if (this.onClose) this.onClose();
  }

  toggle(tab = 'quests') {
    if (this.isOpen && this.currentTab === tab) {
      this.close();
    } else {
      this.open(tab);
    }
  }

  renderCurrentTab() {
    switch (this.currentTab) {
      case 'quests': this.renderQuests(); break;
      case 'stones': this.renderElementalStones(); break;
      case 'items':  this.renderInventory(); break;
      case 'lore':   this.renderLorePages(); break;
      case 'clans':  this.renderClanTrust(); break;
    }
  }

  // 1. Quests Tab
  renderQuests() {
    const questsList = Object.entries(this.gameState.quests);
    const activeQuests = questsList.filter(([_, q]) => q.state === 'active');
    const completedQuests = questsList.filter(([_, q]) => q.state === 'completed');

    let html = `<div class="quest-view">`;

    if (activeQuests.length === 0 && completedQuests.length === 0) {
      html += `<p class="empty-state">No recorded quests in your journal. Speak with Lorekeeper Elara at the Ancient Dais to begin your quest.</p>`;
    } else {
      if (activeQuests.length > 0) {
        html += `<h3 class="section-title">ACTIVE QUESTS</h3>`;
        activeQuests.forEach(([id, qState]) => {
          const qData = questsData[id];
          if (!qData) return;
          const clan = CLANS[qData.clanId?.toUpperCase()] || { name: 'Neutral', themeColor: '#38bdf8' };

          html += `
            <div class="quest-card active-card">
              <div class="quest-card-header">
                <span class="quest-name">${qData.title}</span>
                <span class="quest-clan-badge" style="border-color: ${clan.themeColor}; color: ${clan.themeColor}">${clan.name}</span>
              </div>
              <p class="quest-desc">${qData.description}</p>
              <div class="quest-objectives">
                <h4>OBJECTIVES</h4>
                <ul>
                  ${qData.objectives.map(obj => {
                    const done = qState.objectives[obj.id];
                    return `<li class="${done ? 'completed' : 'pending'}">${done ? '✓' : '○'} ${obj.text}</li>`;
                  }).join('')}
                </ul>
              </div>
            </div>
          `;
        });
      }

      if (completedQuests.length > 0) {
        html += `<h3 class="section-title">COMPLETED TALES</h3>`;
        completedQuests.forEach(([id]) => {
          const qData = questsData[id];
          if (!qData) return;
          html += `
            <div class="quest-card completed-card">
              <div class="quest-card-header">
                <span class="quest-name">${qData.title}</span>
                <span class="quest-status-badge">COMPLETED</span>
              </div>
              <p class="quest-desc">${qData.description}</p>
            </div>
          `;
        });
      }
    }

    html += `</div>`;
    this.contentEl.innerHTML = html;
  }

  // 2. Elemental Stones (5 Slots of the First Eye)
  renderElementalStones() {
    const stones = Object.entries(ELEMENTAL_STONES);
    const stonesCollected = Object.values(this.gameState.inventory.elementalStones).filter(Boolean).length;

    let html = `
      <div class="stones-view">
        <div class="stones-overview">
          <h3>THE FIVE ELEMENTAL STONES</h3>
          <p>Fragments of the First Eye that brought forth the elemental gods. Collect all five to pierce the veil.</p>
          <div class="stones-counter">Collected: ${stonesCollected} / 5</div>
        </div>
        <div class="stones-grid">
    `;

    stones.forEach(([clanKey, stone]) => {
      const isUnlocked = !!this.gameState.inventory.elementalStones[clanKey];
      html += `
        <div class="stone-slot ${isUnlocked ? 'unlocked' : 'locked'}" style="--clan-color: ${stone.color}">
          <div class="stone-socket">
            <div class="stone-gem"></div>
          </div>
          <div class="stone-info">
            <span class="stone-element">${stone.element.toUpperCase()}</span>
            <span class="stone-name">${stone.name}</span>
            <span class="stone-god">${stone.god}</span>
            <p class="stone-desc">${isUnlocked ? stone.description : 'Undiscovered shard. Seek the deities of Aethrava.'}</p>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    this.contentEl.innerHTML = html;
  }

  // 3. Inventory (Key Items)
  renderInventory() {
    const items = this.gameState.inventory.keyItems;

    let html = `<div class="inventory-view">`;
    if (items.length === 0) {
      html += `<p class="empty-state">Your satchel is empty. Recover ancient fragments and quest items across the realm.</p>`;
    } else {
      html += `<div class="items-grid">`;
      items.forEach(itemId => {
        const item = ITEMS_DATABASE[itemId] || { name: itemId, icon: '✨', description: 'Mysterious artifact.', color: '#38bdf8' };
        html += `
          <div class="item-card">
            <div class="item-icon-box" style="border-color: ${item.color}">
              <span class="item-icon">${item.icon}</span>
            </div>
            <div class="item-details">
              <h4 class="item-name">${item.name}</h4>
              <p class="item-desc">${item.description}</p>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    this.contentEl.innerHTML = html;
  }

  // 4. Lore Pages (The Book of Fractured Truths)
  renderLorePages() {
    const pages = this.gameState.inventory.lorePages;

    let html = `
      <div class="lore-view">
        <div class="lore-open-book-banner">
          <p>Read full volumes, flip through animated spreads, and investigate theological contradictions.</p>
          <button class="open-book-prompt-btn" id="btn-open-full-book">📖 OPEN THE BOOK OF FRACTURED TRUTHS (B)</button>
        </div>
    `;
    if (pages.length === 0) {
      html += `<p class="empty-state">No pages discovered from The Book of Fractured Truths. Complete quests or use Eye Vision [V] to uncover veiled manuscripts.</p>`;
    } else {
      html += `<div class="lore-pages-list">`;
      pages.forEach(pageId => {
        const page = LORE_PAGES[pageId];
        if (!page) return;
        html += `
          <div class="lore-card" style="border-left: 4px solid ${page.clanColor}">
            <div class="lore-card-header">
              <span class="lore-title">Page ${page.number}: ${page.title}</span>
              <span class="lore-clan" style="color: ${page.clanColor}">${page.clan} Tradition</span>
            </div>
            <div class="lore-text">${page.text.replace(/\n\n/g, '<br><br>')}</div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div>`;
    this.contentEl.innerHTML = html;

    const bookBtn = this.contentEl.querySelector('#btn-open-full-book');
    if (bookBtn) {
      bookBtn.addEventListener('click', () => {
        this.close();
        if (this.onOpenLoreBook) this.onOpenLoreBook();
      });
    }
  }

  // 5. Clan Trust System (-100 to 100)
  renderClanTrust() {
    const clans = Object.values(CLANS);

    let html = `
      <div class="clan-trust-view">
        <p class="trust-summary-text">
          Your standing with the five elemental clans shapes their willingness to share ancient relics, unlock paths, and reveal the truth of the First Eye.
        </p>
        <div class="clans-list">
    `;

    clans.forEach(clan => {
      const trustVal = this.gameState.getClanTrust(clan.id);
      const trustStatus = this.gameState.getTrustLabel(trustVal);
      // Normalized percentage for progress bar: -100 to +100 -> 0% to 100%
      const percent = Math.round(((trustVal + 100) / 200) * 100);

      html += `
        <div class="clan-row" style="--clan-color: ${clan.themeColor}">
          <div class="clan-meta">
            <span class="clan-name">${clan.name} (${clan.element})</span>
            <span class="clan-god">${clan.god}</span>
            <span class="clan-status" style="color: ${trustStatus.color}">${trustStatus.label} (${trustVal > 0 ? '+' : ''}${trustVal})</span>
          </div>
          <div class="trust-bar-bg">
            <div class="trust-bar-fill" style="width: ${percent}%; background-color: ${clan.themeColor}"></div>
            <div class="trust-bar-neutral-mark"></div>
          </div>
          <div class="clan-desc">${clan.loreSummary}</div>
        </div>
      `;
    });

    html += `</div></div>`;
    this.contentEl.innerHTML = html;
  }
}
