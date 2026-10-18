import * as THREE from 'three';

/**
 * Aethrava - Proximity Interaction System
 * Detects nearby interactable NPCs/objects, calculates 3D-to-screen projection,
 * and renders a floating prompt HUD element.
 */
export class InteractionSystem {
  constructor(camera, inputManager, gameState) {
    this.camera = camera;
    this.input = inputManager;
    this.gameState = gameState;
    this.interactables = [];
    this.currentInteractable = null;

    // Callbacks
    this.onStartDialogue = null;

    // Screen projection vector
    this.tempVec = new THREE.Vector3();

    // Create Floating Prompt Element
    this.promptEl = document.createElement('div');
    this.promptEl.id = 'aethrava-floating-prompt';
    this.promptEl.className = 'hidden';
    this.promptEl.innerHTML = `
      <span class="prompt-key">E</span>
      <span class="prompt-text">Interact</span>
    `;
    document.body.appendChild(this.promptEl);

    this.promptKeyEl = this.promptEl.querySelector('.prompt-key');
    this.promptTextEl = this.promptEl.querySelector('.prompt-text');
  }

  register(interactable) {
    this.interactables.push(interactable);
  }

  unregister(interactable) {
    const idx = this.interactables.indexOf(interactable);
    if (idx > -1) this.interactables.splice(idx, 1);
  }

  update(player, thirdPersonCamera) {
    const playerPos = player ? player.position : null;
    if (!playerPos) return;

    this.player = player;
    this.thirdPersonCamera = thirdPersonCamera;

    let closest = null;
    let minDistance = Infinity;

    for (let i = 0; i < this.interactables.length; i++) {
      const obj = this.interactables[i];
      if (obj.mesh && !obj.mesh.visible) continue;

      const objPos = obj.position || (obj.getInteractionPosition ? obj.getInteractionPosition() : null);
      if (!objPos) continue;

      const dist = playerPos.distanceTo(objPos);
      if (dist <= obj.interactionRadius && dist < minDistance) {
        minDistance = dist;
        closest = obj;
      }
    }

    this.currentInteractable = closest;

    if (this.currentInteractable) {
      this.updatePromptDisplay(this.currentInteractable);

      // Check interaction trigger from keyboard [E] or touch button [ACT]
      if (this.input.consumeInteract()) {
        this.triggerInteraction(this.currentInteractable);
      }
    } else {
      this.hidePrompt();
    }
  }

  updatePromptDisplay(target) {
    // 3D to Screen Projection
    const targetWorldPos = target.getInteractionPosition ? target.getInteractionPosition() : target.position;
    this.tempVec.copy(targetWorldPos);
    this.tempVec.project(this.camera);

    // Behind camera check
    if (this.tempVec.z > 1.0) {
      this.hidePrompt();
      return;
    }

    const screenX = (this.tempVec.x * 0.5 + 0.5) * window.innerWidth;
    const screenY = (-(this.tempVec.y * 0.5) + 0.5) * window.innerHeight;

    this.promptKeyEl.innerText = this.input.isTouchDevice ? 'ACT' : 'E';
    this.promptTextEl.innerText = target.getPromptText();

    this.promptEl.style.left = `${screenX}px`;
    this.promptEl.style.top = `${screenY}px`;
    this.promptEl.classList.remove('hidden');
    this.promptEl.classList.add('visible');
  }

  hidePrompt() {
    this.promptEl.classList.remove('visible');
    this.promptEl.classList.add('hidden');
  }

  triggerInteraction(target) {
    if (target.interact) {
      target.interact(this.player, this.thirdPersonCamera);
    } else if (target.dialogueTreeId && this.onStartDialogue) {
      this.onStartDialogue(target.dialogueTreeId);
    } else if (target.collect) {
      target.collect(this.gameState);
    }
  }
}
