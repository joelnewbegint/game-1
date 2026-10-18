import * as THREE from 'three';
import { Region } from './Region.js';
import tidewroughtData from '../../data/regions/tidewrought.json' with { type: 'json' };
import { NPC } from '../NPC.js';
import { LorePagePickup } from '../LorePagePickup.js';
import { SluicePuzzle } from '../../puzzles/SluicePuzzle.js';
import { SunkenPathPuzzle } from '../../puzzles/SunkenPathPuzzle.js';
import { TidalReflectionPuzzle } from '../../puzzles/TidalReflectionPuzzle.js';

/**
 * Aethrava - Tidewrought Region Module (Water Clan)
 * Complete implementation of the rugged coast of Thalassport,
 * the Sacred Beasts (Abyssal Whale & Great Sea Serpent),
 * the 3 Water Puzzles, the Fast-Travel Waystone, and Nerivael's Sunken Sanctuary.
 */
export class TidewroughtRegion extends Region {
  constructor(scene, engine, world, gameState, audio, eyeVision, cinematicManager) {
    super(scene, engine, world, gameState, audio, eyeVision, tidewroughtData);
    this.cinematicManager = cinematicManager;

    this.materials = this.createMaterials();
    this.init();
  }

  createMaterials() {
    return {
      wetStone: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.35,
        metalness: 0.2
      }),
      seaSand: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.95
      }),
      ruinMarble: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.7
      }),
      shipWood: new THREE.MeshStandardMaterial({
        color: 0x331e11,
        roughness: 0.9
      }),
      brassTrim: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        metalness: 0.85,
        roughness: 0.25
      }),
      oceanWater: new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0369a1,
        emissiveIntensity: 0.9,
        roughness: 0.1,
        metalness: 0.3,
        transparent: true,
        opacity: 0.85
      }),
      abyssalGlow: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x00f0ff,
        emissiveIntensity: 3.5,
        roughness: 0.2
      }),
      whaleSkin: new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.6,
        metalness: 0.1
      }),
      serpentScale: new THREE.MeshStandardMaterial({
        color: 0x0d9488,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.4
      })
    };
  }

  // ==============================================================
  // 1. TERRAIN & GEOGRAPHY (Sea Cliffs, Tidal Pools, Connecting Route)
  // ==============================================================
  buildTerrain() {
    // A. Coastal Sea Cliffs bordering Thalassport
    const cliffCoords = [
      // Northern sea ridge
      { x: 105, z: 25, s: 7, h: 10 },
      { x: 95, z: 45, s: 8, h: 14 },
      { x: 145, z: 30, s: 8, h: 12 },
      { x: 155, z: 50, s: 9, h: 16 },
      // Eastern oceanic headland
      { x: 175, z: -10, s: 9, h: 18 },
      { x: 180, z: 20, s: 10, h: 20 },
      // Sanctuary Caldera Ring
      { x: 100, z: 150, s: 10, h: 22 },
      { x: 125, z: 180, s: 12, h: 25 },
      { x: 150, z: 150, s: 10, h: 22 }
    ];

    const cliffGeo = new THREE.ConeGeometry(5.0, 12.0, 6);
    cliffCoords.forEach(c => {
      const y = this.world.getGroundHeight(c.x, c.z);
      const cliff = new THREE.Mesh(cliffGeo, this.materials.wetStone);
      cliff.position.set(c.x, y + c.h * 0.4, c.z);
      cliff.scale.set(c.s * 0.3, c.h * 0.1, c.s * 0.3);
      cliff.rotation.y = Math.random() * Math.PI;
      cliff.castShadow = true;
      cliff.receiveShadow = true;
      this.regionGroup.add(cliff);
      this.collidables.push(cliff);
    });

    // B. Coastal Travel Route (Stone cairns leading from starting dais to Thalassport)
    const trailMarkers = [
      { x: 25, z: 0 },
      { x: 45, z: -5 },
      { x: 68, z: -12 },
      { x: 90, z: -18 }
    ];

    trailMarkers.forEach((m, idx) => {
      const y = this.world.getGroundHeight(m.x, m.z);
      const cairn = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.2, 6), this.materials.wetStone);
      cairn.position.set(m.x, y + 0.6, m.z);
      this.regionGroup.add(cairn);

      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), this.materials.abyssalGlow);
      lantern.position.set(m.x, y + 1.3, m.z);
      this.regionGroup.add(lantern);

      const light = new THREE.PointLight(0x38bdf8, 1.0, 6.0);
      light.position.set(m.x, y + 1.4, m.z);
      this.regionGroup.add(light);
    });

    // C. Tidal Pool Water Surfaces in harbor shallows
    const tidePoolGeo = new THREE.CircleGeometry(4.5, 12);
    tidePoolGeo.rotateX(-Math.PI / 2);
    const pool = new THREE.Mesh(tidePoolGeo, this.materials.oceanWater);
    pool.position.set(120, this.world.getGroundHeight(120, -10) + 0.05, -10);
    this.regionGroup.add(pool);
  }

  // ==============================================================
  // 2. LANDMARKS & SETTLEMENTS (Thalassport, Docks, Waystone, Temple)
  // ==============================================================
  buildLandmarks() {
    // A. Captain Marina's Quarterdeck & Pier (x: 110, z: -35)
    this.buildQuarterdeck(110, -35);

    // B. Scholar Sylas's Drowned Archives (x: 130, z: -25)
    this.buildArchiveHut(130, -25);

    // C. Sea-Seer Vael's Tidepool Dais (x: 120, z: -10)
    this.buildTideDais(120, -10);

    // D. Corvo's Smuggler Cove (x: 95, z: 10)
    this.buildSmugglerCove(95, 10);

    // E. Tidecaller Mira's Coral Altar (x: 140, z: 5)
    this.buildCoralAltar(140, 5);

    // F. Fast-Travel Waystone Portal (x: 105, z: -18)
    this.buildWaystone(105, -18);

    // G. Sunken Sanctuary of Nerivael the Deep Mind (x: 125, z: 160)
    this.buildNerivaelSanctuary(125, 160);
  }

  buildQuarterdeck(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const deck = new THREE.Group();
    deck.position.set(x, y, z);

    // Wooden Pier Platform on pilings
    const platform = new THREE.Mesh(new THREE.BoxGeometry(10, 1.0, 14), this.materials.shipWood);
    platform.position.y = 1.0;
    platform.castShadow = true;
    platform.receiveShadow = true;
    deck.add(platform);

    // Ship Mast & Rigging
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 9.0, 8), this.materials.shipWood);
    mast.position.set(0, 5.0, 0);
    deck.add(mast);

    const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6.0, 6), this.materials.shipWood);
    yard.rotation.z = Math.PI / 2;
    yard.position.set(0, 7.5, 0);
    deck.add(yard);

    // Ship wheel on deck
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.1, 8, 16), this.materials.brassTrim);
    wheel.position.set(0, 2.2, 4.5);
    deck.add(wheel);

    this.regionGroup.add(deck);
    this.collidables.push(platform, mast);
  }

  buildArchiveHut(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);

    // Weathered timber structure
    const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), this.materials.wetStone);
    base.position.y = 0.4;
    hut.add(base);

    const body = new THREE.Mesh(new THREE.BoxGeometry(6.2, 3.4, 6.2), this.materials.shipWood);
    body.position.y = 2.1;
    body.castShadow = true;
    hut.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.0, 2.2, 4), this.materials.wetStone);
    roof.position.y = 4.8;
    roof.rotation.y = Math.PI / 4;
    hut.add(roof);

    this.regionGroup.add(hut);
    this.collidables.push(base, body);
  }

  buildTideDais(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const dais = new THREE.Group();
    dais.position.set(x, y, z);

    const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 4.5, 0.6, 16), this.materials.ruinMarble);
    platform.position.y = 0.3;
    platform.receiveShadow = true;
    dais.add(platform);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.12, 6, 24), this.materials.abyssalGlow);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.62;
    dais.add(ring);

    this.regionGroup.add(dais);
    this.collidables.push(platform);
  }

  buildSmugglerCove(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const cove = new THREE.Group();
    cove.position.set(x, y, z);

    // Overhanging sea-cave basalt arch
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3.5, 1.2, 6, 12, Math.PI), this.materials.wetStone);
    arch.position.set(0, 1.8, 0);
    cove.add(arch);

    // Contraband crates and barrels
    for (let i = 0; i < 4; i++) {
      const crate = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), this.materials.shipWood);
      crate.position.set((i - 1.5) * 0.9, 0.4, (i % 2) * 0.5);
      cove.add(crate);
    }

    this.regionGroup.add(cove);
  }

  buildCoralAltar(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const altar = new THREE.Group();
    altar.position.set(x, y, z);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 1.0, 8), this.materials.ruinMarble);
    base.position.y = 0.5;
    altar.add(base);

    const coralCore = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 0), this.materials.serpentScale);
    coralCore.position.y = 1.6;
    altar.add(coralCore);

    this.regionGroup.add(altar);
    this.collidables.push(base);
  }

  buildWaystone(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const waystone = new THREE.Group();
    waystone.position.set(x, y, z);

    // Ancient Waystone Spire
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 0.8, 8), this.materials.ruinMarble);
    plinth.position.y = 0.4;
    plinth.castShadow = true;
    waystone.add(plinth);

    const obelisk = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.8, 0.8), this.materials.ruinMarble);
    obelisk.position.y = 2.4;
    obelisk.castShadow = true;
    waystone.add(obelisk);

    // Glowing Waystone Core Pearl
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), this.materials.abyssalGlow);
    core.position.y = 4.6;
    waystone.add(core);

    const light = new THREE.PointLight(0x38bdf8, 2.0, 8.0);
    light.position.y = 4.6;
    waystone.add(light);

    this.regionGroup.add(waystone);
    this.collidables.push(plinth, obelisk);

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        core.rotation.y += delta * 1.5;
        core.position.y = 4.6 + Math.sin(elapsed * 2.0) * 0.15;
      }
    });

    // Interactive Fast Travel Trigger
    const waystoneInteractable = {
      name: 'Thalassport Waystone',
      position: new THREE.Vector3(x, y + 1.5, z),
      interactionRadius: 3.5,
      getPromptText: () => 'Fast Travel to Cinderfall / Origin',
      getInteractionPosition: () => new THREE.Vector3(x, y + 1.5, z),
      interact: (player) => {
        this.openFastTravelModal(player);
      }
    };
    this.registerInteractable(waystoneInteractable);
  }

  openFastTravelModal(player) {
    // Quick fast-travel destination switch
    const choices = [
      { name: 'Cinderfall Village (Embercrest)', pos: { x: 0, z: -10 } },
      { name: 'Ancient Dais (Starting Shrine)', pos: { x: 0, z: 0 } },
      { name: 'Thalassport Harbor (Tidewrought)', pos: { x: 105, z: -16 } }
    ];

    const currentDest = player.position.x > 50 ? choices[0] : choices[2];

    player.position.set(currentDest.pos.x, this.world.getGroundHeight(currentDest.pos.x, currentDest.pos.z), currentDest.pos.z);
    player.velocity.set(0, 0, 0);

    if (this.audio) this.audio.playChime('relic');

    this.gameState.emit('notification', {
      title: 'Fast Travel Activated',
      message: `Traveled via Ancient Waystone to ${currentDest.name}!`,
      type: 'quest'
    });
  }

  buildNerivaelSanctuary(x, z) {
    const y = this.world.getGroundHeight(x, z);
    this.sanctuaryGroup = new THREE.Group();
    this.sanctuaryGroup.position.set(x, y, z);

    // A. Sunken Sanctuary Amphitheater Floor
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(14, 15, 1.0, 24), this.materials.wetStone);
    floor.position.y = 0.5;
    floor.receiveShadow = true;
    this.sanctuaryGroup.add(floor);

    // Surrounding Drowned Marble Columns
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 12.5;
      const pz = Math.sin(angle) * 12.5;

      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 7.0, 8), this.materials.ruinMarble);
      col.position.set(px, 3.5, pz);
      col.castShadow = true;
      this.sanctuaryGroup.add(col);

      const seam = new THREE.Mesh(new THREE.BoxGeometry(0.18, 5.0, 0.18), this.materials.abyssalGlow);
      seam.position.set(px * 0.95, 3.5, pz * 0.95);
      this.sanctuaryGroup.add(seam);
    }

    // B. Colossal Avatar of Nerivael the Deep Mind
    this.nerivaelAvatar = new THREE.Group();
    this.nerivaelAvatar.position.set(0, 0.5, 4.5);

    // Pedestal
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.5, 2.0, 12), this.materials.wetStone);
    ped.position.y = 1.0;
    this.nerivaelAvatar.add(ped);

    // Oceanic Torso of the Deep Mind
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.9, 3.5, 10), this.materials.oceanWater);
    torso.position.y = 3.7;
    this.nerivaelAvatar.add(torso);

    // Weeping Celestial Crown & Halo
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.25, 8, 24), this.materials.abyssalGlow);
    halo.position.set(0, 6.2, 0);
    halo.rotation.x = Math.PI / 2;
    this.nerivaelAvatar.add(halo);

    this.nerivaelLight = new THREE.PointLight(0x0284c7, 4.5, 25.0);
    this.nerivaelLight.position.set(0, 5.5, 0);
    this.nerivaelAvatar.add(this.nerivaelLight);

    // Water Stone Altar (Stone of Abyssal Depth)
    this.altarStone = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.2, 8), this.materials.ruinMarble);
    this.altarStone.position.set(0, 1.1, -2.5);
    this.sanctuaryGroup.add(this.altarStone);

    // Floating Stone of Abyssal Depth
    const stoneGeo = new THREE.OctahedronGeometry(0.45);
    this.waterStoneMesh = new THREE.Mesh(stoneGeo, this.materials.abyssalGlow);
    this.waterStoneMesh.position.set(0, 2.2, -2.5);
    this.sanctuaryGroup.add(this.waterStoneMesh);

    this.sanctuaryGroup.add(this.nerivaelAvatar);
    this.regionGroup.add(this.sanctuaryGroup);
    this.collidables.push(floor, ped, this.altarStone);

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        if (this.nerivaelLight) {
          this.nerivaelLight.intensity = 3.8 + Math.sin(elapsed * 2.8) * 1.0;
        }
        if (this.waterStoneMesh) {
          this.waterStoneMesh.rotation.y += delta * 1.2;
          this.waterStoneMesh.position.y = 2.2 + Math.sin(elapsed * 2.2) * 0.12;
        }
      }
    });

    // Shrine Interaction Trigger
    const shrineInteractable = {
      name: 'Nerivael the Deep Mind',
      position: new THREE.Vector3(x, y + 1.5, z - 2.5),
      interactionRadius: 4.5,
      getPromptText: () => {
        return this.gameState.inventory.elementalStones.tidewrought
          ? 'Commune with the Deep Mind'
          : 'Witness Nerivael & Claim Water Stone';
      },
      getInteractionPosition: () => new THREE.Vector3(x, y + 1.5, z - 2.5),
      interact: (player, thirdPersonCamera) => {
        if (this.cinematicManager) {
          this.cinematicManager.playNerivaelCinematic(player, thirdPersonCamera, {
            position: new THREE.Vector3(x, y, z)
          });
        }
      }
    };
    this.registerInteractable(shrineInteractable);
  }

  // ==============================================================
  // 3. VILLAGE NPCS (Marina, Sylas, Vael, Corvo, Mira)
  // ==============================================================
  spawnNPCs() {
    // 1. Captain Marina (at Quarterdeck: x: 110, z: -30)
    this.marinaNPC = new NPC(this.scene, this.world, {
      id: 'marina',
      name: 'Captain Marina',
      clanId: 'tidewrought',
      dialogueTreeId: 'marina_dialogue',
      x: 110,
      z: -30,
      radius: 3.5
    });
    this.npcs.push(this.marinaNPC);
    this.registerInteractable(this.marinaNPC);

    // 2. Scholar Sylas (at Archive Hut: x: 128, z: -22)
    this.sylasNPC = new NPC(this.scene, this.world, {
      id: 'sylas',
      name: 'Scholar Sylas',
      clanId: 'tidewrought',
      dialogueTreeId: 'sylas_dialogue',
      x: 128,
      z: -22,
      radius: 3.5
    });
    this.npcs.push(this.sylasNPC);
    this.registerInteractable(this.sylasNPC);

    // 3. Sea-Seer Vael (at Tide Dais: x: 120, z: -8)
    this.vaelNPC = new NPC(this.scene, this.world, {
      id: 'vael',
      name: 'Sea-Seer Vael',
      clanId: 'tidewrought',
      dialogueTreeId: 'vael_dialogue',
      x: 120,
      z: -8,
      radius: 3.5
    });
    this.npcs.push(this.vaelNPC);
    this.registerInteractable(this.vaelNPC);

    // 4. Corvo the Smuggler (in Smuggler Cove: x: 95, z: 12)
    this.corvoNPC = new NPC(this.scene, this.world, {
      id: 'corvo',
      name: 'Corvo the Smuggler',
      clanId: 'tidewrought',
      dialogueTreeId: 'corvo_dialogue',
      x: 95,
      z: 12,
      radius: 3.5
    });
    this.npcs.push(this.corvoNPC);
    this.registerInteractable(this.corvoNPC);

    // 5. Tidecaller Mira (at Coral Altar: x: 138, z: 5)
    this.miraNPC = new NPC(this.scene, this.world, {
      id: 'mira',
      name: 'Tidecaller Mira',
      clanId: 'tidewrought',
      dialogueTreeId: 'mira_dialogue',
      x: 138,
      z: 5,
      radius: 3.0
    });
    this.npcs.push(this.miraNPC);
    this.registerInteractable(this.miraNPC);
  }

  // ==============================================================
  // 4. SACRED BEASTS & WILDLIFE (Whale, Serpent, Fauna)
  // ==============================================================
  spawnWildlife() {
    // A. Sacred Abyssal Whale at Whale Song Shoals (x: 165, z: 15)
    this.buildSacredWhale(165, 15);

    // B. Great Sea Serpent at Serpent's Trench (x: 80, z: 35)
    this.buildSeaSerpent(80, 35);

    // C. Ambient Fauna: Shore Crabs & Sea Gulls
    this.buildAmbientFauna();
  }

  buildSacredWhale(x, z) {
    const y = this.world.getGroundHeight(x, z) - 0.5;
    const whaleGroup = new THREE.Group();
    whaleGroup.position.set(x, y, z);

    // Surfacing Whale Back & Head
    const bodyGeo = new THREE.SphereGeometry(3.5, 16, 12);
    bodyGeo.scale(1.2, 0.6, 2.2);
    const body = new THREE.Mesh(bodyGeo, this.materials.whaleSkin);
    body.position.y = 0.5;
    body.castShadow = true;
    whaleGroup.add(body);

    // Tail Fluke
    const flukeGeo = new THREE.BoxGeometry(4.0, 0.2, 1.2);
    this.whaleFluke = new THREE.Mesh(flukeGeo, this.materials.whaleSkin);
    this.whaleFluke.position.set(0, 1.2, -6.0);
    whaleGroup.add(this.whaleFluke);

    // Blowhole Water Spout
    const spoutGeo = new THREE.CylinderGeometry(0.15, 0.6, 3.5, 8);
    const spout = new THREE.Mesh(spoutGeo, this.materials.oceanWater);
    spout.position.set(0, 3.2, 1.5);
    whaleGroup.add(spout);

    // Glowing whale bioluminescence light
    const whaleLight = new THREE.PointLight(0x38bdf8, 3.0, 18.0);
    whaleLight.position.set(0, 2.5, 0);
    whaleGroup.add(whaleLight);

    this.regionGroup.add(whaleGroup);
    this.collidables.push(body);

    const whaleInteractable = {
      name: 'Sacred Abyssal Whale',
      position: new THREE.Vector3(x, y + 2.0, z),
      interactionRadius: 6.0,
      isBlessed: false,
      getPromptText: () => this.whaleInteractable.isBlessed ? 'Commune with the Great Whale' : 'Receive Whale\'s Blessing',
      getInteractionPosition: () => new THREE.Vector3(x, y + 2.0, z),
      interact: () => {
        if (!this.whaleInteractable.isBlessed) {
          this.whaleInteractable.isBlessed = true;
          this.gameState.addItem('whale_ambergris');
          if (this.audio) this.audio.playChime('relic');

          if (this.gameState.getQuestState('q_abyssal_beasts') === 'active') {
            this.gameState.completeObjective('q_abyssal_beasts', 'obj_commune_whale');
          }

          this.gameState.emit('notification', {
            title: 'Whale\'s Blessing Received',
            message: 'The Abyssal Whale lets out a resonant song, bestowing phosphorescent Ambergris!',
            type: 'trust-positive'
          });
        } else {
          this.gameState.emit('notification', {
            title: 'Sacred Abyssal Whale',
            message: 'The giant leviathan rolls in the surf with deep, calming acoustic harmonics.',
            type: 'neutral'
          });
        }
      }
    };
    this.registerInteractable(whaleInteractable);
    this.whaleInteractable = whaleInteractable;

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        whaleGroup.position.y = y + Math.sin(elapsed * 1.5) * 0.3;
        this.whaleFluke.rotation.x = Math.sin(elapsed * 2.0) * 0.2;
        spout.scale.y = 1.0 + Math.sin(elapsed * 4.0) * 0.3;
      }
    });
  }

  buildSeaSerpent(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const serpentGroup = new THREE.Group();
    serpentGroup.position.set(x, y, z);

    // Coiled Sea Serpent segments
    this.serpentSegments = [];
    const segGeo = new THREE.CylinderGeometry(0.7, 0.8, 1.8, 8);
    for (let i = 0; i < 5; i++) {
      const seg = new THREE.Mesh(segGeo, this.materials.serpentScale);
      seg.position.set(Math.sin(i * 0.8) * 1.5, 1.0 + i * 0.6, (i - 2) * 1.2);
      seg.castShadow = true;
      serpentGroup.add(seg);
      this.serpentSegments.push(seg);
    }

    // Serpent Head with glowing eyes
    const headGeo = new THREE.ConeGeometry(0.8, 2.0, 6);
    headGeo.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, this.materials.serpentScale);
    head.position.set(0, 4.2, 2.2);
    serpentGroup.add(head);

    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
    eye1.position.set(-0.35, 4.4, 2.8);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), eyeMat);
    eye2.position.set(0.35, 4.4, 2.8);
    serpentGroup.add(eye1, eye2);

    const serpentLight = new THREE.PointLight(0x0d9488, 2.5, 12.0);
    serpentLight.position.set(0, 4.0, 1.5);
    serpentGroup.add(serpentLight);

    this.regionGroup.add(serpentGroup);

    const serpentInteractable = {
      name: 'Great Sea Serpent',
      position: new THREE.Vector3(x, y + 2.0, z),
      interactionRadius: 5.5,
      isScaleClaimed: false,
      getPromptText: () => this.serpentInteractable.isScaleClaimed ? 'Commune with the Great Serpent' : 'Receive Serpent\'s Blessing',
      getInteractionPosition: () => new THREE.Vector3(x, y + 2.0, z),
      interact: () => {
        if (!this.serpentInteractable.isScaleClaimed) {
          this.serpentInteractable.isScaleClaimed = true;
          this.gameState.addItem('serpent_scale_talisman');
          if (this.audio) this.audio.playChime('relic');

          if (this.gameState.getQuestState('q_abyssal_beasts') === 'active') {
            this.gameState.completeObjective('q_abyssal_beasts', 'obj_commune_serpent');
          }

          this.gameState.emit('notification', {
            title: 'Great Serpent\'s Blessing Received',
            message: 'The Great Serpent uncoils smoothly, yielding an iridescent emerald scale!',
            type: 'trust-positive'
          });
        } else {
          this.gameState.emit('notification', {
            title: 'Great Sea Serpent',
            message: 'The Sea Serpent hisses softly with ancient depth currents.',
            type: 'neutral'
          });
        }
      }
    };
    this.registerInteractable(serpentInteractable);
    this.serpentInteractable = serpentInteractable;

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        this.serpentSegments.forEach((seg, idx) => {
          seg.position.x = Math.sin(elapsed * 2.0 + idx * 0.6) * 1.5;
          seg.rotation.y = Math.cos(elapsed * 1.5 + idx * 0.5) * 0.3;
        });
        head.position.y = 4.2 + Math.sin(elapsed * 2.5) * 0.2;
      }
    });
  }

  buildAmbientFauna() {
    // 1. Shore Crabs scuttling on the wet sand
    this.crabs = [];
    const crabGeo = new THREE.BoxGeometry(0.35, 0.15, 0.45);
    for (let i = 0; i < 4; i++) {
      const crab = new THREE.Mesh(crabGeo, this.materials.brassTrim);
      const angle = (i / 4) * Math.PI * 2;
      crab.position.set(118 + Math.cos(angle) * 4, 0.15, -18 + Math.sin(angle) * 4);
      this.regionGroup.add(crab);
      this.crabs.push({ mesh: crab, basePos: crab.position.clone(), phase: i });
    }

    // 2. Coastal Gulls circling on sea updrafts
    this.gulls = [];
    const gullGeo = new THREE.ConeGeometry(0.3, 1.0, 4);
    gullGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      const gull = new THREE.Mesh(gullGeo, this.materials.ruinMarble);
      gull.position.set(125, 26 + i * 3, -10);
      this.regionGroup.add(gull);
      this.gulls.push({ mesh: gull, radius: 30 + i * 8, speed: 0.7 + i * 0.2, height: 26 + i * 3 });
    }

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        this.crabs.forEach(c => {
          c.mesh.position.x = c.basePos.x + Math.sin(elapsed * 3.0 + c.phase) * 1.0;
          c.mesh.position.z = c.basePos.z + Math.cos(elapsed * 3.0 + c.phase) * 1.0;
        });

        this.gulls.forEach((g, idx) => {
          const a = elapsed * g.speed + idx * 2.0;
          g.mesh.position.x = 125 + Math.cos(a) * g.radius;
          g.mesh.position.z = -10 + Math.sin(a) * g.radius;
          g.mesh.position.y = g.height + Math.sin(elapsed * 1.5 + idx) * 1.2;
          g.mesh.rotation.y = -a + Math.PI / 2;
        });
      }
    });
  }

  // ==============================================================
  // 5. REGIONAL PUZZLES (Sluice, Sunken Path, Tidal Reflection)
  // ==============================================================
  spawnPuzzles() {
    // 1. Sluice Puzzle at Dam (x: 138, z: -12)
    this.sluicePuzzle = new SluicePuzzle(this.scene, this.world, this.gameState, this.audio);
    this.puzzles.sluice = this.sluicePuzzle;

    const sluiceInteractable = {
      name: 'Tidal Sluice Controls',
      position: this.sluicePuzzle.position,
      interactionRadius: 3.2,
      getPromptText: () => this.sluicePuzzle.getPromptText(),
      getInteractionPosition: () => this.sluicePuzzle.getInteractionPosition(),
      interact: () => {
        this.sluicePuzzle.open();
      }
    };
    this.registerInteractable(sluiceInteractable);

    // 2. Sunken Path Puzzle at Drowned Causeway (x: 125, z: 62)
    this.sunkenPuzzle = new SunkenPathPuzzle(this.scene, this.world, this.gameState, this.audio);
    this.puzzles.sunkenPath = this.sunkenPuzzle;

    if (this.eyeVision) {
      this.eyeVision.register(this.sunkenPuzzle);
    }

    // 3. Tidal Reflection Puzzle (x: 125, z: 105)
    this.reflectionPuzzle = new TidalReflectionPuzzle(
      this.scene,
      this.world,
      this.gameState,
      this.audio,
      () => {
        this.onAbyssalVaultUnlocked();
      }
    );
    this.puzzles.reflection = this.reflectionPuzzle;

    this.reflectionPuzzle.mirrorMeshes.forEach((mm, idx) => {
      const interactable = {
        name: `Tidal Pearl Mirror ${idx + 1}`,
        position: mm.group.position,
        interactionRadius: 2.8,
        getPromptText: () => `Rotate Pearl Mirror [${mm.data.angle}°]`,
        getInteractionPosition: () => new THREE.Vector3(mm.data.x, this.world.getGroundHeight(mm.data.x, mm.data.z) + 1.8, mm.data.z),
        interact: () => {
          this.reflectionPuzzle.rotateMirror(idx);
        }
      };
      this.registerInteractable(interactable);
    });

    const vaultGateInteractable = {
      name: 'Abyssal Vault Gate',
      position: this.reflectionPuzzle.vaultGatePos,
      interactionRadius: 3.8,
      getPromptText: () => this.reflectionPuzzle.isUnlocked ? 'Abyssal Vault Unsealed' : 'Insert Tidal Pearl',
      getInteractionPosition: () => new THREE.Vector3(this.reflectionPuzzle.vaultGatePos.x, this.reflectionPuzzle.vaultGatePos.y + 2.0, this.reflectionPuzzle.vaultGatePos.z),
      interact: () => {
        this.reflectionPuzzle.unlockVault();
      }
    };
    this.registerInteractable(vaultGateInteractable);
  }

  onAbyssalVaultUnlocked() {
    this.gameState.emit('notification', {
      title: 'Vault Opened',
      message: 'The way to Nerivael\'s Sunken Sanctuary lies open ahead.',
      type: 'quest-completed'
    });
  }

  // ==============================================================
  // 6. COLLECTIBLE LORE PAGES (4 Tidewrought Pages + Contradiction)
  // ==============================================================
  spawnLorePickups() {
    // Page 25: lore_tide_4 ("The Drowned Library") in Thalassport
    const p1 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_tide_4',
      requiresEyeVision: false,
      x: 132.0,
      z: -28.0,
      radius: 2.5
    });
    this.pickups.push(p1);
    this.registerInteractable(p1);

    // Page 26: lore_tide_5 ("Song of the Abyssal Leviathan") at Whale Song Shoals
    const p2 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_tide_5',
      requiresEyeVision: false,
      x: 168.0,
      z: 18.0,
      radius: 2.5
    });
    this.pickups.push(p2);
    this.registerInteractable(p2);

    // Page 27: lore_tide_6 ("The Trench of Forgetting" - Contradicts lore_ember_7!) Hidden on Drowned Causeway north shore
    const p3 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_tide_6',
      requiresEyeVision: true,
      x: 128.0,
      z: 74.0,
      radius: 2.8
    });
    this.pickups.push(p3);
    this.registerInteractable(p3);
    if (this.eyeVision) {
      this.eyeVision.register(p3);
    }

    // Page 28: lore_tide_7 ("The Weeping God" - Contradicts lore_ember_3!) in Sunken Sanctuary
    const p4 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_tide_7',
      requiresEyeVision: false,
      x: 125.0,
      z: 135.0,
      radius: 2.8
    });
    this.pickups.push(p4);
    this.registerInteractable(p4);
  }
}
