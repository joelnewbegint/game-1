import questsData from '../data/quests.json' with { type: 'json' };
import { ITEMS_DATABASE, ELEMENTAL_STONES } from '../data/items.js';
import { LORE_PAGES } from '../data/lorePages.js';

/**
 * Aethrava - Reactive Central Game State
 * Manages Clan Trust (-100 to 100), Quests, Inventory, Flags, and Event Notifications.
 */
export class GameState {
  constructor() {
    this.listeners = {};
    this.reset();
  }

  reset() {
    // 1. Clan Trust System (-100 to 100)
    this.clanTrust = {
      embercrest: 0,
      tidewrought: 0,
      stonebound: 0,
      skyreavers: 0,
      veilborn: 0
    };

    // 2. Inventory System
    this.inventory = {
      // 5 Elemental Stones slots
      elementalStones: {
        embercrest: false,
        tidewrought: false,
        stonebound: false,
        skyreavers: false,
        veilborn: false
      },
      keyItems: [],
      lorePages: []
    };

    // 3. Quest States (initialized from quests.json)
    this.quests = {};
    for (const [id, q] of Object.entries(questsData)) {
      const objState = {};
      q.objectives.forEach(obj => {
        objState[obj.id] = false;
      });
      this.quests[id] = {
        state: 'not_started', // 'not_started' | 'active' | 'completed'
        objectives: objState
      };
    }

    // 4. Progression Flags
    this.flags = {};

    // 5. System Settings
    this.settings = {
      volume: 80,
      graphicsQuality: 'high'
    };
  }

  // Event Subscription
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  // ----------------------------------------------------
  // Clan Trust Operations
  // ----------------------------------------------------
  modifyClanTrust(clanId, amount) {
    if (this.clanTrust[clanId] === undefined) return;

    const oldVal = this.clanTrust[clanId];
    this.clanTrust[clanId] = Math.max(-100, Math.min(100, oldVal + amount));
    const delta = this.clanTrust[clanId] - oldVal;

    this.emit('trust_changed', { clanId, value: this.clanTrust[clanId], delta });
    this.emit('state_changed');
  }

  getClanTrust(clanId) {
    return this.clanTrust[clanId] || 0;
  }

  getTrustLabel(val) {
    if (val >= 60) return { label: 'Revered', color: '#4ade80' };
    if (val >= 25) return { label: 'Friendly', color: '#38bdf8' };
    if (val > -25) return { label: 'Neutral', color: '#94a3b8' };
    if (val > -60) return { label: 'Wary', color: '#fb923c' };
    return { label: 'Hostile', color: '#f87171' };
  }

  // ----------------------------------------------------
  // Inventory Operations
  // ----------------------------------------------------
  addItem(itemId) {
    if (!this.inventory.keyItems.includes(itemId)) {
      this.inventory.keyItems.push(itemId);
      const itemDef = ITEMS_DATABASE[itemId] || { name: itemId, icon: '✨' };
      this.emit('item_added', itemDef);
      this.emit('state_changed');
    }
  }

  hasItem(itemId) {
    return this.inventory.keyItems.includes(itemId);
  }

  removeItem(itemId) {
    const idx = this.inventory.keyItems.indexOf(itemId);
    if (idx > -1) {
      this.inventory.keyItems.splice(idx, 1);
      this.emit('state_changed');
    }
  }

  unlockElementalStone(clanId) {
    if (this.inventory.elementalStones[clanId] !== undefined) {
      this.inventory.elementalStones[clanId] = true;
      const stoneDef = ELEMENTAL_STONES[clanId];
      this.emit('stone_unlocked', stoneDef);
      this.emit('state_changed');
    }
  }

  addLorePage(pageId) {
    if (!this.inventory.lorePages.includes(pageId)) {
      this.inventory.lorePages.push(pageId);
      const pageDef = LORE_PAGES[pageId] || { title: pageId };
      this.emit('lore_page_added', pageDef);
      this.emit('state_changed');
    }
  }

  // ----------------------------------------------------
  // Quest Operations
  // ----------------------------------------------------
  startQuest(questId) {
    const qData = questsData[questId];
    if (!qData) return;

    if (!this.quests[questId]) {
      const objState = {};
      qData.objectives.forEach(obj => { objState[obj.id] = false; });
      this.quests[questId] = { state: 'not_started', objectives: objState };
    }

    if (this.quests[questId].state === 'not_started') {
      this.quests[questId].state = 'active';
      this.emit('quest_started', qData);
      this.emit('state_changed');
    }
  }

  completeObjective(questId, objectiveId) {
    const q = this.quests[questId];
    if (q && q.state === 'active' && q.objectives[objectiveId] === false) {
      q.objectives[objectiveId] = true;
      this.emit('objective_completed', { questId, objectiveId });
      this.emit('state_changed');
    }
  }

  completeQuest(questId) {
    const q = this.quests[questId];
    const qData = questsData[questId];
    if (!q || !qData || q.state === 'completed') return;

    q.state = 'completed';

    // Mark all objectives as completed
    for (const objId in q.objectives) {
      q.objectives[objId] = true;
    }

    // Grant Quest Rewards automatically
    if (qData.rewards) {
      if (qData.rewards.clanTrust) {
        for (const [cId, val] of Object.entries(qData.rewards.clanTrust)) {
          this.modifyClanTrust(cId, val);
        }
      }
      if (qData.rewards.items) {
        qData.rewards.items.forEach(itemId => this.addItem(itemId));
      }
      if (qData.rewards.elementalStones) {
        qData.rewards.elementalStones.forEach(clanId => this.unlockElementalStone(clanId));
      }
      if (qData.rewards.lorePages) {
        qData.rewards.lorePages.forEach(pId => this.addLorePage(pId));
      }
    }

    this.emit('quest_completed', qData);
    this.emit('state_changed');
  }

  getQuestState(questId) {
    return this.quests[questId]?.state || 'not_started';
  }

  // ----------------------------------------------------
  // Flag Operations
  // ----------------------------------------------------
  setFlag(key, val) {
    this.flags[key] = val;
    this.emit('state_changed');
  }

  getFlag(key) {
    return this.flags[key];
  }

  // ----------------------------------------------------
  // Safe Condition Evaluation for Dialogue Branches
  // ----------------------------------------------------
  evaluateCondition(conditionStr) {
    if (!conditionStr) return true;

    try {
      // Create context proxy for condition evaluation
      const context = {
        flags: this.flags,
        quests: this.quests,
        trust: this.clanTrust,
        inventory: this.inventory
      };

      const fn = new Function('context', `
        with(context) {
          try {
            return !!(${conditionStr});
          } catch(e) {
            return false;
          }
        }
      `);
      return fn(context);
    } catch (e) {
      console.warn('[GameState] Condition eval error:', conditionStr, e);
      return false;
    }
  }

  // ----------------------------------------------------
  // Serialization for Save/Load
  // ----------------------------------------------------
  serialize(playerPos, playerRot) {
    return {
      version: 1,
      timestamp: Date.now(),
      clanTrust: this.clanTrust,
      inventory: this.inventory,
      quests: this.quests,
      flags: this.flags,
      settings: this.settings,
      player: {
        x: playerPos ? playerPos.x : 0,
        y: playerPos ? playerPos.y : 0,
        z: playerPos ? playerPos.z : 0,
        rotationY: playerRot || 0
      }
    };
  }

  deserialize(data) {
    if (!data) return false;

    if (data.clanTrust) this.clanTrust = Object.assign({}, this.clanTrust, data.clanTrust);
    if (data.inventory) {
      this.inventory = {
        elementalStones: Object.assign({}, this.inventory.elementalStones, data.inventory.elementalStones),
        keyItems: Array.isArray(data.inventory.keyItems) ? [...data.inventory.keyItems] : [],
        lorePages: Array.isArray(data.inventory.lorePages) ? [...data.inventory.lorePages] : []
      };
    }
    if (data.quests) this.quests = Object.assign({}, this.quests, data.quests);
    if (data.flags) this.flags = Object.assign({}, this.flags, data.flags);
    if (data.settings) this.settings = Object.assign({}, this.settings, data.settings);

    this.emit('state_changed');
    this.emit('state_loaded');
    return true;
  }
}
