/**
 * Phase 2 Gameplay Systems Verification Script
 * Validates GameState, Dialogue tree logic, Quests, Clan Trust, Inventory, and Save/Load serialization.
 */

import { GameState } from '../src/systems/GameState.js';
import dialogueData from '../src/data/dialogue.json' with { type: 'json' };
import questsData from '../src/data/quests.json' with { type: 'json' };

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing Phase 2 Gameplay Systems ---');

const gameState = new GameState();

// 1. Clan Trust initial state & modifications
assert(gameState.getClanTrust('embercrest') === 0, 'Initial Embercrest trust is 0');
gameState.modifyClanTrust('embercrest', 15);
assert(gameState.getClanTrust('embercrest') === 15, 'Embercrest trust increases to 15');
gameState.modifyClanTrust('tidewrought', -10);
assert(gameState.getClanTrust('tidewrought') === -10, 'Tidewrought trust decreases to -10');

// Test clamping
gameState.modifyClanTrust('embercrest', 200);
assert(gameState.getClanTrust('embercrest') === 100, 'Clan trust is clamped to maximum 100');
gameState.modifyClanTrust('embercrest', -300);
assert(gameState.getClanTrust('embercrest') === -100, 'Clan trust is clamped to minimum -100');
gameState.modifyClanTrust('embercrest', 100); // reset to 0

// 2. Dialogue Tree Navigation
const elaraTree = dialogueData['elara_dialogue'];
assert(!!elaraTree, 'Elara dialogue tree exists');
const startNode = elaraTree.nodes['start'];
assert(!!startNode, 'Start node exists in dialogue tree');

// Test condition evaluation
assert(gameState.evaluateCondition('!flags.elara_quest_offered') === true, 'Condition !flags.elara_quest_offered evaluates true');
gameState.setFlag('elara_quest_offered', true);
assert(gameState.evaluateCondition('!flags.elara_quest_offered') === false, 'Condition !flags.elara_quest_offered evaluates false after setting flag');

// 3. Quest Lifecycle
assert(gameState.getQuestState('q_ember_relic') === 'not_started', 'Quest starts in not_started state');
gameState.startQuest('q_ember_relic');
assert(gameState.getQuestState('q_ember_relic') === 'active', 'Quest transitions to active state');

// 4. Pickup & Objective Completion
assert(gameState.hasItem('ancient_fire_fragment') === false, 'Player does not have fragment initially');
gameState.addItem('ancient_fire_fragment');
assert(gameState.hasItem('ancient_fire_fragment') === true, 'Player has fragment after pickup');
gameState.completeObjective('q_ember_relic', 'obj_retrieve_fragment');
assert(gameState.quests['q_ember_relic'].objectives['obj_retrieve_fragment'] === true, 'Objective marked completed');

// 5. Quest Completion & Rewards
gameState.completeQuest('q_ember_relic');
assert(gameState.getQuestState('q_ember_relic') === 'completed', 'Quest state is completed');
assert(gameState.inventory.elementalStones.embercrest === true, 'Embercrest elemental stone unlocked as reward');
assert(gameState.hasItem('cinder_pendant') === true, 'Amulet of Cinderfall key item added to inventory');
assert(gameState.inventory.lorePages.includes('lore_page_1'), 'Lore page 1 added to Book of Fractured Truths');

// 6. Save & Load Serialization
const mockPlayerPos = { x: 12.5, y: 1.8, z: -5.4 };
const mockPlayerRot = 1.57;
const serialized = gameState.serialize(mockPlayerPos, mockPlayerRot);
assert(serialized.clanTrust.embercrest !== undefined, 'Save includes clan trust');
assert(serialized.inventory.elementalStones.embercrest === true, 'Save includes unlocked elemental stone');
assert(serialized.quests['q_ember_relic'].state === 'completed', 'Save includes completed quest');
assert(serialized.player.x === 12.5, 'Save includes player coordinate X');

// Deserialize into a fresh game state
const freshState = new GameState();
freshState.deserialize(serialized);
assert(freshState.getQuestState('q_ember_relic') === 'completed', 'Loaded state restores completed quest');
assert(freshState.inventory.elementalStones.embercrest === true, 'Loaded state restores elemental stone');
assert(freshState.hasItem('ancient_fire_fragment') === true, 'Loaded state restores key items');
assert(freshState.inventory.lorePages.includes('lore_page_1'), 'Loaded state restores lore pages');

console.log('🎉 ALL PHASE 2 GAMEPLAY SYSTEM TESTS PASSED SUCCESSFULLY!');
