import * as THREE from 'three';

/**
 * Aethrava - Cinematic Director & Cutscene Manager
 * Manages in-engine cinematic sequences, letterboxing, camera direction,
 * and dramatic dialogue presentation for divine encounters (e.g. Ignareth).
 */
export class CinematicManager {
  constructor(engine, gameState, dialogueBox, audioManager) {
    this.engine = engine;
    this.gameState = gameState;
    this.dialogueBox = dialogueBox;
    this.audio = audioManager;

    this.isPlaying = false;
    this.currentSequence = null;

    this.createLetterboxDOM();
  }

  createLetterboxDOM() {
    this.container = document.createElement('div');
    this.container.id = 'aethrava-cinematic-overlay';
    this.container.className = 'cinematic-overlay hidden';

    this.container.innerHTML = `
      <div class="cinematic-bar top" id="cinematic-bar-top"></div>
      <div class="cinematic-title-card" id="cinematic-title-card">
        <span class="cinematic-subtitle" id="cinematic-subtitle">SANCTUM OF THE SACRED PYRE</span>
        <h2 class="cinematic-title" id="cinematic-title">IGNARETH THE BURNING MOTHER</h2>
      </div>
      <div class="cinematic-bar bottom" id="cinematic-bar-bottom"></div>
    `;

    document.body.appendChild(this.container);

    this.titleCardEl = this.container.querySelector('#cinematic-title-card');
    this.subtitleEl = this.container.querySelector('#cinematic-subtitle');
    this.titleEl = this.container.querySelector('#cinematic-title');
  }

  /**
   * Triggers Ignareth's Divine Shrine Encounter
   */
  playIgnarethCinematic(player, thirdPersonCamera, ignarethEntity, onComplete) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Show Letterbox & title card
    this.container.classList.remove('hidden');
    this.container.classList.add('active');

    if (this.audio) {
      this.audio.playChime('relic');
    }

    // 2. Position player reverently before the altar
    if (player && ignarethEntity) {
      const altarPos = ignarethEntity.position || new THREE.Vector3(0, 0, 155);
      player.position.set(altarPos.x, altarPos.y, altarPos.z - 9);
      player.velocity.set(0, 0, 0);
      player.mesh.rotation.y = 0; // Look toward Ignareth
    }

    // 3. Aim camera dramatically up at the giant flaming avatar of Ignareth
    if (thirdPersonCamera) {
      thirdPersonCamera.pitch = 0.25; // Look up
      thirdPersonCamera.yaw = Math.PI; // Face north
      thirdPersonCamera.distance = 6.5;
    }

    // 4. Fade title card after 2.5s, then initiate divine dialogue
    setTimeout(() => {
      this.titleCardEl.classList.add('fade-out');

      setTimeout(() => {
        // Open divine dialogue
        this.dialogueBox.open('ignareth_cinematic_dialogue');

        // Hook dialogue close to finish cinematic and award Fire Stone
        const previousClose = this.dialogueBox.onClose;
        this.dialogueBox.onClose = () => {
          if (previousClose) previousClose();
          this.endIgnarethCinematic(player, onComplete);
        };
      }, 800);
    }, 2500);
  }

  endIgnarethCinematic(player, onComplete) {
    // Award Fire Stone (Stone of Pyres) to player inventory
    this.gameState.unlockElementalStone('embercrest');

    // Make sure quest is marked complete
    if (this.gameState.getQuestState('q_burning_mother') !== 'completed') {
      this.gameState.completeQuest('q_burning_mother');
    }

    // Retract letterbox
    this.container.classList.remove('active');
    setTimeout(() => {
      this.container.classList.add('hidden');
      this.titleCardEl.classList.remove('fade-out');
      this.isPlaying = false;

      // Celebrate with divine toast
      this.gameState.emit('notification', {
        title: '🔥 STONE OF PYRES CLAIMED! 🔥',
        message: 'The Fire Elemental Stone pulses in your inventory. Embercrest Highlands complete!',
        type: 'quest-completed'
      });

      if (this.audio) {
        this.audio.playChime('success');
      }

      if (onComplete) {
        onComplete();
      }
    }, 1200);
  }

  /**
   * Triggers Nerivael's Divine Shrine Encounter (Water Clan)
   */
  playNerivaelCinematic(player, thirdPersonCamera, nerivaelEntity, onComplete) {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // 1. Set Title Card Text
    this.subtitleEl.innerText = 'SANCTUARY OF THE ABYSSAL DEPTH';
    this.titleEl.innerText = 'NERIVAEL THE DEEP MIND';
    this.titleEl.style.textShadow = '0 0 25px rgba(56, 189, 248, 0.9), 0 4px 18px rgba(0, 0, 0, 0.9)';
    this.subtitleEl.style.color = '#38bdf8';
    this.subtitleEl.style.textShadow = '0 0 15px rgba(56, 189, 248, 0.8)';

    // 2. Show Letterbox & title card
    this.container.classList.remove('hidden');
    this.container.classList.add('active');

    if (this.audio) {
      this.audio.playChime('relic');
    }

    // 3. Position player reverently before the water altar
    if (player && nerivaelEntity) {
      const altarPos = nerivaelEntity.position || new THREE.Vector3(125, 0, 160);
      player.position.set(altarPos.x, altarPos.y, altarPos.z - 9);
      player.velocity.set(0, 0, 0);
      player.mesh.rotation.y = 0; // Look toward Nerivael
    }

    // 4. Aim camera dramatically up at the giant celestial avatar of Nerivael
    if (thirdPersonCamera) {
      thirdPersonCamera.pitch = 0.25; // Look up
      thirdPersonCamera.yaw = Math.PI; // Face north
      thirdPersonCamera.distance = 6.5;
    }

    // 5. Fade title card after 2.5s, then initiate divine dialogue
    setTimeout(() => {
      this.titleCardEl.classList.add('fade-out');

      setTimeout(() => {
        // Open divine dialogue
        this.dialogueBox.open('nerivael_cinematic_dialogue');

        // Hook dialogue close to finish cinematic and award Water Stone
        const previousClose = this.dialogueBox.onClose;
        this.dialogueBox.onClose = () => {
          if (previousClose) previousClose();
          this.endNerivaelCinematic(player, onComplete);
        };
      }, 800);
    }, 2500);
  }

  endNerivaelCinematic(player, onComplete) {
    // Award Water Stone (Stone of Abyssal Depth) to player inventory
    this.gameState.unlockElementalStone('tidewrought');

    // Make sure quest is marked complete
    if (this.gameState.getQuestState('q_deep_mind_verdict') !== 'completed') {
      this.gameState.completeQuest('q_deep_mind_verdict');
    }

    // Retract letterbox
    this.container.classList.remove('active');
    setTimeout(() => {
      this.container.classList.add('hidden');
      this.titleCardEl.classList.remove('fade-out');
      this.isPlaying = false;

      // Celebrate with divine toast
      this.gameState.emit('notification', {
        title: '💧 STONE OF ABYSSAL DEPTH CLAIMED! 💧',
        message: 'The Water Elemental Stone whispers with oceanic memory in your inventory. Tidewrought Coast complete!',
        type: 'quest-completed'
      });

      if (this.audio) {
        this.audio.playChime('success');
      }

      if (onComplete) {
        onComplete();
      }
    }, 1200);
  }
}

