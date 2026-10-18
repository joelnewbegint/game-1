/**
 * Aethrava - Items & Artifacts Data Definition
 */

export const ELEMENTAL_STONES = {
  embercrest: {
    id: 'stone_pyres',
    clanId: 'embercrest',
    name: 'Stone of Pyres',
    element: 'Fire',
    god: 'Ignareth the Burning Mother',
    color: '#ff5c2b',
    description: 'A radiant shard pulsating with eternal solar heat. One of the five fragments of the First Eye.'
  },
  tidewrought: {
    id: 'stone_abyss',
    clanId: 'tidewrought',
    name: 'Stone of Abyssal Depth',
    element: 'Water',
    god: 'Nerivael the Deep Mind',
    color: '#1d92bd',
    description: 'Cold and oceanic, whispering with tides of memory. One of the five fragments of the First Eye.'
  },
  stonebound: {
    id: 'stone_bedrock',
    clanId: 'stonebound',
    name: 'Stone of Bedrock',
    element: 'Earth',
    god: 'Torvund the Sleeping Mountain',
    color: '#7a8253',
    description: 'Immensely heavy stone that pulses like a deep geologic heartbeat. One of the five fragments of the First Eye.'
  },
  skyreavers: {
    id: 'stone_tempests',
    clanId: 'skyreavers',
    name: 'Stone of Tempests',
    element: 'Wind',
    god: 'Zephyra the Unchained',
    color: '#88c9bb',
    description: 'Virtually weightless shard surrounded by eddying currents of air. One of the five fragments of the First Eye.'
  },
  veilborn: {
    id: 'stone_echoes',
    clanId: 'veilborn',
    name: 'Stone of Echoes',
    element: 'Spirit',
    god: 'Oruun the Unseen',
    color: '#9368b7',
    description: 'Translucent violet crystal shifting between reality and the spectral veil. One of the five fragments of the First Eye.'
  }
};

export const ITEMS_DATABASE = {
  ancient_fire_fragment: {
    id: 'ancient_fire_fragment',
    name: 'Ancient Fire Fragment',
    type: 'key_item',
    icon: '🔥',
    color: '#ff7733',
    description: 'A warm, glowing ember-shard recovered near the Arch of the Ancients.'
  },
  cinder_pendant: {
    id: 'cinder_pendant',
    name: 'Amulet of Cinderfall',
    type: 'key_item',
    icon: '📿',
    color: '#e67e22',
    description: 'An engraved talisman gifted by the Embercrest lorekeepers as a sign of goodwill.'
  },
  igneous_ore: {
    id: 'igneous_ore',
    name: 'Raw Igneous Ore',
    type: 'material',
    icon: '🪨',
    color: '#8c3a1b',
    description: 'Pristine volcanic ore harvested from the molten chasm, required by Forgemaster Kael.'
  },
  temple_sun_key: {
    id: 'temple_sun_key',
    name: 'Obsidian Sun Key',
    type: 'key_item',
    icon: '🗝️',
    color: '#f59e0b',
    description: 'Forged in Cinderfall\'s sacred crucible. Binds the sun-lock of Ignareth\'s Temple.'
  },
  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Radiant Phoenix Feather',
    type: 'relic',
    icon: '🪶',
    color: '#ff4500',
    description: 'A feather glowing with everlasting warmth, offered willingly by the sacred Phoenix of Solar Aerie.'
  },
  lion_mane_talisman: {
    id: 'lion_mane_talisman',
    name: 'Talisman of the Pride Crag',
    type: 'relic',
    icon: '🦁',
    color: '#eab308',
    description: 'Blessed by the Sacred Fire Lion. Radiates an aura of primal courage.'
  },
  temple_fire_prism: {
    id: 'temple_fire_prism',
    name: 'Pyre Focus Prism',
    type: 'puzzle_item',
    icon: '💎',
    color: '#ef4444',
    description: 'A polished igneous crystal that refracts sunlight to align the Caldera gate.'
  }
};
