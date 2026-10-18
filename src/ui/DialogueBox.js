import dialogueData from '../data/dialogue.json' with { type: 'json' };

/**
 * Aethrava - Branching Dialogue System
 * Renders multiple-choice dialogue trees, evaluates prerequisites,
 * modifies Clan Trust, updates flags, and triggers quest events.
 * Highlights lies in real-time when Eye Vision is active.
 */
export class DialogueBox {
  constructor(gameState) {
    this.gameState = gameState;
    this.isOpen = false;
    this.currentTree = null;
    this.currentNode = null;

    this.onClose = null;

    this.createDOM();

    // Re-render current node if Eye Vision toggles during dialogue
    this.gameState.on('state_changed', () => {
      if (this.isOpen && this.currentNode) {
        this.updateLieHighlight(this.currentNode);
      }
    });
  }

  createDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-dialogue-modal';
    this.container.className = 'hidden';

    this.container.innerHTML = `
      <div class="dialogue-card" id="dialogue-card">
        <div class="dialogue-header">
          <div class="speaker-avatar">
            <span class="speaker-glyph">🔥</span>
          </div>
          <div class="speaker-info">
            <h3 class="speaker-name" id="diag-speaker-name">Lorekeeper Elara</h3>
            <span class="speaker-title" id="diag-speaker-title">Keeper of the Sacred Flame</span>
          </div>
        </div>

        <div class="dialogue-body">
          <p class="dialogue-text" id="diag-text"></p>
          <div class="dialogue-lie-alert hidden" id="diag-lie-alert"></div>
        </div>

        <div class="dialogue-choices" id="diag-choices"></div>
      </div>
    `;

    document.body.appendChild(this.container);

    this.cardEl = this.container.querySelector('#dialogue-card');
    this.speakerNameEl = this.container.querySelector('#diag-speaker-name');
    this.speakerTitleEl = this.container.querySelector('#diag-speaker-title');
    this.textEl = this.container.querySelector('#diag-text');
    this.lieAlertEl = this.container.querySelector('#diag-lie-alert');
    this.choicesEl = this.container.querySelector('#diag-choices');
  }

  open(treeId) {
    const tree = dialogueData[treeId];
    if (!tree) {
      console.warn(`[DialogueBox] Dialogue tree '${treeId}' not found in dialogue.json`);
      return;
    }

    this.currentTree = tree;
    this.isOpen = true;
    this.container.classList.remove('hidden');
    this.container.classList.add('visible');

    // Exit pointer lock so user can click choices
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }

    this.speakerNameEl.innerText = tree.npcName || 'Unknown';
    this.speakerTitleEl.innerText = tree.title || '';

    this.showNode(tree.initialNode || 'start');
  }

  showNode(nodeId) {
    if (!nodeId || !this.currentTree.nodes[nodeId]) {
      this.close();
      return;
    }

    const node = this.currentTree.nodes[nodeId];
    this.currentNode = node;

    // Set dialogue text
    this.textEl.innerText = node.text;

    // Check Lie detection
    this.updateLieHighlight(node);

    // Render valid choices
    this.choicesEl.innerHTML = '';
    const choices = node.choices || [];

    choices.forEach(choice => {
      // Evaluate condition
      if (choice.condition && !this.gameState.evaluateCondition(choice.condition)) {
        return;
      }

      const btn = document.createElement('button');
      btn.className = 'dialogue-choice-btn';
      btn.innerText = choice.text;

      btn.addEventListener('click', () => {
        this.selectChoice(choice);
      });

      this.choicesEl.appendChild(btn);
    });

    if (this.choicesEl.children.length === 0) {
      // Fallback close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'dialogue-choice-btn close-btn';
      closeBtn.innerText = 'End Conversation';
      closeBtn.addEventListener('click', () => this.close());
      this.choicesEl.appendChild(closeBtn);
    }
  }

  updateLieHighlight(node) {
    const isEyeActive = !!this.gameState.getFlag('eye_vision_active');

    if (node.isLie && isEyeActive) {
      this.cardEl.classList.add('eye-pierced-lie');
      this.lieAlertEl.innerHTML = `
        <span class="lie-icon">👁️</span>
        <div class="lie-text-wrap">
          <strong class="lie-heading">DECEIT PIERCED BY THE FIRST EYE:</strong>
          <span class="lie-detail">${node.lieReason || 'This statement is a falsehood designed to mislead.'}</span>
        </div>
      `;
      this.lieAlertEl.classList.remove('hidden');
    } else {
      this.cardEl.classList.remove('eye-pierced-lie');
      this.lieAlertEl.classList.add('hidden');
    }
  }

  selectChoice(choice) {
    // 1. Modify Clan Trust
    if (choice.modifyTrust) {
      for (const [clanId, amount] of Object.entries(choice.modifyTrust)) {
        this.gameState.modifyClanTrust(clanId, amount);
      }
    }

    // 2. Set Flags
    if (choice.setFlags) {
      for (const [key, val] of Object.entries(choice.setFlags)) {
        this.gameState.setFlag(key, val);
      }
    }

    // 3. Start Quests
    if (choice.startQuest) {
      this.gameState.startQuest(choice.startQuest);
    }

    // 4. Complete Quests
    if (choice.completeQuest) {
      this.gameState.completeQuest(choice.completeQuest);
    }

    // 4b. Complete Specific Objective
    if (choice.completeObjective) {
      this.gameState.completeObjective(choice.completeObjective.quest, choice.completeObjective.obj);
    }

    // 5. Navigate to Next Node or Close
    if (choice.nextNode) {
      this.showNode(choice.nextNode);
    } else {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    this.container.classList.remove('visible');
    this.container.classList.add('hidden');
    if (this.onClose) this.onClose();
  }
}
