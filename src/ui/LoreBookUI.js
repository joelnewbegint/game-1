import { LORE_PAGES, CONTRADICTION_TOPICS } from '../data/lorePages.js';

/**
 * Aethrava - The Book of Fractured Truths UI
 * Features a dual-page grimoire with realistic page-turn animation,
 * a Table of Contents, and an unlocked Contradictions tab comparing conflicting clan dogmas side by side.
 */
export class LoreBookUI {
  constructor(gameState) {
    this.gameState = gameState;
    this.isOpen = false;
    this.currentSpreadIndex = 0; // Each spread shows 2 pages (or TOC)
    this.activeTab = 'pages';    // 'pages' | 'contradictions'
    this.selectedTopicId = null;

    this.onClose = null;

    this.createDOM();
    this.bindEvents();

    // Re-render when state updates
    this.gameState.on('state_changed', () => {
      if (this.isOpen) this.render();
    });
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-lore-book-modal';
    this.container.className = 'hidden';

    this.container.innerHTML = `
      <div class="lore-book-wrapper">
        <!-- Book Header Tabs -->
        <div class="book-tabs-bar">
          <button class="book-tab-btn active" data-tab="pages">CHRONICLES OF TRUTH</button>
          <button class="book-tab-btn" data-tab="contradictions" id="book-contradictions-tab-btn">
            <span>CONTRADICTIONS</span>
            <span class="contradiction-badge" id="book-contradiction-count">0</span>
          </button>
          <button class="book-close-x" id="book-close-btn">&times;</button>
        </div>

        <!-- The Physical Antique Book Container -->
        <div class="antique-book">
          <div class="book-binding-spine"></div>

          <!-- Left Page Viewport -->
          <div class="book-page page-left" id="book-page-left"></div>

          <!-- Right Page Viewport -->
          <div class="book-page page-right" id="book-page-right"></div>

          <!-- Animated Flipping Sheet -->
          <div class="book-page-flipping" id="book-flipping-sheet"></div>
        </div>

        <!-- Book Footer Controls -->
        <div class="book-controls-bar">
          <button class="book-nav-btn prev-btn" id="book-btn-prev">‹ PREVIOUS SPREAD</button>
          <span class="book-page-counter" id="book-spread-counter">SPREAD 1</span>
          <button class="book-nav-btn next-btn" id="book-btn-next">NEXT SPREAD ›</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.pageLeftEl = this.container.querySelector('#book-page-left');
    this.pageRightEl = this.container.querySelector('#book-page-right');
    this.flippingSheetEl = this.container.querySelector('#book-flipping-sheet');
    this.spreadCounterEl = this.container.querySelector('#book-spread-counter');
    this.contradictionsTabBtn = this.container.querySelector('#book-contradictions-tab-btn');
    this.contradictionBadgeEl = this.container.querySelector('#book-contradiction-count');

    this.btnPrev = this.container.querySelector('#book-btn-prev');
    this.btnNext = this.container.querySelector('#book-btn-next');
    this.btnClose = this.container.querySelector('#book-close-btn');
    this.tabButtons = this.container.querySelectorAll('.book-tab-btn');
  }

  bindEvents() {
    this.btnClose.addEventListener('click', () => this.close());

    this.btnPrev.addEventListener('click', () => {
      this.flipPage(-1);
    });

    this.btnNext.addEventListener('click', () => {
      this.flipPage(1);
    });

    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeTab = btn.getAttribute('data-tab');
        this.render();
      });
    });

    // Keyboard shortcut 'B' for Book
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyB') {
        this.toggle();
      } else if (e.code === 'Escape' && this.isOpen) {
        this.close();
      } else if (this.isOpen) {
        if (e.code === 'ArrowLeft') this.flipPage(-1);
        if (e.code === 'ArrowRight') this.flipPage(1);
      }
    });
  }

  getCollectedPages() {
    const collectedIds = this.gameState.inventory.lorePages || [];
    return collectedIds.map(id => LORE_PAGES[id]).filter(Boolean).sort((a, b) => a.number - b.number);
  }

  getUnlockedContradictions() {
    const collected = this.getCollectedPages();
    const topicMap = {};

    collected.forEach(page => {
      if (page.topicId) {
        if (!topicMap[page.topicId]) topicMap[page.topicId] = [];
        topicMap[page.topicId].push(page);
      }
    });

    // Only topics with 2 or more conflicting pages are considered unlocked contradictions
    const unlocked = [];
    for (const [topicId, pages] of Object.entries(topicMap)) {
      if (pages.length >= 2) {
        unlocked.push({
          topic: CONTRADICTION_TOPICS[topicId] || { title: topicId },
          pages
        });
      }
    }
    return unlocked;
  }

  open(tab = 'pages') {
    this.isOpen = true;
    this.activeTab = tab;
    this.currentSpreadIndex = 0;
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');

    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    this.render();
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
    if (this.onClose) this.onClose();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  flipPage(direction) {
    if (this.activeTab !== 'pages') return;

    const collected = this.getCollectedPages();
    const maxSpreads = Math.max(1, Math.ceil(collected.length / 2));
    const nextIndex = this.currentSpreadIndex + direction;

    if (nextIndex < 0 || nextIndex >= maxSpreads) return;

    // Trigger realistic 3D page flip animation
    this.flippingSheetEl.className = 'book-page-flipping active ' + (direction > 0 ? 'flip-forward' : 'flip-backward');

    setTimeout(() => {
      this.currentSpreadIndex = nextIndex;
      this.renderPagesTab();
      this.flippingSheetEl.className = 'book-page-flipping';
    }, 280);
  }

  render() {
    const unlockedContradictions = this.getUnlockedContradictions();
    this.contradictionBadgeEl.innerText = `${unlockedContradictions.length}`;

    if (unlockedContradictions.length > 0) {
      this.contradictionsTabBtn.classList.add('has-unlocked');
    } else {
      this.contradictionsTabBtn.classList.remove('has-unlocked');
    }

    if (this.activeTab === 'pages') {
      this.renderPagesTab();
    } else {
      this.renderContradictionsTab();
    }
  }

  // 1. Pages Tab (Chronicle Spread)
  renderPagesTab() {
    const collected = this.getCollectedPages();
    const maxSpreads = Math.max(1, Math.ceil(collected.length / 2));

    this.spreadCounterEl.innerText = `SPREAD ${this.currentSpreadIndex + 1} OF ${maxSpreads}`;
    this.btnPrev.disabled = (this.currentSpreadIndex === 0);
    this.btnNext.disabled = (this.currentSpreadIndex >= maxSpreads - 1);

    if (collected.length === 0) {
      this.pageLeftEl.innerHTML = `
        <div class="empty-book-page">
          <div class="empty-book-icon">📖</div>
          <h3>THE BOOK IS BLANK</h3>
          <p>You have not yet discovered any fragments of The Book of Fractured Truths.</p>
          <p class="empty-hint">Search the ancient ruins. Use Kaelen's Magic Eye [V] to reveal hidden pages that are veiled to mortal sight.</p>
        </div>
      `;
      this.pageRightEl.innerHTML = `
        <div class="empty-book-page">
          <h3>THE FIVE CLANS</h3>
          <p class="ancient-script">"Five stones fell from the starry eye; five mouths proclaimed five separate truths."</p>
          <div class="empty-seal">✦</div>
        </div>
      `;
      return;
    }

    // Left Page
    const leftPageIdx = this.currentSpreadIndex * 2;
    const leftPage = collected[leftPageIdx];
    this.pageLeftEl.innerHTML = leftPage ? this.formatPageHTML(leftPage) : '<div class="empty-page-placeholder"></div>';

    // Right Page
    const rightPageIdx = this.currentSpreadIndex * 2 + 1;
    const rightPage = collected[rightPageIdx];
    this.pageRightEl.innerHTML = rightPage ? this.formatPageHTML(rightPage) : '<div class="empty-page-placeholder"></div>';
  }

  formatPageHTML(page) {
    const firstLetter = page.text.charAt(0);
    const restOfText = page.text.slice(1).replace(/\n\n/g, '<br><br>');

    return `
      <div class="parchment-content" style="--clan-accent: ${page.clanColor}">
        <div class="page-meta-header">
          <span class="page-number">PAGE ${page.number}</span>
          <span class="page-clan-tag" style="color: ${page.clanColor}; border-color: ${page.clanColor}">${page.clan}</span>
        </div>

        <h3 class="page-title">${page.title}</h3>

        <div class="page-body-text">
          <span class="illuminated-dropcap" style="color: ${page.clanColor}">${firstLetter}</span>${restOfText}
        </div>

        <div class="page-claim-box">
          <span class="claim-label">DOGMATIC CLAIM:</span>
          <p class="claim-text">${page.claim || 'A piece of the fractured narrative.'}</p>
        </div>
      </div>
    `;
  }

  // 2. Contradictions Tab (Side-by-Side Comparison)
  renderContradictionsTab() {
    this.spreadCounterEl.innerText = `CONTRADICTIONS ARCHIVE`;
    this.btnPrev.disabled = true;
    this.btnNext.disabled = true;

    const unlocked = this.getUnlockedContradictions();

    if (unlocked.length === 0) {
      this.pageLeftEl.innerHTML = `
        <div class="empty-book-page">
          <div class="empty-book-icon">⚖️</div>
          <h3>NO CONTRADICTIONS UNLOCKED</h3>
          <p>The Contradictions Tab unlocks when you collect two or more opposing clan accounts regarding the same world event.</p>
        </div>
      `;
      this.pageRightEl.innerHTML = `
        <div class="empty-book-page">
          <h3>HOW TO UNCOVER CONTRADICTIONS</h3>
          <p class="ancient-script">"One clan proclaims the fire was supreme; another sings of the infinite sea. Find both, and their lies shall illuminate the truth."</p>
          <p class="hint-sub">Tip: Uncover hidden lore pages using Eye Vision [V] near the northern monoliths.</p>
        </div>
      `;
      return;
    }

    // Default to first unlocked contradiction topic if none selected
    if (!this.selectedTopicId || !unlocked.some(u => u.topic.id === this.selectedTopicId)) {
      this.selectedTopicId = unlocked[0].topic.id;
    }

    const currentContradiction = unlocked.find(u => u.topic.id === this.selectedTopicId) || unlocked[0];

    // Left Page: Topic Selector & Clan A's Account
    let leftHTML = `
      <div class="contradiction-left-page">
        <h3 class="contradiction-header">DISCORDANT HISTORIES</h3>
        <div class="topic-pill-list">
          ${unlocked.map(u => `
            <button class="topic-pill-btn ${u.topic.id === this.selectedTopicId ? 'active' : ''}" data-topic="${u.topic.id}">
              ${u.topic.title} (${u.pages.length} Accounts)
            </button>
          `).join('')}
        </div>

        <div class="comparison-column" style="--side-color: ${currentContradiction.pages[0].clanColor}">
          <div class="side-badge" style="background: ${currentContradiction.pages[0].clanColor}">
            ${currentContradiction.pages[0].clan} ACCOUNT
          </div>
          <h4 class="side-title">${currentContradiction.pages[0].title}</h4>
          <p class="side-claim">"${currentContradiction.pages[0].claim}"</p>
          <div class="side-excerpt">${currentContradiction.pages[0].text.substring(0, 180)}...</div>
        </div>
      </div>
    `;
    this.pageLeftEl.innerHTML = leftHTML;

    // Right Page: Clan B's Account & Thematic Analysis
    const secondPage = currentContradiction.pages[1] || currentContradiction.pages[0];
    let rightHTML = `
      <div class="contradiction-right-page">
        <div class="comparison-column" style="--side-color: ${secondPage.clanColor}">
          <div class="side-badge" style="background: ${secondPage.clanColor}">
            ${secondPage.clan} ACCOUNT
          </div>
          <h4 class="side-title">${secondPage.title}</h4>
          <p class="side-claim">"${secondPage.claim}"</p>
          <div class="side-excerpt">${secondPage.text.substring(0, 180)}...</div>
        </div>

        <div class="fractured-analysis-card">
          <div class="analysis-header">
            <span class="analysis-icon">✦</span>
            <span class="analysis-title">FRACTURED TRUTH ANALYSIS</span>
          </div>
          <p class="analysis-text">
            These two accounts directly contradict each other regarding <strong>${currentContradiction.topic.title}</strong>.
            Neither clan holds the pure truth. The Order of the Open Eye deliberately scattered contradicting testimonies across Aethrava to keep the five nations locked in mutual denial.
          </p>
        </div>
      </div>
    `;
    this.pageRightEl.innerHTML = rightHTML;

    // Bind topic pill clicks
    const topicPills = this.pageLeftEl.querySelectorAll('.topic-pill-btn');
    topicPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.selectedTopicId = pill.getAttribute('data-topic');
        this.renderContradictionsTab();
      });
    });
  }
}
