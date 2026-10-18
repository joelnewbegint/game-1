import './style.css';
import { Engine } from './engine/Engine.js';
import { World } from './world/World.js';
import { Player } from './player/Player.js';
import { ThirdPersonCamera } from './player/ThirdPersonCamera.js';
import { InputManager } from './systems/InputManager.js';
import { GameState } from './systems/GameState.js';
import { SaveSystem } from './systems/SaveSystem.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { EyeVisionSystem } from './systems/EyeVisionSystem.js';
import { AudioManager } from './audio/AudioManager.js';
import { DayNightCycle } from './world/DayNightCycle.js';
import { ParticleSystem } from './world/particles/ParticleSystem.js';
import { CinematicManager } from './world/CinematicManager.js';
import { EmbercrestRegion } from './world/regions/embercrest.js';
import { NPC } from './world/NPC.js';
import { PickupItem } from './world/PickupItem.js';
import { LorePagePickup } from './world/LorePagePickup.js';
import { SpiritPath } from './world/SpiritPath.js';
import { DialogueBox } from './ui/DialogueBox.js';
import { JournalUI } from './ui/JournalUI.js';
import { LoreBookUI } from './ui/LoreBookUI.js';
import { SettingsUI } from './ui/SettingsUI.js';
import { PauseMenu } from './ui/PauseMenu.js';
import { MainMenu } from './ui/MainMenu.js';
import { NotificationToast } from './ui/NotificationToast.js';
import { TouchControls } from './ui/TouchControls.js';
import { DebugOverlay } from './ui/DebugOverlay.js';
import { LoadingScreen } from './ui/LoadingScreen.js';

/**
 * Aethrava - Main Game Entry Point
 * Phase 4: First Full Region, Embercrest (Fire Clan)
 */
function initGame() {
  const container = document.getElementById('app');

  // 1. Initialize Central Reactive Game State & Notifications
  const gameState = new GameState();
  const notificationToast = new NotificationToast(gameState);

  // 2. Initialize Loading Screen
  const loadingScreen = new LoadingScreen(() => {
    mainMenu.open();
  });
  loadingScreen.setProgress(15, 'Awakening the First Eye...');

  // 3. Initialize Core 3D Engine
  const engine = new Engine(container);
  loadingScreen.setProgress(30, 'Binding celestial lights & atmosphere...');

  // 4. Initialize Procedural Audio Synthesizer (Zero asset 404s, authentic ambient soundscape)
  const audioManager = new AudioManager(gameState);

  // 5. Initialize World (Terrain, Sky, Lighting)
  const world = new World(engine.scene);
  const dayNightCycle = new DayNightCycle(world.skyDome, world.lighting, engine.scene);
  const particleSystem = new ParticleSystem(engine.scene);
  loadingScreen.setProgress(50, 'Erecting volcanic highlands & obsidian crags...');

  // 6. Initialize Player & Orbit Camera
  const player = new Player(engine.scene, world);
  const thirdPersonCamera = new ThirdPersonCamera(engine.camera, world);
  loadingScreen.setProgress(65, 'Attuning Kaelen\'s magic eye vision...');

  // 7. Initialize Input & Mobile Touch Controls
  const inputManager = new InputManager(engine.renderer.domElement);
  const touchControls = new TouchControls(inputManager);

  // 8. Initialize Eye Vision System (Energy meter, screen desaturation, hidden entity reveals)
  const eyeVisionSystem = new EyeVisionSystem(engine, player, world, gameState);

  // 9. Initialize UI Modals
  const dialogueBox = new DialogueBox(gameState);
  const journalUI = new JournalUI(gameState);
  const loreBookUI = new LoreBookUI(gameState);
  const settingsUI = new SettingsUI(engine, world.lighting, gameState, touchControls);

  // 10. Initialize Cinematic Cutscene Director
  const cinematicManager = new CinematicManager(engine, gameState, dialogueBox, audioManager);

  // 11. Initialize Phase 4 Region: Embercrest (Fire Clan)
  loadingScreen.setProgress(80, 'Populating Cinderfall Village & Caldera Sanctum...');
  const embercrestRegion = new EmbercrestRegion(
    engine.scene,
    engine,
    world,
    gameState,
    audioManager,
    eyeVisionSystem,
    cinematicManager
  );

  // 12. Initialize Starting Dais Entities (Phase 1-3 backward compatibility)
  const elaraNPC = new NPC(engine.scene, world, {
    id: 'elara',
    name: 'Lorekeeper Elara',
    clanId: 'embercrest',
    dialogueTreeId: 'elara_dialogue',
    x: 4.2,
    z: 2.2,
    radius: 3.2
  });

  const fireFragmentPickup = new PickupItem(engine.scene, world, {
    id: 'pickup_fire_fragment',
    itemId: 'ancient_fire_fragment',
    name: 'Ancient Fire Fragment',
    x: 0,
    z: 32.0,
    radius: 2.8
  });

  const visibleLorePage = new LorePagePickup(engine.scene, world, {
    pageId: 'lore_ember_1',
    requiresEyeVision: false,
    x: -2.8,
    z: 1.2,
    radius: 2.6
  });

  const hiddenLorePage = new LorePagePickup(engine.scene, world, {
    pageId: 'lore_tide_1',
    requiresEyeVision: true,
    x: -21.0,
    z: 5.0,
    radius: 2.8
  });

  const hiddenArchMythPage = new LorePagePickup(engine.scene, world, {
    pageId: 'myth_first_eye',
    requiresEyeVision: true,
    x: 3.8,
    z: 32.0,
    radius: 2.8
  });

  const spiritPath = new SpiritPath(engine.scene, world);

  // Register Vision-Sensitive Entities with EyeVisionSystem
  eyeVisionSystem.register(hiddenLorePage);
  eyeVisionSystem.register(hiddenArchMythPage);
  eyeVisionSystem.register(spiritPath);

  // 13. Initialize Proximity Interaction System
  const interactionSystem = new InteractionSystem(engine.camera, inputManager, gameState);

  // Register Starting Entities
  interactionSystem.register(elaraNPC);
  interactionSystem.register(fireFragmentPickup);
  interactionSystem.register(visibleLorePage);
  interactionSystem.register(hiddenLorePage);
  interactionSystem.register(hiddenArchMythPage);

  // Register all Embercrest Region Interactables (NPCs, Sacred Beasts, Puzzles, Pickups, Shrine Altar)
  embercrestRegion.interactables.forEach(entity => {
    interactionSystem.register(entity);
  });

  // Register Region Collidables into World
  embercrestRegion.getCollidables().forEach(col => {
    world.terrain.collidableObjects.push(col);
  });

  // 14. Initialize Menus & Wire Modals
  const pauseMenu = new PauseMenu(gameState, player, journalUI, settingsUI, () => {
    mainMenu.open();
  });

  const syncAllPickups = () => {
    fireFragmentPickup.syncWithState(gameState);
    visibleLorePage.syncWithState(gameState);
    hiddenLorePage.syncWithState(gameState);
    hiddenArchMythPage.syncWithState(gameState);
    embercrestRegion.pickups.forEach(p => p.syncWithState(gameState));
  };

  const mainMenu = new MainMenu(gameState, player, settingsUI, (isContinue) => {
    syncAllPickups();
    audioManager.startAmbience();
  });

  // Wire Interaction Triggers & Cross-Modal Links
  interactionSystem.onStartDialogue = (treeId) => {
    dialogueBox.open(treeId);
  };

  journalUI.onOpenLoreBook = () => {
    loreBookUI.open('pages');
  };

  // Wire Input Hotkeys
  inputManager.onToggleEyeVision = () => {
    eyeVisionSystem.toggle();
    audioManager.playChime(eyeVisionSystem.isActive ? 'eye_on' : 'eye_off');
  };

  inputManager.onToggleLoreBook = () => {
    loreBookUI.toggle();
  };

  // Connect Audio Volume Settings
  settingsUI.onVolumeChange = (vol) => {
    audioManager.setMasterVolume(vol);
  };

  // Auto-Save when state changes & sync pickups
  gameState.on('state_changed', () => {
    if (!mainMenu.isOpen) {
      SaveSystem.save(gameState, player);
    }
    syncAllPickups();
  });

  // Start background audio ambience on first user gesture
  const startAudioOnce = () => {
    audioManager.startAmbience();
    window.removeEventListener('pointerdown', startAudioOnce);
    window.removeEventListener('keydown', startAudioOnce);
  };
  window.addEventListener('pointerdown', startAudioOnce);
  window.addEventListener('keydown', startAudioOnce);

  // 15. Initialize Debug Overlay
  const debugOverlay = new DebugOverlay(
    engine,
    player,
    thirdPersonCamera,
    inputManager,
    touchControls,
    () => journalUI.toggle('quests'),
    () => pauseMenu.toggle(),
    () => eyeVisionSystem.toggle(),
    () => loreBookUI.toggle()
  );

  loadingScreen.setProgress(100, 'Ready.');

  // 16. Core Game Loop Tick
  engine.addUpdateCallback((delta, elapsed) => {
    const isCinematic = cinematicManager.isPlaying;
    const isForgePuzzleOpen = embercrestRegion.puzzles.forge?.modal?.classList.contains('visible');

    const isModalOpen = (
      dialogueBox.isOpen ||
      pauseMenu.isOpen ||
      mainMenu.isOpen ||
      journalUI.isOpen ||
      loreBookUI.isOpen ||
      settingsUI.isOpen ||
      isForgePuzzleOpen ||
      isCinematic
    );

    // 1. Process Input
    if (!isModalOpen) {
      inputManager.update();
    } else {
      inputManager.moveVector = { x: 0, z: 0 };
    }

    // 2. Update Player Mechanics & Animations
    if (!isModalOpen) {
      player.update(delta, inputManager, thirdPersonCamera.yaw);
    } else {
      player.update(
        delta,
        { moveVector: { x: 0, z: 0 }, isRunning: false, consumeJump: () => false },
        thirdPersonCamera.yaw
      );
    }

    // 3. Update Camera Orbit & Ground Collision
    if (!isModalOpen) {
      thirdPersonCamera.update(delta, player, inputManager);
    }

    // 4. Update World (Shadow follow)
    world.update(player.position);

    // 5. Update Dynamic Day/Night Cycle
    dayNightCycle.update(delta);

    // 6. Update High-Performance Particle Systems (Embers & Smoke)
    particleSystem.update(delta, elapsed, player.position);

    // 7. Update Eye Vision System (Energy drainage & recharge)
    eyeVisionSystem.update(delta);

    // 8. Update Embercrest Region Simulation (NPCs, Beasts, Puzzles, Fauna, Caldera Altar)
    embercrestRegion.update(delta, elapsed, player);

    // 9. Update Interactive Entities Animations
    elaraNPC.update(delta, elapsed);
    fireFragmentPickup.update(delta, elapsed);
    visibleLorePage.update(delta, elapsed);
    hiddenLorePage.update(delta, elapsed);
    hiddenArchMythPage.update(delta, elapsed);
    spiritPath.update(delta, elapsed);

    // 10. Update Proximity Interaction System
    if (!isModalOpen) {
      interactionSystem.update(player, thirdPersonCamera);
    } else {
      interactionSystem.hidePrompt();
    }

    // 11. Update Debug Diagnostics
    debugOverlay.update(delta, eyeVisionSystem);
  });

  // Expose global debug handle for automated testing and browser inspections
  window.__AETHRAVA__ = {
    engine,
    world,
    player,
    camera: thirdPersonCamera,
    input: inputManager,
    gameState,
    eyeVision: eyeVisionSystem,
    loreBook: loreBookUI,
    journal: journalUI,
    dialogue: dialogueBox,
    audio: audioManager,
    dayNight: dayNightCycle,
    particles: particleSystem,
    cinematic: cinematicManager,
    embercrest: embercrestRegion,
    saveSystem: SaveSystem
  };
}

// Start game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
