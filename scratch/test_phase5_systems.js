import { GameState } from '../src/systems/GameState.js';
import { ITEMS_DATABASE, ELEMENTAL_STONES } from '../src/data/items.js';
import { LORE_PAGES, CONTRADICTION_TOPICS } from '../src/data/lorePages.js';
import questsData from '../src/data/quests.json' with { type: 'json' };
import dialogueData from '../src/data/dialogue.json' with { type: 'json' };
import regionData from '../src/data/regions/tidewrought.json' with { type: 'json' };

console.log('====================================================');
console.log('AETHRAVA - PHASE 5 TEST SUITE: TIDEWROUGHT REGION');
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
console.log('\n--- Test 1: Tidewrought Region Data Spec ---');
assert(regionData.id === 'tidewrought', 'Region id is tidewrought');
assert(regionData.element === 'Water', 'Region element is Water');
assert(regionData.god === 'Nerivael the Deep Mind', 'God is Nerivael the Deep Mind');
assert(regionData.villageName === 'Thalassport', 'Village is Thalassport');
assert(regionData.sacredAnimals.includes('Whale') && regionData.sacredAnimals.includes('Serpent'), 'Sacred beasts are Whale and Serpent');
assert(regionData.landmarks.length >= 8, `Region defines ${regionData.landmarks.length} landmarks`);
assert(regionData.puzzles.sluice_flow && regionData.puzzles.sunken_path && regionData.puzzles.tidal_reflection, 'All 3 puzzle specs defined');

// -----------------------------------------------------------------
// Test 2: NPC Dialogue Trees & Trust Effects
// -----------------------------------------------------------------
console.log('\n--- Test 2: NPC Dialogue Trees & Trust Modifiers ---');
const expectedNPCs = ['marina_dialogue', 'sylas_dialogue', 'vael_dialogue', 'corvo_dialogue', 'mira_dialogue', 'nerivael_cinematic_dialogue'];
expectedNPCs.forEach(treeId => {
  assert(dialogueData[treeId] !== undefined, `Dialogue tree exists: ${treeId}`);
  assert(dialogueData[treeId].nodes && dialogueData[treeId].nodes.start, `Tree ${treeId} has valid root node`);
});

// Check lie piercer on Sea-Seer Vael
const vaelLie = dialogueData.vael_dialogue.nodes.test_lie;
assert(vaelLie && vaelLie.isLie === true, 'Sea-Seer Vael has a lie detectable by Eye Vision');
assert(vaelLie.lieReason.includes('Eye Vision'), 'Vael lie has detailed Eye Vision reason');

// Check moral choice on Corvo the Smuggler
const corvoBargain = dialogueData.corvo_dialogue.nodes.the_bargain;
assert(corvoBargain && corvoBargain.choices.length === 2, 'Corvo offers a 2-way moral choice');
assert(corvoBargain.choices[0].nextNode === 'accept_smuggler' && corvoBargain.choices[0].modifyTrust.veilborn > 0, 'Choice 1 helps smuggler (+Veilborn)');
assert(corvoBargain.choices[1].nextNode === 'reject_smuggler' && corvoBargain.choices[1].modifyTrust.tidewrought > 0, 'Choice 2 upholds fleet law (+Tidewrought)');

// -----------------------------------------------------------------
// Test 3: Four Tidewrought Lore Pages & Contradiction System
// -----------------------------------------------------------------
console.log('\n--- Test 3: Tidewrought Lore Pages & Cross-Clan Contradictions ---');
const tidePages = ['lore_tide_4', 'lore_tide_5', 'lore_tide_6', 'lore_tide_7'];
tidePages.forEach(pid => {
  assert(LORE_PAGES[pid] !== undefined, `Lore page exists: ${pid} (${LORE_PAGES[pid].title})`);
  assert(LORE_PAGES[pid].clanId === 'tidewrought', `Lore page ${pid} belongs to tidewrought`);
});

// Contradiction 1: lore_tide_6 vs lore_ember_7 & lore_stone_3 on topic 'the_world_core'
assert(LORE_PAGES.lore_tide_6.topicId === 'the_world_core', 'lore_tide_6 addresses the_world_core topic');
assert(LORE_PAGES.lore_ember_7.topicId === 'the_world_core', 'lore_ember_7 addresses the_world_core topic');
assert(CONTRADICTION_TOPICS.the_world_core !== undefined, 'the_world_core topic is registered in CONTRADICTION_TOPICS');

// Contradiction 2: lore_tide_7 vs lore_ember_3 on topic 'the_nature_of_gods'
assert(LORE_PAGES.lore_tide_7.topicId === 'the_nature_of_gods', 'lore_tide_7 addresses the_nature_of_gods topic');
assert(LORE_PAGES.lore_ember_3.topicId === 'the_nature_of_gods', 'lore_ember_3 addresses the_nature_of_gods topic');
assert(CONTRADICTION_TOPICS.the_nature_of_gods !== undefined, 'the_nature_of_gods topic is registered in CONTRADICTION_TOPICS');

// -----------------------------------------------------------------
// Test 4: End-to-End Tidewrought Quest Chain Progression
// -----------------------------------------------------------------
console.log('\n--- Test 4: End-to-End Quest Chain to Water Stone ---');
const gameState = new GameState();

// Initial state
assert(gameState.getClanTrust('tidewrought') === 0, 'Initial Tidewrought trust is 0');
assert(gameState.inventory.elementalStones.tidewrought === false, 'Water Stone not yet unlocked');

// Quest 1: Tides of Thalassport
gameState.startQuest('q_tide_arrival');
assert(gameState.getQuestState('q_tide_arrival') === 'active', 'q_tide_arrival started');
gameState.completeObjective('q_tide_arrival', 'obj_speak_marina');
gameState.completeObjective('q_tide_arrival', 'obj_speak_vael');
gameState.completeQuest('q_tide_arrival');
assert(gameState.getQuestState('q_tide_arrival') === 'completed', 'q_tide_arrival completed');
assert(gameState.hasItem('sunken_relic_fragment'), 'Awarded sunken_relic_fragment item');
assert(gameState.getClanTrust('tidewrought') === 15, 'Tidewrought trust rose to 15');

// Quest 2: The Draining of the Flats (Sluice Puzzle)
gameState.startQuest('q_tide_sluice');
assert(gameState.getQuestState('q_tide_sluice') === 'active', 'q_tide_sluice started');
gameState.completeObjective('q_tide_sluice', 'obj_deliver_relic');
gameState.completeObjective('q_tide_sluice', 'obj_drain_sluice');
gameState.completeQuest('q_tide_sluice');
assert(gameState.getQuestState('q_tide_sluice') === 'completed', 'q_tide_sluice completed');
assert(gameState.hasItem('sluice_gear_crank'), 'Awarded sluice_gear_crank');
assert(gameState.getClanTrust('tidewrought') === 35, 'Tidewrought trust rose to 35');

// Quest 3: Voices of the Deep (Sacred Beasts)
gameState.startQuest('q_abyssal_beasts');
assert(gameState.getQuestState('q_abyssal_beasts') === 'active', 'q_abyssal_beasts started');
gameState.completeObjective('q_abyssal_beasts', 'obj_commune_whale');
gameState.completeObjective('q_abyssal_beasts', 'obj_commune_serpent');
gameState.completeQuest('q_abyssal_beasts');
assert(gameState.getQuestState('q_abyssal_beasts') === 'completed', 'q_abyssal_beasts completed');
assert(gameState.hasItem('whale_ambergris'), 'Awarded whale_ambergris');
assert(gameState.hasItem('serpent_scale_talisman'), 'Awarded serpent_scale_talisman');
assert(gameState.getClanTrust('tidewrought') === 60, 'Tidewrought trust rose to 60');

// Quest 4: The Smuggler's Bargain (Hard Moral Choice)
gameState.startQuest('q_smuggler_choice');
assert(gameState.getQuestState('q_smuggler_choice') === 'active', 'q_smuggler_choice started');
gameState.completeObjective('q_smuggler_choice', 'obj_make_choice');
gameState.completeQuest('q_smuggler_choice');
assert(gameState.getQuestState('q_smuggler_choice') === 'completed', 'q_smuggler_choice completed');
assert(gameState.hasItem('abyssal_prism_pearl'), 'Awarded abyssal_prism_pearl');
assert(gameState.getClanTrust('tidewrought') === 75, 'Tidewrought trust rose to 75');

// Quest 5: The Drowned Causeway (Eye Vision puzzle)
gameState.startQuest('q_sunken_depths');
assert(gameState.getQuestState('q_sunken_depths') === 'active', 'q_sunken_depths started');
gameState.completeObjective('q_sunken_depths', 'obj_cross_sunken');
gameState.completeQuest('q_sunken_depths');
assert(gameState.getQuestState('q_sunken_depths') === 'completed', 'q_sunken_depths completed');
assert(gameState.getClanTrust('tidewrought') === 95, 'Tidewrought trust rose to 95');

// Quest 6: The Mirror of Tides (Tidal Reflection Puzzle)
gameState.startQuest('q_reflection_altar');
assert(gameState.getQuestState('q_reflection_altar') === 'active', 'q_reflection_altar started');
gameState.completeObjective('q_reflection_altar', 'obj_align_mirrors');
gameState.completeObjective('q_reflection_altar', 'obj_unlock_vault');
gameState.completeQuest('q_reflection_altar');
assert(gameState.getQuestState('q_reflection_altar') === 'completed', 'q_reflection_altar completed');
assert(gameState.getClanTrust('tidewrought') === 100, 'Tidewrought trust capped at maximum 100');

// Quest 7: The Deep Mind's Verdict (Nerivael Shrine & Water Stone Claim)
gameState.startQuest('q_deep_mind_verdict');
assert(gameState.getQuestState('q_deep_mind_verdict') === 'active', 'q_deep_mind_verdict started');
gameState.completeObjective('q_deep_mind_verdict', 'obj_face_nerivael');
gameState.completeObjective('q_deep_mind_verdict', 'obj_claim_water_stone');
gameState.completeQuest('q_deep_mind_verdict');
assert(gameState.getQuestState('q_deep_mind_verdict') === 'completed', 'q_deep_mind_verdict completed');

// Water Stone Verification
assert(gameState.inventory.elementalStones.tidewrought === true, 'Stone of Abyssal Depth (Water Stone) is successfully claimed and in inventory!');
assert(ELEMENTAL_STONES.tidewrought.id === 'stone_abyss', 'Water stone metadata verified: stone_abyss');
assert(ELEMENTAL_STONES.tidewrought.element === 'Water', 'Water stone element verified');

// -----------------------------------------------------------------
// Test 5: Items Database Consistency
// -----------------------------------------------------------------
console.log('\n--- Test 5: Tidewrought Items in Database ---');
const requiredItems = [
  'sunken_relic_fragment',
  'sluice_gear_crank',
  'whale_ambergris',
  'serpent_scale_talisman',
  'abyssal_prism_pearl'
];
requiredItems.forEach(itemId => {
  assert(ITEMS_DATABASE[itemId] !== undefined, `Item exists in ITEMS_DATABASE: ${itemId}`);
  assert(ITEMS_DATABASE[itemId].name && ITEMS_DATABASE[itemId].icon, `Item ${itemId} has valid display properties`);
});

console.log('\n====================================================');
console.log(`ALL TESTS PASSED! (${passedTests}/${totalTests})`);
console.log('TIDEWROUGHT REGION SYSTEMS FULLY VERIFIED.');
console.log('====================================================');
