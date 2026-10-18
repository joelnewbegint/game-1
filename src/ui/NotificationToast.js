/**
 * Aethrava - Floating Fantasy Notification System
 * Renders banners for Quest updates, Item pickups, and Clan Trust changes.
 */

export class NotificationToast {
  constructor(gameState) {
    this.gameState = gameState;
    this.container = document.createElement('div');
    this.container.id = 'aethrava-toast-container';
    document.body.appendChild(this.container);

    this.bindEvents();
  }

  bindEvents() {
    // 1. Clan trust modification toast
    this.gameState.on('trust_changed', ({ clanId, value, delta }) => {
      const isPos = delta > 0;
      const clanName = clanId.charAt(0).toUpperCase() + clanId.slice(1);
      this.show({
        icon: isPos ? '▲' : '▼',
        title: `${isPos ? '+' : ''}${delta} ${clanName} Trust`,
        subtitle: `Current Standing: ${value > 0 ? '+' : ''}${value}`,
        type: isPos ? 'trust-positive' : 'trust-negative'
      });
    });

    // 2. Item added
    this.gameState.on('item_added', (item) => {
      this.show({
        icon: item.icon || '🎁',
        title: 'Item Acquired',
        subtitle: item.name,
        type: 'item'
      });
    });

    // 3. Quest started
    this.gameState.on('quest_started', (quest) => {
      this.show({
        icon: '📜',
        title: 'New Quest Started',
        subtitle: quest.title,
        type: 'quest'
      });
    });

    // 4. Quest completed
    this.gameState.on('quest_completed', (quest) => {
      this.show({
        icon: '👑',
        title: 'Quest Completed',
        subtitle: quest.title,
        type: 'quest-completed'
      });
    });

    // 5. Objective completed
    this.gameState.on('objective_completed', ({ questId, objectiveId }) => {
      this.show({
        icon: '✓',
        title: 'Objective Completed',
        subtitle: 'Check your Journal (J) for next steps.',
        type: 'objective'
      });
    });

    // 6. Generic notification
    this.gameState.on('notification', ({ title, message, type }) => {
      this.show({
        icon: '✦',
        title,
        subtitle: message,
        type: type || 'info'
      });
    });
  }

  show({ icon, title, subtitle, type = 'info' }) {
    const toast = document.createElement('div');
    toast.className = `aethrava-toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        <span class="toast-title">${title}</span>
        <span class="toast-subtitle">${subtitle}</span>
      </div>
    `;

    this.container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      toast.classList.add('fading');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 500);
    }, 3800);
  }
}
