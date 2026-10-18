/**
 * Aethrava - Persistent Storage & Auto-Save System
 * Stores player progress, quest states, clan trust, and inventory to localStorage.
 */

const STORAGE_KEY = 'AETHRAVA_SAVE_DATA_V1';

export class SaveSystem {
  static hasSave() {
    try {
      return !!localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return false;
    }
  }

  static getSaveSummary() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return {
        timestamp: data.timestamp,
        formattedDate: new Date(data.timestamp).toLocaleString(),
        activeQuestsCount: Object.values(data.quests || {}).filter(q => q.state === 'active').length,
        stonesCollected: Object.values(data.inventory?.elementalStones || {}).filter(Boolean).length,
        clanTrust: data.clanTrust || {}
      };
    } catch (e) {
      console.error('[SaveSystem] Error reading save summary:', e);
      return null;
    }
  }

  static save(gameState, player) {
    try {
      const serialized = gameState.serialize(player.position, player.rotationY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      gameState.emit('notification', {
        title: 'Game Saved',
        message: 'Your progress has been etched in the stars.',
        type: 'save'
      });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Failed to save game:', e);
      return false;
    }
  }

  static load(gameState, player) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);

      const success = gameState.deserialize(data);
      if (success && player && data.player) {
        player.position.set(data.player.x, data.player.y, data.player.z);
        player.rotationY = data.player.rotationY || 0;
        player.mesh.position.copy(player.position);
        player.mesh.rotation.y = player.rotationY;
      }

      gameState.emit('notification', {
        title: 'Journey Resumed',
        message: 'Welcome back to Aethrava.',
        type: 'load'
      });
      return true;
    } catch (e) {
      console.error('[SaveSystem] Failed to load save:', e);
      return false;
    }
  }

  static clearSave() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (e) {
      return false;
    }
  }
}
