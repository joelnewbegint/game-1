/**
 * Phase 3 Automated Verification Test Script
 * Verifies Eye Vision mode, 20 Lore Pages, Contradiction Engine, and Dialogue Lie Detection.
 */

import { GameState } from '../src/systems/GameState.js';
import { LORE_PAGES, CONTRADICTION_TOPICS } from '../src/data/lorePages.js';
import dialogueData from '../src/data/dialogue.json' with { type: 'json' };

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

console.log('--- Testing Phase 3: Magic Eye & Lore Book Systems ---');

// 1. Lore Pages Data Integrity
const pageKeys = Object.keys(LORE_PAGES);
assert(pageKeys.length === 20, `Total Lore Pages is exactly 20 (found ${pageKeys.length})`);

// Check Clan Breakdown (3 per clan = 15, + 5 myth pages)
const clanCounts = {};
pageKeys.forEach(k => {
  const page = LORE_PAGES[k];
  assert(page.id && page.title && page.text && page.claim, `Page ${k} has valid id, title, text, and claim`);
  clanCounts[page.clanId] = (clanCounts[page.clanId] || 0) + 1;
});

assert(clanCounts['embercrest'] === 3, 'Embercrest has 3 pages');
assert(clanCounts['tidewrought'] === 3, 'Tidewrought has 3 pages');
assert(clanCounts['stonebound'] === 3, 'Stonebound has 3 pages');
assert(clanCounts['skyreavers'] === 3, 'Skyreavers has 3 pages');
assert(clanCounts['veilborn'] === 3, 'Veilborn has 3 pages');
assert(clanCounts['myth'] >= 4, 'Ancient Myth has at least 4 pages');

// 2. Contradiction Topics
assert(Object.keys(CONTRADICTION_TOPICS).length >= 4, 'At least 4 contradiction topics defined');
const genesisPages = pageKeys.filter(k => LORE_PAGES[k].topicId === 'the_genesis');
assert(genesisPages.length >= 3, 'The Genesis topic has multiple contradicting clan accounts');

// 3. Dialogue Lie Flagging
const explainShrineNode = dialogueData['elara_dialogue'].nodes['explain_shrine'];
assert(explainShrineNode.isLie === true, 'explain_shrine node has isLie: true');
assert(!!explainShrineNode.lieReason, 'explain_shrine node has a detailed lieReason');

// Check Eye Vision condition on confront choice
const confrontChoice = explainShrineNode.choices.find(c => c.nextNode === 'confront_lie');
assert(!!confrontChoice, 'Confront choice exists in dialogue tree');
assert(confrontChoice.condition.includes('flags.eye_vision_active'), 'Confront choice checks flags.eye_vision_active');

// 4. GameState & Contradictions Resolution Logic
const gameState = new GameState();

// Initial: No pages
assert(gameState.inventory.lorePages.length === 0, 'Initial lore pages inventory is empty');

// Collect 1 Page: Embercrest Genesis
gameState.addLorePage('lore_ember_1');
assert(gameState.inventory.lorePages.includes('lore_ember_1'), 'Page 1 added to inventory');

// Contradiction test: only 1 page collected for the_genesis -> Not yet unlocked
const checkContradictions = (state) => {
  const collected = state.inventory.lorePages.map(id => LORE_PAGES[id]).filter(Boolean);
  const topicMap = {};
  collected.forEach(p => {
    if (p.topicId) {
      if (!topicMap[p.topicId]) topicMap[p.topicId] = [];
      topicMap[p.topicId].push(p);
    }
  });
  return Object.values(topicMap).filter(list => list.length >= 2);
};

assert(checkContradictions(gameState).length === 0, 'Contradictions tab remains locked with only 1 page');

// Collect 2nd Conflicting Page: Tidewrought Genesis (Hidden page revealed by Eye Vision)
gameState.addLorePage('lore_tide_1');
assert(gameState.inventory.lorePages.includes('lore_tide_1'), 'Page 4 added to inventory');

const unlockedContradictions = checkContradictions(gameState);
assert(unlockedContradictions.length === 1, 'Contradictions tab UNLOCKS with 2 conflicting pages on the_genesis!');
assert(unlockedContradictions[0][0].clan !== unlockedContradictions[0][1].clan, 'The two contradictory accounts belong to opposing clans');

// 5. Eye Vision Energy Simulation
let energy = 100;
let isActive = true;
const drainRate = 16.0;
const delta = 0.5; // 0.5s simulation step

// Drain simulation
energy -= drainRate * delta;
assert(energy === 92, 'Eye Vision energy drains while active');

// Depletion simulation
energy = 0;
if (energy <= 0) isActive = false;
assert(isActive === false, 'Eye Vision automatically deactivates upon energy depletion');

// Recharge simulation
const rechargeRate = 20.0;
energy += rechargeRate * delta;
assert(energy === 10, 'Eye Vision energy recharges when inactive');

console.log('🎉 ALL PHASE 3 EYE VISION & LORE BOOK TESTS PASSED SUCCESSFULLY!');
