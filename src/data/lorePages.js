/**
 * Aethrava - The Book of Fractured Truths
 * 15 Clan Pages (3 per Clan) + 5 Myth Pages of the Gods.
 * Each page contains a distinct, contradictory version of world history and origin.
 */

export const CONTRADICTION_TOPICS = {
  the_genesis: {
    id: 'the_genesis',
    title: 'The Origin of Creation',
    description: 'Did the world arise from eternal fire, infinite ocean, or the slumber of earth?'
  },
  the_shattering: {
    id: 'the_shattering',
    title: 'The Shattering of the First Eye',
    description: 'Who broke the First Eye? A holy act of deliverance, or a betrayal by mortal greed?'
  },
  the_nature_of_gods: {
    id: 'the_nature_of_gods',
    title: 'The Divine Condition',
    description: 'Are the Five Gods eternal sovereigns, or fading splinters of one dying cosmic entity?'
  },
  the_beasts_memory: {
    id: 'the_beasts_memory',
    title: 'The Primordial Beasts',
    description: 'Do the ancient beasts hold the true history that humankind deliberately forgot?'
  },
  the_world_core: {
    id: 'the_world_core',
    title: 'The Heart of the World',
    description: 'Is the planetary core a churning forge of sacred flame, or dead petrified bedrock?'
  }
};

export const LORE_PAGES = {
  // ==========================================
  // EMBERCREST (FIRE) - 3 Pages
  // ==========================================
  lore_ember_1: {
    id: 'lore_ember_1',
    number: 1,
    title: 'The First Spark',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_genesis',
    claim: 'Ignareth the Burning Mother ignited the void with sacred fire, giving life and thought to all gods.',
    text: `Before time had a name, existence was an unformed, frozen abyss. Ignareth wept a single teardrop of molten gold into the void. Where it fell, the Great Hearth caught flame, thawing the petrified heavens.\n\nAll lesser elements—water, dust, and wind—are but cooling byproducts of her divine forge. To claim that life arose from cold mud or drowned depths is a blasphemy against the Sacred Pyre.`
  },
  lore_ember_2: {
    id: 'lore_ember_2',
    number: 2,
    title: 'The Sacrificial Severing',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_shattering',
    claim: 'The First Eye shattered voluntarily so Ignareth could cleanse mortal spirits with purifying flame.',
    text: `The First Eye was an unyielding star whose concentrated brilliance threatened to incinerate creation. In an act of supreme mercy, Ignareth commanded her blade of solar light to strike the crystal center, splintering the monolith into five bearable flames.\n\nThe Order of the Open Eye lies when they say mortals struck the blow. It was divine will, forged in sacrificial love.`
  },
  lore_ember_3: {
    id: 'lore_ember_3',
    number: 3,
    title: 'The Immortal Blaze',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_nature_of_gods',
    claim: 'The gods are undying flames whose power only grows through sacred war and the smelting of souls.',
    text: `False prophets whisper that our deities grow weary—that their radiance dwindles with the ages. Fools! Ignareth feeds upon the fervor of battle and the smelting of iron wills.\n\nSo long as the forge-fires of Cinderfall burn bright, the gods shall never die. War is not our ruin; it is the bellows that keeps divinity alive.`
  },
  lore_ember_4: {
    id: 'lore_ember_4',
    number: 21,
    title: 'The Forge of Souls',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_nature_of_gods',
    claim: 'Every mortal soul is a hot ember hammered upon the anvil of life until sharp enough to join the holy blaze.',
    text: `In Cinderfall, a blacksmith does not merely shape plowshares or battle-axes; they temper the spirit. The body is raw ore; suffering is the furnace; discipline is the hammer.\n\nThose who complain of hardships understand nothing of metallurgy. To be struck again and again by fate is not a curse, but the highest honor the Burning Mother can bestow.`
  },
  lore_ember_5: {
    id: 'lore_ember_5',
    number: 22,
    title: 'The Lion and the Phoenix',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_beasts_memory',
    claim: 'The Sacred Fire Lion guards the terrestrial magma, while the Phoenix carries prayers to the solar zenith.',
    text: `When the first men climbed the volcanic crags, the beasts challenged them not with claws, but with fire. The Great Lion roared with the heat of the molten earth, testing our endurance.\n\nThe Phoenix shed a golden feather upon our chieftain's brow, sealing the pact: so long as Embercrest keeps the sacred pyres alight, the predators of the highlands shall walk beside us as guardians, not beasts of slaughter.`
  },
  lore_ember_6: {
    id: 'lore_ember_6',
    number: 23,
    title: 'The Caldera\'s Secret',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_shattering',
    claim: 'The true Stone of Pyres rests in the volcanic heart of the Caldera, accessible only to the one born with the Magic Eye.',
    text: `Deep within the boiling bowels of Mount Ignareth lies the temple built before the first human clan had a name. Our priests guard the entrance, yet none can cross the subterranean lava path without burning to cinder.\n\nAncient prophecies carved in igneous basalt foretell that one marked with the luminous pupil shall bridge the molten chasm and behold the Burning Mother face to face.`
  },
  lore_ember_7: {
    id: 'lore_ember_7',
    number: 24,
    title: 'The Smoldering Core',
    clan: 'Embercrest',
    clanId: 'embercrest',
    clanColor: '#ff5c2b',
    topicId: 'the_world_core',
    claim: 'The center of Aethrava is an eternal molten furnace of pure solar fire that pumps heat into every living vein.',
    text: `The Stonebound heretics claim the earth is cold stone all the way down to Torvund’s petrified ribcage. What utter blindness! Dig three paces into any cavern and the stones begin to sweat. Dig ten leagues and you reach the eternal magma sea.\n\nLife does not spring from cold rocks. The heart of the world is Ignareth’s boiling blood, without which all mountains would freeze into barren ice.`
  },

  // ==========================================
  // TIDEWROUGHT (WATER) - 3 Pages
  // ==========================================
  lore_tide_1: {
    id: 'lore_tide_1',
    number: 4,
    title: 'The Primordial Depths',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_genesis',
    claim: 'Nerivael the Deep Mind was the infinite primordial sea; fire was merely a brief bubble upon the water.',
    text: `The Embercrest chant their arrogant myths of flame, yet they forget that fire cannot exist without a surface to burn upon. In the beginning, there was only Nerivael—fathomless, silent, and omniscient.\n\nThe stars were merely phosphorescent pearls adrift in the celestial trench. All continents are drowned ruins waiting to sink back into the mother of all thought.`
  },
  lore_tide_2: {
    id: 'lore_tide_2',
    number: 5,
    title: 'The Drowned Vessel',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_shattering',
    claim: 'The First Eye was shattered by greedy human warlords who sought to siphon the oceans into their kingdoms.',
    text: `It was not a holy sacrifice, but mortal hubris that cracked the celestial sphere. Ancient kings, mad with thirst, hurled harpoons of iron into the pupil of the First Eye, seeking to drain its abyssal power into dry canals.\n\nThe resulting flood carved our fjords and buried the original empire under five leagues of salt water.`
  },
  lore_tide_3: {
    id: 'lore_tide_3',
    number: 6,
    title: 'The Dissolving Mind',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_nature_of_gods',
    claim: 'Nerivael is slowly dispersing into the oceans; the deep god is losing cohesive memory.',
    text: `Listen closely to the abyssal whale-song: the words are unraveling. Nerivael's thoughts are spreading too thin across the boundless currents. Each century, the Deep Mind forgets a language, a constellation, an ancient promise.\n\nThe gods are not ascending; they are diluting like drops of wine in a limitless sea.`
  },
  lore_tide_4: {
    id: 'lore_tide_4',
    number: 25,
    title: 'The Drowned Library',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_shattering',
    claim: 'The First Eye flooded the primordial empire when mortal kings breached the celestial vault.',
    text: `Beneath the tidal flats of Thalassport lie the marble domes of our drowned capital. Our ancestors were not savages waiting for fire; they built libraries that charted the currents of the cosmos.\n\nWhen greedy land-barons sought to carve the First Eye into jewels for their crowns, the sphere wept an ocean that submerged eighty leagues of coastline in a single night.`
  },
  lore_tide_5: {
    id: 'lore_tide_5',
    number: 26,
    title: 'Song of the Abyssal Leviathan',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_beasts_memory',
    claim: 'The Sacred Abyssal Whale preserves the acoustic memory of creation in frequencies mortals cannot alter.',
    text: `Humans carve their version of history in stone, yet wind and rain erode their vanity into smooth dust. The Great Whale sings into the seabed trenches, where sound travels ten thousand leagues without fading.\n\nEvery wave that breaks upon our cliffs carries ancient history in its foam. You need only listen with quiet reverence, rather than shouting over the roar of forge bellows.`
  },
  lore_tide_6: {
    id: 'lore_tide_6',
    number: 27,
    title: 'The Trench of Forgetting',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_world_core',
    claim: 'The center of Aethrava is an unfathomable ocean abyss of pure memory, not a furnace of molten rock.',
    text: `The Embercrest zealots tell absurd tales of an eternal furnace at the center of the world. Let them sail beyond the continental shelf and drop an iron sounding weight!\n\nTen miles down, there is no heat—only pitch-black water under crushing pressure, colder than mountain ice. The core of our realm is the oceanic mind of Nerivael, holding the weight of existence in silent contemplation.`
  },
  lore_tide_7: {
    id: 'lore_tide_7',
    number: 28,
    title: 'The Weeping God',
    clan: 'Tidewrought',
    clanId: 'tidewrought',
    clanColor: '#1d92bd',
    topicId: 'the_nature_of_gods',
    claim: 'Nerivael weeps oceanic brine because the five deities are fading splinters of one severed being.',
    text: `Embercrest praises holy war as a forge that tempers the soul. What suicidal arrogance! Every warrior struck down on the frontier bleeds the remaining divine lifeforce faster.\n\nNerivael weeps not out of weakness, but because the Deep Mind remembers what the other four gods have forgotten: we were whole once. And divided, we shall all dissolve into nothingness.`
  },


  // ==========================================
  // STONEBOUND (EARTH) - 3 Pages
  // ==========================================
  lore_stone_1: {
    id: 'lore_stone_1',
    number: 7,
    title: 'The Dreamer of Granite',
    clan: 'Stonebound',
    clanId: 'stonebound',
    clanColor: '#7a8253',
    topicId: 'the_genesis',
    claim: 'Torvund the Sleeping Mountain slept in empty space; the entire world is the contours of his dreaming body.',
    text: `Water evaporates and fire dies to gray ash, but granite endures forever. Torvund was not birthed by flame or drawn from brine. He lay slumbering, and his ribcage formed our valleys, his spine raised the jagged spires of the world.\n\nMortals do not walk on soil—we walk upon the slumbering flesh of God. If Torvund ever awakens fully, all fleeting things will be crushed beneath his shifting limbs.`
  },
  lore_stone_2: {
    id: 'lore_stone_2',
    number: 8,
    title: 'Fractured by the Chisel',
    clan: 'Stonebound',
    clanId: 'stonebound',
    clanColor: '#7a8253',
    topicId: 'the_shattering',
    claim: 'The First Eye fractured because Torvund turned in his deep sleep, grinding the celestial jewel against the world-roots.',
    text: `The philosophers argue over sins and sacrifices, but nature cares nothing for poetry. When Torvund groaned beneath the tectonic weight, his petrified shoulder struck the world-pillar where the First Eye was mounted.\n\nIt broke beneath bedrock pressure, like a quartz pebble crushed between millstones. Nothing more, nothing less.`
  },
  lore_stone_3: {
    id: 'lore_stone_3',
    number: 9,
    title: 'The Slumber That Stiffens',
    clan: 'Stonebound',
    clanId: 'stonebound',
    clanColor: '#7a8253',
    topicId: 'the_world_core',
    claim: 'The planet is cold, petrified bedrock all the way to Torvund\'s silent basalt heart; warmth is merely a superficial skin.',
    text: `Our elders place their ears against the cavern bedrock and count the seismic beats. Once, the pulse shook the earth ten times in a breath. Now, days pass between thuds.\n\nTorvund is hardening. The living spirit of the earth is turning into dead basalt. When the final beat ceases, the world will freeze into silent rock.`
  },

  // ==========================================
  // SKYREAVERS (WIND) - 3 Pages
  // ==========================================
  lore_sky_1: {
    id: 'lore_sky_1',
    number: 10,
    title: 'The Breath Before Form',
    clan: 'Skyreavers',
    clanId: 'skyreavers',
    clanColor: '#88c9bb',
    topicId: 'the_genesis',
    claim: 'Zephyra the Unchained tore open space with her wings; without atmosphere, all fire and water are dead illusions.',
    text: `What feeds the flame? Air. What stirs the ocean tides? The tempest. Zephyra blew the first gale across the void, carving canyons in the ether.\n\nEarthbound clans worship heavy dirt and stagnant ponds, blind to the truth that motion is the only reality. Where the wind ceases, time itself rots.`
  },
  lore_sky_2: {
    id: 'lore_sky_2',
    number: 11,
    title: 'The Great Liberation',
    clan: 'Skyreavers',
    clanId: 'skyreavers',
    clanColor: '#88c9bb',
    topicId: 'the_shattering',
    claim: 'Zephyra shattered the First Eye with a hurricane gust to free mortals from celestial tyranny.',
    text: `The First Eye was a watchtower—a cosmic cage whose unblinking stare held humanity paralyzed under divine scrutiny. Zephyra screamed a tempest of gale-force winds, blasting the crystalline lens into five free-wheeling shards.\n\nIt was not a tragedy; it was the birth of free will. We celebrate the shattering as our independence day!`
  },
  lore_sky_3: {
    id: 'lore_sky_3',
    number: 12,
    title: 'The Thinning Gale',
    clan: 'Skyreavers',
    clanId: 'skyreavers',
    clanColor: '#88c9bb',
    topicId: 'the_nature_of_gods',
    claim: 'The high winds are losing their altitude; Zephyra is bleeding her breath into the void.',
    text: `Our glider pilots feel it in the mountain thermals: the sky is losing its lift. Year by year, our flyers cannot soar as high before plummeting toward the earth.\n\nZephyra’s divine lungs are punctured. The great draft that lifts our floating plateaus is dissipating into the black heavens.`
  },

  // ==========================================
  // VEILBORN (SPIRIT) - 3 Pages
  // ==========================================
  lore_veil_1: {
    id: 'lore_veil_1',
    number: 13,
    title: 'The Illusion of Flesh',
    clan: 'Veilborn',
    clanId: 'veilborn',
    clanColor: '#9368b7',
    topicId: 'the_genesis',
    claim: 'The physical world is an ephemeral echo; Oruun the Unseen wove creation from shadow and spirit.',
    text: `The four physical clans cling to mountains, seas, clouds, and flames like infants clutching pebbles. They do not realize that material substance is merely condensed thought—a ghost dreaming of stone.\n\nOruun stood behind the fabric of reality and cast the shadow that mortals call the cosmos. When you close your physical eyes, you see the real world.`
  },
  lore_veil_2: {
    id: 'lore_veil_2',
    number: 14,
    title: 'The Crack in the Mirror',
    clan: 'Veilborn',
    clanId: 'veilborn',
    clanColor: '#9368b7',
    topicId: 'the_shattering',
    claim: 'The First Eye shattered when it looked into its own soul and realized its divine solitude.',
    text: `Neither war, nor sleep, nor wind cracked the lens. The First Eye was a solitary being that possessed only one mirror: its own reflection in the spiritual void.\n\nWhen it gazed upon itself and comprehended that it was completely alone in the universe, its grief cracked the crystal into five screaming pieces. Its agony became our five gods.`
  },
  lore_veil_3: {
    id: 'lore_veil_3',
    number: 15,
    title: 'The Spectral Fading',
    clan: 'Veilborn',
    clanId: 'veilborn',
    clanColor: '#9368b7',
    topicId: 'the_nature_of_gods',
    claim: 'The gods are dying fragments of a single transcendent entity that cannot sustain five divided wills.',
    text: `The spirits whisper the dreadful truth that none dare utter in village halls: our five gods are not rivals, nor are they five. They are the hemorrhaging organs of one dying being.\n\nSeparated, none can survive. The war between the clans only bleeds the remaining lifeforce faster. In two generations, the silence of the void will swallow all.`
  },

  // ==========================================
  // MYTH PAGES OF THE GODS - 5 Pages
  // ==========================================
  myth_first_eye: {
    id: 'myth_first_eye',
    number: 16,
    title: 'Mythos: The Singularity of the Eye',
    clan: 'Ancient Myth',
    clanId: 'myth',
    clanColor: '#38bdf8',
    topicId: 'the_shattering',
    claim: 'The Order of the Open Eye claims the five elemental stones must remain separate to maintain balance.',
    text: `In the central sanctum of the Order, a gilded inscription proclaims: "The One became Five so the world might have variety; should the Five become One, diversity shall perish in uniform light."\n\nYet old texts etched in elder runes tell another story: that the Order orchestrated the clan disputes precisely so that no mortal could ever reassemble the First Eye and witness the terrifying frailty of the deities.`
  },
  lore_myth_dying_god: {
    id: 'lore_myth_dying_god',
    number: 17,
    title: 'Mythos: The Severed Being',
    clan: 'Ancient Myth',
    clanId: 'myth',
    clanColor: '#eab308',
    topicId: 'the_nature_of_gods',
    claim: 'The ancient primordial entity was butchered, and each god is an amputated limb acting as an independent ruler.',
    text: `Ignareth is its heart. Nerivael is its mind. Torvund is its petrified bones. Zephyra is its escaping breath. Oruun is its wandering ghost.\n\nThey war against each other like phantom limbs twitching on a battlefield, unable to recognize that every wound they inflict upon a rival clan is a dagger thrust into their own shared chest.`
  },
  myth_stag_king: {
    id: 'myth_stag_king',
    number: 18,
    title: 'Mythos: The White Stag\'s Oath',
    clan: 'Animal Kingdom',
    clanId: 'beasts',
    clanColor: '#10b981',
    topicId: 'the_beasts_memory',
    claim: 'The White Stag King and ancient beasts preserve the uncorrupted memory of what humans chose to erase.',
    text: `Before humans carved stone into idols and built forges to make swords, they swore a blood-oath to the White Stag King beneath the Primordial Tree: "When the sky-mirror fractures, look to the beasts, for they carry no ink and tell no lies."\n\nHumans rewrote their histories thirty times over to justify their petty border skirmishes. The beasts carry the original truth in their marrow.`
  },
  myth_five_shards: {
    id: 'myth_five_shards',
    number: 19,
    title: 'Mythos: The Living Fragment',
    clan: 'Ancient Myth',
    clanId: 'myth',
    clanColor: '#06b6d4',
    topicId: 'the_nature_of_gods',
    claim: 'A sixth fragment remained behind—a living spark that would reincarnate into a mortal eye.',
    text: `When the five great stones were torn away, the core of the First Eye did not die. It sank into the mortal gene-pool, a dormant seed waiting across centuries of clan warfare.\n\nHe who is born with the luminous eye will possess the sight to unmask lies, reveal the hidden paths of spirits, and decide whether to bind the fragments or let the gods die in peace.`
  },
  myth_order_conspiracy: {
    id: 'myth_order_conspiracy',
    number: 20,
    title: 'Mythos: The Grand Deception',
    clan: 'Ancient Myth',
    clanId: 'myth',
    clanColor: '#f43f5e',
    topicId: 'the_shattering',
    claim: 'The Order of the Open Eye secretly created the religious schisms to protect their own monopoly on power.',
    text: `Why does each clan possess a holy book that contradicts all others? Because the first scribes of the Order traveled to every region, dictating mutually exclusive doctrines to each village elder.\n\nA unified people would look to the heavens and realize the gods are expiring. A divided people will spend five centuries looking at their neighbors' throats.`
  }
};
