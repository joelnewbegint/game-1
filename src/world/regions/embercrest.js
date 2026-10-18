import * as THREE from 'three';
import { Region } from './Region.js';
import embercrestData from '../../data/regions/embercrest.json' with { type: 'json' };
import { NPC } from '../NPC.js';
import { LorePagePickup } from '../LorePagePickup.js';
import { ForgePuzzle } from '../../puzzles/ForgePuzzle.js';
import { LavaPathPuzzle } from '../../puzzles/LavaPathPuzzle.js';
import { TemplePrismPuzzle } from '../../puzzles/TemplePrismPuzzle.js';

/**
 * Aethrava - Embercrest Region Module (Fire Clan)
 * Complete implementation of the volcanic highlands of Cinderfall,
 * the Sacred Beasts (Lion & Phoenix), the 3 Regional Puzzles,
 * and the Caldera Sanctum of Ignareth the Burning Mother.
 */
export class EmbercrestRegion extends Region {
  constructor(scene, engine, world, gameState, audio, eyeVision, cinematicManager) {
    super(scene, engine, world, gameState, audio, eyeVision, embercrestData);
    this.cinematicManager = cinematicManager;

    // Materials dictionary for high-performance reuse
    this.materials = this.createMaterials();

    this.init();
  }

  createMaterials() {
    return {
      basalt: new THREE.MeshStandardMaterial({
        color: 0x1c1917,
        roughness: 0.9,
        metalness: 0.1
      }),
      darkStone: new THREE.MeshStandardMaterial({
        color: 0x292524,
        roughness: 0.85
      }),
      timber: new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.95
      }),
      goldTrim: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.6,
        roughness: 0.35,
        metalness: 0.8
      }),
      lavaGlow: new THREE.MeshStandardMaterial({
        color: 0xff3b00,
        emissive: 0xff4500,
        emissiveIntensity: 3.0,
        roughness: 0.3
      }),
      sacredFire: new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xff5c2b,
        emissiveIntensity: 4.0,
        roughness: 0.2
      }),
      lionFur: new THREE.MeshStandardMaterial({
        color: 0xd97706,
        roughness: 0.7
      }),
      phoenixGold: new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 2.2,
        roughness: 0.2
      })
    };
  }

  // ==============================================================
  // 1. TERRAIN & GEOGRAPHY (Basalt Crags, Caldera Rim, Magma Vents)
  // ==============================================================
  buildTerrain() {
    // A. Volcanic Basalt Crags bordering Cinderfall and the highland trails
    const cragCoords = [
      // West Ridge (protecting Lion's Crag)
      { x: -35, z: 0, s: 6, h: 9 },
      { x: -42, z: 12, s: 7, h: 12 },
      { x: -48, z: 28, s: 8, h: 14 },
      { x: -60, z: 42, s: 9, h: 18 }, // High peak for Solar Aerie
      // East Ridge
      { x: 32, z: -10, s: 6, h: 8 },
      { x: 38, z: 15, s: 7, h: 11 },
      { x: 34, z: 45, s: 8, h: 13 },
      { x: 28, z: 80, s: 9, h: 15 },
      // North Caldera Ring (encircling Ignareth's Sanctum)
      { x: -25, z: 145, s: 10, h: 22 },
      { x: 0, z: 175, s: 12, h: 25 },
      { x: 25, z: 145, s: 10, h: 22 }
    ];

    const cragGeo = new THREE.ConeGeometry(4.0, 10.0, 6);
    cragCoords.forEach(c => {
      const y = this.world.getGroundHeight(c.x, c.z);
      const crag = new THREE.Mesh(cragGeo, this.materials.basalt);
      crag.position.set(c.x, y + c.h * 0.45, c.z);
      crag.scale.set(c.s * 0.35, c.h * 0.1, c.s * 0.35);
      crag.rotation.y = Math.random() * Math.PI;
      crag.castShadow = true;
      crag.receiveShadow = true;
      this.regionGroup.add(crag);
      this.collidables.push(crag);
    });

    // B. Ambient Magma Vents with flickering glow
    const ventCoords = [
      { x: -14, z: -10 },
      { x: 12, z: -8 },
      { x: -28, z: 15 },
      { x: 22, z: 35 }
    ];

    ventCoords.forEach(v => {
      const y = this.world.getGroundHeight(v.x, v.z);
      const ventGeo = new THREE.CylinderGeometry(0.8, 1.4, 0.4, 8);
      const vent = new THREE.Mesh(ventGeo, this.materials.darkStone);
      vent.position.set(v.x, y + 0.2, v.z);
      vent.castShadow = true;
      this.regionGroup.add(vent);

      const lavaCoreGeo = new THREE.CircleGeometry(0.7, 8);
      lavaCoreGeo.rotateX(-Math.PI / 2);
      const core = new THREE.Mesh(lavaCoreGeo, this.materials.lavaGlow);
      core.position.set(v.x, y + 0.41, v.z);
      this.regionGroup.add(core);

      const light = new THREE.PointLight(0xff4500, 1.2, 5.0);
      light.position.set(v.x, y + 0.8, v.z);
      this.regionGroup.add(light);
    });
  }

  // ==============================================================
  // 2. LANDMARKS & SETTLEMENTS (Cinderfall Village, Pyre, Caldera)
  // ==============================================================
  buildLandmarks() {
    // A. Chieftain's Great Longhouse (x: 0, z: -15)
    this.buildLonghouse(0, -15);

    // B. Blacksmith's Forge Workshop (x: -18, z: -25)
    this.buildBlacksmithHut(-18, -25);

    // C. The Great Altar of the Flame (x: 16, z: -22)
    this.buildGreatPyreAltar(16, -22);

    // D. Skeptic Morvath's Outpost (x: 12, z: 46)
    this.buildCliffHut(12, 46);

    // E. Little Tula's Family Hut (x: -10, z: -8)
    this.buildVillageHut(-10, -8);

    // F. Caldera Sanctum & Colossal Altar of Ignareth (x: 0, z: 155)
    this.buildIgnarethCalderaSanctum(0, 155);
  }

  buildLonghouse(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const house = new THREE.Group();
    house.position.set(x, y, z);

    // Stone foundation
    const foundation = new THREE.Mesh(new THREE.BoxGeometry(10, 1.2, 14), this.materials.darkStone);
    foundation.position.y = 0.6;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    house.add(foundation);

    // Timber frame walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(9.2, 4.0, 13.2), this.materials.timber);
    walls.position.y = 3.0;
    walls.castShadow = true;
    house.add(walls);

    // Peaked pitched roof
    const roofGeo = new THREE.ConeGeometry(7.5, 3.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.0, 1.0, 1.4);
    const roof = new THREE.Mesh(roofGeo, this.materials.basalt);
    roof.position.y = 6.2;
    roof.castShadow = true;
    house.add(roof);

    // Entrance portico columns & clan banner
    const col1 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.8, 8), this.materials.darkStone);
    col1.position.set(-2.5, 2.5, 7.0);
    col1.castShadow = true;
    house.add(col1);

    const col2 = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.8, 8), this.materials.darkStone);
    col2.position.set(2.5, 2.5, 7.0);
    col2.castShadow = true;
    house.add(col2);

    // Clan Sigil above portal
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), this.materials.goldTrim);
    banner.position.set(0, 3.8, 6.7);
    house.add(banner);

    this.regionGroup.add(house);
    this.collidables.push(foundation, walls);
  }

  buildBlacksmithHut(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);

    // Open-air timber shed with heavy forge chimney
    const base = new THREE.Mesh(new THREE.BoxGeometry(7, 0.8, 7), this.materials.darkStone);
    base.position.y = 0.4;
    hut.add(base);

    // Stone Chimney
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.0, 1.6), this.materials.basalt);
    chimney.position.set(0, 3.0, -2.2);
    chimney.castShadow = true;
    hut.add(chimney);

    // Large Anvil Model
    const anvilBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 1.2), this.materials.basalt);
    anvilBase.position.set(1.5, 0.9, 0);
    hut.add(anvilBase);

    const anvilTop = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 1.6), this.materials.goldTrim);
    anvilTop.position.set(1.5, 1.45, 0);
    hut.add(anvilTop);

    this.regionGroup.add(hut);
    this.collidables.push(base, chimney);
  }

  buildGreatPyreAltar(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const altar = new THREE.Group();
    altar.position.set(x, y, z);

    // Tiered circular dais
    const tier1 = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.5, 0.6, 16), this.materials.darkStone);
    tier1.position.y = 0.3;
    tier1.receiveShadow = true;
    altar.add(tier1);

    const tier2 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 0.6, 16), this.materials.darkStone);
    tier2.position.y = 0.9;
    tier2.receiveShadow = true;
    altar.add(tier2);

    // Center sacred fire brazier
    const brazier = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 1.4, 12), this.materials.goldTrim);
    brazier.position.y = 1.8;
    brazier.castShadow = true;
    altar.add(brazier);

    // Sacred Flame mesh & point light
    const flameGeo = new THREE.ConeGeometry(0.8, 2.2, 8);
    const flame = new THREE.Mesh(flameGeo, this.materials.sacredFire);
    flame.position.y = 3.2;
    altar.add(flame);

    const flameLight = new THREE.PointLight(0xff5c2b, 2.5, 14.0);
    flameLight.position.y = 3.4;
    altar.add(flameLight);

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        const pulse = 1.0 + Math.sin(elapsed * 5.0) * 0.15;
        flame.scale.set(pulse, 1.0 + Math.cos(elapsed * 6.0) * 0.2, pulse);
        flameLight.intensity = 2.2 + Math.sin(elapsed * 8.0) * 0.6;
      }
    });

    this.regionGroup.add(altar);
    this.collidables.push(tier1, tier2, brazier);
  }

  buildCliffHut(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);

    const foundation = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.6, 4.5), this.materials.darkStone);
    foundation.position.y = 0.3;
    hut.add(foundation);

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.0, 2.8, 4.0), this.materials.timber);
    body.position.y = 1.8;
    body.castShadow = true;
    hut.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), this.materials.basalt);
    roof.position.y = 3.8;
    roof.rotation.y = Math.PI / 4;
    hut.add(roof);

    this.regionGroup.add(hut);
    this.collidables.push(foundation, body);
  }

  buildVillageHut(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.6, 4.8), this.materials.timber);
    body.position.y = 1.3;
    body.castShadow = true;
    hut.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 1.8, 4), this.materials.basalt);
    roof.position.y = 3.2;
    roof.rotation.y = Math.PI / 4;
    hut.add(roof);

    this.regionGroup.add(hut);
    this.collidables.push(body);
  }

  buildIgnarethCalderaSanctum(x, z) {
    const y = this.world.getGroundHeight(x, z);
    this.calderaGroup = new THREE.Group();
    this.calderaGroup.position.set(x, y, z);

    // A. Grand Obsidian Amphitheater
    const calderaFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 15, 1.0, 24),
      this.materials.darkStone
    );
    calderaFloor.position.y = 0.5;
    calderaFloor.receiveShadow = true;
    this.calderaGroup.add(calderaFloor);

    // Surrounding basalt pillars with glowing magma seams
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 12.5;
      const pz = Math.sin(angle) * 12.5;

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.2, 7.0, 8),
        this.materials.basalt
      );
      pillar.position.set(px, 3.5, pz);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      this.calderaGroup.add(pillar);

      const seam = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 5.0, 0.2),
        this.materials.lavaGlow
      );
      seam.position.set(px * 0.95, 3.5, pz * 0.95);
      this.calderaGroup.add(seam);
    }

    // B. Colossal Avatar / Manifestation of Ignareth
    this.ignarethAvatar = new THREE.Group();
    this.ignarethAvatar.position.set(0, 0.5, 4.5);

    // Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(3.0, 3.5, 2.0, 12),
      this.materials.goldTrim
    );
    ped.position.y = 1.0;
    this.ignarethAvatar.add(ped);

    // Torso of the Burning Mother
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 0.9, 3.5, 10),
      this.materials.sacredFire
    );
    torso.position.y = 3.7;
    this.ignarethAvatar.add(torso);

    // Divine Crown & Halo of solar flames
    const crown = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.25, 8, 24),
      this.materials.goldTrim
    );
    crown.position.set(0, 6.2, 0);
    crown.rotation.x = Math.PI / 2;
    this.ignarethAvatar.add(crown);

    const haloSpikes = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 0),
      this.materials.sacredFire
    );
    haloSpikes.position.set(0, 6.2, 0);
    this.ignarethAvatar.add(haloSpikes);

    // Glowing divine point light
    this.ignarethLight = new THREE.PointLight(0xff5c2b, 4.5, 25.0);
    this.ignarethLight.position.set(0, 5.5, 0);
    this.ignarethAvatar.add(this.ignarethLight);

    // Caldera Divine Altar where the Fire Stone rests
    this.altarStone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.0, 1.2, 8),
      this.materials.goldTrim
    );
    this.altarStone.position.set(0, 1.1, -2.5);
    this.calderaGroup.add(this.altarStone);

    // Floating Stone of Pyres Model
    const stoneGeo = new THREE.OctahedronGeometry(0.45);
    this.stoneOfPyresMesh = new THREE.Mesh(stoneGeo, this.materials.sacredFire);
    this.stoneOfPyresMesh.position.set(0, 2.2, -2.5);
    this.calderaGroup.add(this.stoneOfPyresMesh);

    this.calderaGroup.add(this.ignarethAvatar);
    this.regionGroup.add(this.calderaGroup);
    this.collidables.push(calderaFloor, ped, this.altarStone);

    // Animated breathing / pulsating divine flame
    this.animatedObjects.push({
      update: (delta, elapsed) => {
        if (this.ignarethLight) {
          const p = 3.8 + Math.sin(elapsed * 3.5) * 1.2;
          this.ignarethLight.intensity = p;
        }
        if (this.stoneOfPyresMesh) {
          this.stoneOfPyresMesh.rotation.y += delta * 1.2;
          this.stoneOfPyresMesh.position.y = 2.2 + Math.sin(elapsed * 2.5) * 0.12;
        }
      }
    });

    // Create interactive trigger for Ignareth's Shrine Scene
    this.altarInteractable = {
      name: 'Ignareth the Burning Mother',
      position: new THREE.Vector3(x, y + 1.5, z - 2.5),
      interactionRadius: 4.5,
      getPromptText: () => {
        return this.gameState.inventory.elementalStones.embercrest
          ? 'Commune with the Burning Mother'
          : 'Witness Ignareth & Claim Fire Stone';
      },
      getInteractionPosition: () => new THREE.Vector3(x, y + 1.5, z - 2.5),
      interact: (player, thirdPersonCamera) => {
        if (this.cinematicManager) {
          this.cinematicManager.playIgnarethCinematic(player, thirdPersonCamera, {
            position: new THREE.Vector3(x, y, z)
          });
        }
      }
    };
    this.registerInteractable(this.altarInteractable);
  }

  // ==============================================================
  // 3. VILLAGE NPCS (Chieftain, Smith, Priestess, Skeptic, Child)
  // ==============================================================
  spawnNPCs() {
    // 1. Chieftain Warmaster Varek (Village Hall portico)
    this.varekNPC = new NPC(this.scene, this.world, {
      id: 'varek',
      name: 'Warmaster Varek',
      clanId: 'embercrest',
      dialogueTreeId: 'varek_dialogue',
      x: 0,
      z: -10,
      radius: 3.5
    });
    this.npcs.push(this.varekNPC);
    this.registerInteractable(this.varekNPC);

    // 2. Forgemaster Kael (at the forge anvil)
    this.kaelNPC = new NPC(this.scene, this.world, {
      id: 'kael',
      name: 'Forgemaster Kael',
      clanId: 'embercrest',
      dialogueTreeId: 'kael_dialogue',
      x: -16,
      z: -24,
      radius: 3.5
    });
    this.npcs.push(this.kaelNPC);
    this.registerInteractable(this.kaelNPC);

    // 3. High Priestess Pyra (by the Great Pyre)
    this.pyraNPC = new NPC(this.scene, this.world, {
      id: 'pyra',
      name: 'High Priestess Pyra',
      clanId: 'embercrest',
      dialogueTreeId: 'pyra_dialogue',
      x: 16,
      z: -18,
      radius: 3.5
    });
    this.npcs.push(this.pyraNPC);
    this.registerInteractable(this.pyraNPC);

    // 4. Morvath the Doubter (near the Molten Chasm)
    this.morvathNPC = new NPC(this.scene, this.world, {
      id: 'morvath',
      name: 'Morvath the Doubter',
      clanId: 'embercrest',
      dialogueTreeId: 'morvath_dialogue',
      x: 10,
      z: 46,
      radius: 3.5
    });
    this.npcs.push(this.morvathNPC);
    this.registerInteractable(this.morvathNPC);

    // 5. Little Tula (village center play area)
    this.tulaNPC = new NPC(this.scene, this.world, {
      id: 'tula',
      name: 'Little Tula',
      clanId: 'embercrest',
      dialogueTreeId: 'tula_dialogue',
      x: -8,
      z: -6,
      radius: 3.0
    });
    this.npcs.push(this.tulaNPC);
    this.registerInteractable(this.tulaNPC);
  }

  // ==============================================================
  // 4. SACRED BEASTS & WILDLIFE (Lion, Phoenix, Fauna)
  // ==============================================================
  spawnWildlife() {
    // A. Sacred Fire Lion at Lion's Crag (x: -45, z: 20)
    this.buildSacredFireLion(-45, 20);

    // B. Sacred Phoenix at Solar Aerie (x: -55, z: 45)
    this.buildSacredPhoenix(-55, 45);

    // C. Ambient Wildlife: Fire Salamanders & Ash Hawks
    this.buildAmbientWildlife();
  }

  buildSacredFireLion(x, z) {
    const y = this.world.getGroundHeight(x, z);
    const lionGroup = new THREE.Group();
    lionGroup.position.set(x, y, z);

    // Lion Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 3.2), this.materials.lionFur);
    body.position.y = 1.4;
    body.castShadow = true;
    lionGroup.add(body);

    // Lion Legs (4)
    const legGeo = new THREE.CylinderGeometry(0.25, 0.2, 1.2, 8);
    const legPositions = [
      { lx: -0.6, lz: 1.0 },
      { lx: 0.6, lz: 1.0 },
      { lx: -0.6, lz: -1.0 },
      { lx: 0.6, lz: -1.0 }
    ];
    legPositions.forEach(lp => {
      const leg = new THREE.Mesh(legGeo, this.materials.lionFur);
      leg.position.set(lp.lx, 0.6, lp.lz);
      leg.castShadow = true;
      lionGroup.add(leg);
    });

    // Lion Head & Glowing Fiery Mane
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.2), this.materials.lionFur);
    head.position.set(0, 2.3, 1.7);
    lionGroup.add(head);

    const mane = new THREE.Mesh(new THREE.SphereGeometry(1.1, 12, 12), this.materials.lavaGlow);
    mane.position.set(0, 2.3, 1.4);
    mane.scale.set(1.1, 1.2, 0.9);
    lionGroup.add(mane);

    // Lion Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
    eye1.position.set(-0.35, 2.4, 2.3);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), eyeMat);
    eye2.position.set(0.35, 2.4, 2.3);
    lionGroup.add(eye1, eye2);

    // Lion Aura light
    const lionLight = new THREE.PointLight(0xff6600, 2.0, 8.0);
    lionLight.position.set(0, 2.5, 1.5);
    lionGroup.add(lionLight);

    this.regionGroup.add(lionGroup);
    this.collidables.push(body);

    // Interaction handler for Lion's Blessing
    this.lionInteractable = {
      name: 'Sacred Fire Lion',
      position: new THREE.Vector3(x, y + 1.5, z),
      interactionRadius: 4.5,
      isBlessed: false,
      getPromptText: () => this.lionInteractable.isBlessed ? 'Commune with the Great Lion' : 'Offer Respect to Fire Lion',
      getInteractionPosition: () => new THREE.Vector3(x, y + 1.5, z),
      interact: () => {
        if (!this.lionInteractable.isBlessed) {
          this.lionInteractable.isBlessed = true;
          this.gameState.addItem('lion_mane_talisman');
          if (this.audio) this.audio.playChime('relic');

          if (this.gameState.getQuestState('q_beasts_blessing') === 'active') {
            this.gameState.completeObjective('q_beasts_blessing', 'obj_commune_lion');
          }

          this.gameState.emit('notification', {
            title: 'Lion\'s Blessing Received',
            message: 'The Sacred Lion bows with a thunderous purr, bestowing the Pride Crag Talisman!',
            type: 'trust-positive'
          });
        } else {
          this.gameState.emit('notification', {
            title: 'Sacred Fire Lion',
            message: 'The Lion regards you with warm, golden eyes of silent kinship.',
            type: 'neutral'
          });
        }
      }
    };
    this.registerInteractable(this.lionInteractable);

    // Idle breathing animation
    this.animatedObjects.push({
      update: (delta, elapsed) => {
        body.scale.y = 1.0 + Math.sin(elapsed * 2.0) * 0.04;
        mane.material.emissiveIntensity = 2.4 + Math.sin(elapsed * 3.5) * 0.6;
      }
    });
  }

  buildSacredPhoenix(x, z) {
    const y = this.world.getGroundHeight(x, z) + 12.0; // High upon volcanic roost
    const roost = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 3.5, 14.0, 8),
      this.materials.basalt
    );
    roost.position.set(x, y - 7.0, z);
    roost.castShadow = true;
    roost.receiveShadow = true;
    this.regionGroup.add(roost);
    this.collidables.push(roost);

    const phoenixGroup = new THREE.Group();
    phoenixGroup.position.set(x, y + 0.5, z);

    // Phoenix Body
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.2, 8), this.materials.phoenixGold);
    body.rotation.x = Math.PI / 4;
    body.castShadow = true;
    phoenixGroup.add(body);

    // Phoenix Head & Crest
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), this.materials.phoenixGold);
    head.position.set(0, 1.2, 0.8);
    phoenixGroup.add(head);

    // Radiant Wings (Left & Right)
    const wingGeo = new THREE.BoxGeometry(2.8, 0.1, 1.2);
    this.leftWing = new THREE.Mesh(wingGeo, this.materials.sacredFire);
    this.leftWing.position.set(-1.6, 0.7, 0.2);
    phoenixGroup.add(this.leftWing);

    this.rightWing = new THREE.Mesh(wingGeo, this.materials.sacredFire);
    this.rightWing.position.set(1.6, 0.7, 0.2);
    phoenixGroup.add(this.rightWing);

    // Tail Feathers
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.8, 6), this.materials.lavaGlow);
    tail.position.set(0, -0.6, -1.2);
    tail.rotation.x = -Math.PI / 3;
    phoenixGroup.add(tail);

    const phoenixLight = new THREE.PointLight(0xffedd5, 3.0, 15.0);
    phoenixLight.position.set(0, 1.5, 0);
    phoenixGroup.add(phoenixLight);

    this.regionGroup.add(phoenixGroup);

    // Interaction handler for Phoenix Feather
    this.phoenixInteractable = {
      name: 'Radiant Phoenix',
      position: new THREE.Vector3(x, y + 1.2, z),
      interactionRadius: 5.5,
      isFeatherClaimed: false,
      getPromptText: () => this.phoenixInteractable.isFeatherClaimed ? 'Commune with the Solar Phoenix' : 'Receive Phoenix Feather',
      getInteractionPosition: () => new THREE.Vector3(x, y + 1.2, z),
      interact: () => {
        if (!this.phoenixInteractable.isFeatherClaimed) {
          this.phoenixInteractable.isFeatherClaimed = true;
          this.gameState.addItem('phoenix_feather');
          if (this.audio) this.audio.playChime('relic');

          if (this.gameState.getQuestState('q_beasts_blessing') === 'active') {
            this.gameState.completeObjective('q_beasts_blessing', 'obj_collect_feather');
          }

          this.gameState.emit('notification', {
            title: 'Radiant Phoenix Feather Received',
            message: 'The Phoenix spreads its solar wings and sheds an immortal golden feather into your palm!',
            type: 'trust-positive'
          });
        } else {
          this.gameState.emit('notification', {
            title: 'Radiant Phoenix',
            message: 'The Solar Phoenix warbles a crystal melody of primordial warmth.',
            type: 'neutral'
          });
        }
      }
    };
    this.registerInteractable(this.phoenixInteractable);

    // Idle wing flap animation
    this.animatedObjects.push({
      update: (delta, elapsed) => {
        const flap = Math.sin(elapsed * 2.5) * 0.25;
        this.leftWing.rotation.z = flap;
        this.rightWing.rotation.z = -flap;
        phoenixGroup.position.y = y + 0.5 + Math.sin(elapsed * 1.8) * 0.2;
      }
    });
  }

  buildAmbientWildlife() {
    // 1. Skittering Magma Salamanders near warm stone vents
    this.salamanders = [];
    const salGeo = new THREE.BoxGeometry(0.3, 0.15, 0.7);
    for (let i = 0; i < 4; i++) {
      const sal = new THREE.Mesh(salGeo, this.materials.lavaGlow);
      const angle = (i / 4) * Math.PI * 2;
      sal.position.set(-18 + Math.cos(angle) * 3, 0.2, -22 + Math.sin(angle) * 3);
      this.regionGroup.add(sal);
      this.salamanders.push({
        mesh: sal,
        basePos: sal.position.clone(),
        phase: Math.random() * 10
      });
    }

    // 2. High Soaring Ash Hawks circling above the volcano
    this.hawks = [];
    const hawkGeo = new THREE.ConeGeometry(0.4, 1.2, 4);
    hawkGeo.rotateX(Math.PI / 2);
    for (let i = 0; i < 3; i++) {
      const hawk = new THREE.Mesh(hawkGeo, this.materials.basalt);
      hawk.position.set(0, 28 + i * 4, 60);
      this.regionGroup.add(hawk);
      this.hawks.push({
        mesh: hawk,
        radius: 35 + i * 8,
        speed: 0.6 + i * 0.15,
        height: 28 + i * 4
      });
    }

    this.animatedObjects.push({
      update: (delta, elapsed) => {
        // Salamanders scurrying
        this.salamanders.forEach(s => {
          s.mesh.position.x = s.basePos.x + Math.sin(elapsed * 2.0 + s.phase) * 1.2;
          s.mesh.position.z = s.basePos.z + Math.cos(elapsed * 2.0 + s.phase) * 1.2;
          s.mesh.rotation.y = elapsed * 2.0 + s.phase;
        });

        // Hawks circling
        this.hawks.forEach((h, idx) => {
          const a = elapsed * h.speed + idx * 2.1;
          h.mesh.position.x = Math.cos(a) * h.radius;
          h.mesh.position.z = 60 + Math.sin(a) * h.radius;
          h.mesh.position.y = h.height + Math.sin(elapsed * 1.5 + idx) * 1.5;
          h.mesh.rotation.y = -a + Math.PI / 2;
        });
      }
    });
  }

  // ==============================================================
  // 5. REGIONAL PUZZLES (Forge, Lava Path, Temple Prisms)
  // ==============================================================
  spawnPuzzles() {
    // 1. Forge Puzzle (The Smith's Crucible at Kael's Forge: x: -18, z: -25)
    this.forgePuzzle = new ForgePuzzle(this.scene, this.world, this.gameState, this.audio);
    this.puzzles.forge = this.forgePuzzle;

    // Interactive handle for Forge Console
    this.forgeInteractable = {
      name: 'Sacred Crucible Station',
      position: this.forgePuzzle.position,
      interactionRadius: 3.2,
      getPromptText: () => this.forgePuzzle.getPromptText(),
      getInteractionPosition: () => this.forgePuzzle.getInteractionPosition(),
      interact: () => {
        this.forgePuzzle.open();
      }
    };
    this.registerInteractable(this.forgeInteractable);

    // 2. Lava Path Puzzle (The Molten Crossing at the chasm: z: 52 to 70)
    this.lavaPuzzle = new LavaPathPuzzle(this.scene, this.world, this.gameState, this.audio);
    this.puzzles.lavaPath = this.lavaPuzzle;

    // Register with Eye Vision to illuminate hidden submerged stepping stones
    if (this.eyeVision) {
      this.eyeVision.register(this.lavaPuzzle);
    }

    // 3. Temple Prism Puzzle (The Pillars of Ignareth: z: 92 to 108)
    this.templePuzzle = new TemplePrismPuzzle(
      this.scene,
      this.world,
      this.gameState,
      this.audio,
      () => {
        // Callback on Sun Gate unlock
        this.onCalderaGateUnlocked();
      }
    );
    this.puzzles.templePrisms = this.templePuzzle;

    // Register 3 rotating prism interactables
    this.templePuzzle.prismMeshes.forEach((pm, idx) => {
      const interactable = {
        name: `Pyre Focus Prism ${idx + 1}`,
        position: pm.group.position,
        interactionRadius: 2.8,
        getPromptText: () => `Rotate Focus Prism [${pm.data.angle}°]`,
        getInteractionPosition: () => new THREE.Vector3(pm.data.x, this.world.getGroundHeight(pm.data.x, pm.data.z) + 1.8, pm.data.z),
        interact: () => {
          this.templePuzzle.rotatePrism(idx);
        }
      };
      this.registerInteractable(interactable);
    });

    // Sun Gate Receptacle Interactable
    this.gateInteractable = {
      name: 'Caldera Sun Gate',
      position: this.templePuzzle.gatePos,
      interactionRadius: 3.8,
      getPromptText: () => this.templePuzzle.isUnlocked ? 'Caldera Gate Unsealed' : 'Insert Obsidian Sun Key',
      getInteractionPosition: () => new THREE.Vector3(this.templePuzzle.gatePos.x, this.templePuzzle.gatePos.y + 2.0, this.templePuzzle.gatePos.z),
      interact: () => {
        this.templePuzzle.unlockGate();
      }
    };
    this.registerInteractable(this.gateInteractable);
  }

  onCalderaGateUnlocked() {
    // Open path to the Caldera
    this.gameState.emit('notification', {
      title: 'Gate Opened',
      message: 'The way to Ignareth\'s Caldera Sanctum lies open ahead.',
      type: 'quest-completed'
    });
  }

  // ==============================================================
  // 6. COLLECTIBLE LORE PAGES (4 Embercrest Pages + Contradiction)
  // ==============================================================
  spawnLorePickups() {
    // Page 21: lore_ember_4 ("The Forge of Souls") in Cinderfall near the forge
    const p1 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_ember_4',
      requiresEyeVision: false,
      x: -21.0,
      z: -26.0,
      radius: 2.5
    });
    this.pickups.push(p1);
    this.registerInteractable(p1);

    // Page 22: lore_ember_5 ("The Lion and the Phoenix") at the Pride Crags
    const p2 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_ember_5',
      requiresEyeVision: false,
      x: -42.0,
      z: 24.0,
      radius: 2.5
    });
    this.pickups.push(p2);
    this.registerInteractable(p2);

    // Page 23: lore_ember_6 ("The Caldera's Secret") - Hidden on north lava bank! (Requires Eye Vision)
    const p3 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_ember_6',
      requiresEyeVision: true,
      x: 3.0,
      z: 73.0,
      radius: 2.8
    });
    this.pickups.push(p3);
    this.registerInteractable(p3);
    if (this.eyeVision) {
      this.eyeVision.register(p3);
    }

    // Page 24: lore_ember_7 ("The Smoldering Core" - Contradicts lore_stone_3!) Inside Temple Courtyard
    const p4 = new LorePagePickup(this.scene, this.world, {
      pageId: 'lore_ember_7',
      requiresEyeVision: false,
      x: 0,
      z: 118.0,
      radius: 2.8
    });
    this.pickups.push(p4);
    this.registerInteractable(p4);
  }
}
