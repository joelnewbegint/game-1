import { GameState } from '../src/systems/GameState.js';
import { ITEMS_DATABASE, ELEMENTAL_STONES } from '../src/data/items.js';
import { LORE_PAGES, CONTRADICTION_TOPICS } from '../src/data/lorePages.js';
import questsData from '../src/data/quests.json' with { type: 'json' };
import dialogueData from '../src/data/dialogue.json' with { type: 'json' };
import regionData from '../src/data/regions/embercrest.json' with { type: 'json' };

console.log('====================================================');
console.log('AETHRAVA - PHASE 4 TEST SUITE: EMBERCREST REGION');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
}

// -----------------------------------------------------------------
// Test 1: Region Data Spec Verification
// -----------------------------------------------------------------
console.log('\n--- Test 1: Embercrest Region Data Spec ---');
assert(regionData.id === 'embercrest', 'Region id is embercrest');
assert(regionData.element === 'Fire', 'Region element is Fire');
assert(regionData.god === 'Ignareth the Burning Mother', 'God is Ignareth the Burning Mother');
assert(regionData.villageName === 'Cinderfall', 'Village is Cinderfall');
assert(regionData.sacredAnimals.includes('Phoenix') && regionData.sacredAnimals.includes('Lion'), 'Sacred beasts are Phoenix and Lion');
assert(regionData.landmarks.length >= 8, `Region defines ${regionData.landmarks.length} landmarks`);
assert(regionData.puzzles.forge && regionData.puzzles.lava_path && regionData.puzzles.temple_prisms, 'All 3 puzzle specs defined');

// -----------------------------------------------------------------
// Test 2: NPC Dialogue Trees & Trust Effects
// -----------------------------------------------------------------
console.log('\n--- Test 2: NPC Dialogue Trees & Trust Modifiers ---');
const expectedNPCs = ['varek_dialogue', 'kael_dialogue', 'pyra_dialogue', 'morvath_dialogue', 'tula_dialogue', 'ignareth_cinematic_dialogue'];
expectedNPCs.forEach(treeId => {
  assert(dialogueData[treeId] !== undefined, `Dialogue tree exists: ${treeId}`);
  assert(dialogueData[treeId].nodes && dialogueData[treeId].nodes.start, `Tree ${treeId} has valid root node`);
});

// Check lie piercer on Pyra
const pyraLie = dialogueData.pyra_dialogue.nodes.test_lie;
assert(pyraLie && pyraLie.isLie === true, 'High Priestess Pyra has a lie detectable by Eye Vision');
assert(pyraLie.lieReason.includes('Eye Vision'), 'Pyra lie has detailed Eye Vision reason');

// -----------------------------------------------------------------
// Test 3: Four Embercrest Lore Pages & Contradiction System
// -----------------------------------------------------------------
console.log('\n--- Test 3: Embercrest Lore Pages & Contradiction ---');
const emberPages = ['lore_ember_4', 'lore_ember_5', 'lore_ember_6', 'lore_ember_7'];
emberPages.forEach(pid => {
  assert(LORE_PAGES[pid] !== undefined, `Lore page exists: ${pid} (${LORE_PAGES[pid].title})`);
  assert(LORE_PAGES[pid].clanId === 'embercrest', `Lore page ${pid} belongs to embercrest`);
});

// Contradiction verification: lore_ember_7 vs lore_stone_3 on topic 'the_world_core'
assert(LORE_PAGES.lore_ember_7.topicId === 'the_world_core', 'lore_ember_7 addresses the_world_core topic');
assert(LORE_PAGES.lore_stone_3.topicId === 'the_world_core', 'lore_stone_3 addresses the_world_core topic');
assert(CONTRADICTION_TOPICS.the_world_core !== undefined, 'the_world_core is registered in CONTRADICTION_TOPICS');

// -----------------------------------------------------------------
// Test 4: End-to-End Embercrest Quest Chain Progression
// -----------------------------------------------------------------
console.log('\n--- Test 4: End-to-End Quest Chain to Fire Stone ---');
const gameState = new GameState();

// Initial state
assert(gameState.getClanTrust('embercrest') === 0, 'Initial Embercrest trust is 0');
assert(gameState.inventory.elementalStones.embercrest === false, 'Fire Stone not yet unlocked');

// Quest 1: The Embers of Cinderfall
gameState.startQuest('q_cinderfall_welcome');
assert(gameState.getQuestState('q_cinderfall_welcome') === 'active', 'q_cinderfall_welcome started');
gameState.completeObjective('q_cinderfall_welcome', 'obj_speak_varek');
gameState.completeObjective('q_cinderfall_welcome', 'obj_speak_pyra');
gameState.completeQuest('q_cinderfall_welcome');
assert(gameState.getQuestState('q_cinderfall_welcome') === 'completed', 'q_cinderfall_welcome completed');
assert(gameState.hasItem('igneous_ore'), 'Awarded raw igneous_ore item');
assert(gameState.getClanTrust('embercrest') === 15, 'Embercrest trust rose to 15');

// Quest 2: The Smith's Crucible (Forge Puzzle)
gameState.startQuest('q_forge_crucible');
assert(gameState.getQuestState('q_forge_crucible') === 'active', 'q_forge_crucible started');
gameState.completeObjective('q_forge_crucible', 'obj_deliver_ore');
// Solving Forge Puzzle sequence [3, 2, 1]
gameState.completeObjective('q_forge_crucible', 'obj_solve_forge');
gameState.completeQuest('q_forge_crucible');
assert(gameState.getQuestState('q_forge_crucible') === 'completed', 'q_forge_crucible completed');
assert(gameState.hasItem('temple_sun_key'), 'Awarded temple_sun_key');
assert(gameState.getClanTrust('embercrest') === 35, 'Embercrest trust rose to 35');

// Quest 3: The Beast's Blessing (Lion and Phoenix)
gameState.startQuest('q_beasts_blessing');
assert(gameState.getQuestState('q_beasts_blessing') === 'active', 'q_beasts_blessing started');
gameState.addItem('lion_mane_talisman');
gameState.completeObjective('q_beasts_blessing', 'obj_commune_lion');
gameState.addItem('phoenix_feather');
gameState.completeObjective('q_beasts_blessing', 'obj_collect_feather');
gameState.completeQuest('q_beasts_blessing');
assert(gameState.getQuestState('q_beasts_blessing') === 'completed', 'q_beasts_blessing completed');
assert(gameState.hasItem('lion_mane_talisman'), 'Has lion_mane_talisman');
assert(gameState.hasItem('phoenix_feather'), 'Has phoenix_feather');
assert(gameState.getClanTrust('embercrest') === 60, 'Embercrest trust rose to 60 (Revered status)');

// Quest 4: The Molten Crossing (Lava Path with Eye Vision)
gameState.startQuest('q_molten_crossing');
assert(gameState.getQuestState('q_molten_crossing') === 'active', 'q_molten_crossing started');
gameState.completeObjective('q_molten_crossing', 'obj_cross_lava');
gameState.completeQuest('q_molten_crossing');
assert(gameState.getQuestState('q_molten_crossing') === 'completed', 'q_molten_crossing completed');
assert(gameState.getClanTrust('embercrest') === 75, 'Embercrest trust rose to 75');

// Quest 5: The Pillars of Ignareth (Temple Focus Prisms)
gameState.startQuest('q_temple_prisms');
assert(gameState.getQuestState('q_temple_prisms') === 'active', 'q_temple_prisms started');
gameState.completeObjective('q_temple_prisms', 'obj_align_prisms');
gameState.completeObjective('q_temple_prisms', 'obj_unlock_gate');
gameState.completeQuest('q_temple_prisms');
assert(gameState.getQuestState('q_temple_prisms') === 'completed', 'q_temple_prisms completed');
assert(gameState.getClanTrust('embercrest') === 100, 'Embercrest trust reached max 100');

// Quest 6: The Burning Mother's Verdict (Ignareth Shrine Cinematic)
gameState.startQuest('q_burning_mother');
assert(gameState.getQuestState('q_burning_mother') === 'active', 'q_burning_mother started');
gameState.completeObjective('q_burning_mother', 'obj_face_ignareth');
gameState.completeObjective('q_burning_mother', 'obj_claim_fire_stone');
gameState.completeQuest('q_burning_mother');
assert(gameState.getQuestState('q_burning_mother') === 'completed', 'q_burning_mother completed');

// FINAL VERIFICATION: FIRE ELEMENTAL STONE
assert(gameState.inventory.elementalStones.embercrest === true, 'FIRE ELEMENTAL STONE (Stone of Pyres) IS UNLOCKED IN INVENTORY!');
const stoneDef = ELEMENTAL_STONES.embercrest;
assert(stoneDef.name === 'Stone of Pyres', `Stone name is ${stoneDef.name}`);
assert(stoneDef.god === 'Ignareth the Burning Mother', `Stone god is ${stoneDef.god}`);

console.log('\n====================================================');
console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests}`);
console.log('====================================================');
