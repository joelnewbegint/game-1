/**
 * Aethrava - Mobile Virtual Touch Controls
 * Implements virtual joystick, camera look-drag pad, jump, sprint, and interact buttons.
 */

export class TouchControls {
  constructor(inputManager) {
    this.input = inputManager;
    this.visible = this.input.isTouchDevice;

    this.container = document.createElement('div');
    this.container.id = 'aethrava-touch-controls';
    this.container.className = this.visible ? 'active' : 'hidden';

    this.container.innerHTML = `
      <!-- Left Joystick Zone -->
      <div id="touch-joystick-zone">
        <div id="joystick-base">
          <div id="joystick-knob"></div>
        </div>
      </div>

      <!-- Right Camera Look-Drag Zone -->
      <div id="touch-look-zone">
        <div class="touch-look-hint">Drag to Look</div>
      </div>

      <!-- Action Buttons -->
      <div id="touch-actions-zone">
        <button id="touch-btn-eye" class="touch-action-btn eye-btn" title="Eye Vision">
          <span class="btn-glyph" style="font-size: 1.3rem;">👁️</span>
          <span class="btn-label">EYE</span>
        </button>

        <button id="touch-btn-sprint" class="touch-action-btn" title="Sprint">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
          </svg>
          <span>RUN</span>
        </button>

        <button id="touch-btn-jump" class="touch-action-btn jump-btn" title="Jump">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 4l-8 8h5v8h6v-8h5z"/>
          </svg>
          <span>JUMP</span>
        </button>

        <button id="touch-btn-interact" class="touch-action-btn interact-btn" title="Interact">
          <span class="btn-glyph">E</span>
          <span class="btn-label">ACT</span>
        </button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.joystickZone = this.container.querySelector('#touch-joystick-zone');
    this.joystickBase = this.container.querySelector('#joystick-base');
    this.joystickKnob = this.container.querySelector('#joystick-knob');
    this.lookZone = this.container.querySelector('#touch-look-zone');

    this.eyeBtn = this.container.querySelector('#touch-btn-eye');
    this.sprintBtn = this.container.querySelector('#touch-btn-sprint');
    this.jumpBtn = this.container.querySelector('#touch-btn-jump');
    this.interactBtn = this.container.querySelector('#touch-btn-interact');

    this.joystickActive = false;
    this.joystickTouchId = null;
    this.joystickCenter = { x: 0, y: 0 };
    this.joystickRadius = 50; // max knob travel in px

    this.lookTouchId = null;
    this.prevLookPos = { x: 0, y: 0 };

    this.isSprinting = false;

    this.bindEvents();
  }

  setVisible(visible) {
    this.visible = visible;
    if (this.visible) {
      this.container.classList.remove('hidden');
      this.container.classList.add('active');
    } else {
      this.container.classList.remove('active');
      this.container.classList.add('hidden');
    }
  }

  toggleVisible() {
    this.setVisible(!this.visible);
  }

  bindEvents() {
    // 1. Joystick touch handlers
    this.joystickZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.joystickActive) return;

      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.joystickActive = true;

      const rect = this.joystickZone.getBoundingClientRect();
      const localX = touch.clientX - rect.left;
      const localY = touch.clientY - rect.top;

      this.joystickCenter = { x: localX, y: localY };
      this.joystickBase.style.left = `${localX}px`;
      this.joystickBase.style.top = `${localY}px`;
      this.joystickBase.style.opacity = '1';
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      // Joystick movement
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (this.joystickActive && touch.identifier === this.joystickTouchId) {
          const rect = this.joystickZone.getBoundingClientRect();
          const curX = touch.clientX - rect.left;
          const curY = touch.clientY - rect.top;

          let dx = curX - this.joystickCenter.x;
          let dy = curY - this.joystickCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > this.joystickRadius) {
            dx = (dx / dist) * this.joystickRadius;
            dy = (dy / dist) * this.joystickRadius;
          }

          this.joystickKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

          // Normalized values: x (-1 to 1), z (-1 = forward, +1 = backward)
          const normX = dx / this.joystickRadius;
          const normZ = dy / this.joystickRadius;
          this.input.setTouchMovement(normX, normZ);
        }

        // Camera Look Drag
        if (touch.identifier === this.lookTouchId) {
          const dx = touch.clientX - this.prevLookPos.x;
          const dy = touch.clientY - this.prevLookPos.y;
          this.input.setTouchLookDelta(dx, dy);
          this.prevLookPos.x = touch.clientX;
          this.prevLookPos.y = touch.clientY;
        }
      }
    }, { passive: false });

    const handleTouchEnd = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === this.joystickTouchId) {
          this.joystickActive = false;
          this.joystickTouchId = null;
          this.input.setTouchMovement(0, 0);
          this.joystickKnob.style.transform = 'translate(-50%, -50%)';
          this.joystickBase.style.opacity = '0.4';
        }

        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    };

    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);

    // 2. Camera Look Area touchstart
    this.lookZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.lookTouchId !== null) return;

      const touch = e.changedTouches[0];
      this.lookTouchId = touch.identifier;
      this.prevLookPos = { x: touch.clientX, y: touch.clientY };
    }, { passive: false });

    // 3. Action Buttons
    this.jumpBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.triggerTouchJump();
    }, { passive: false });

    this.jumpBtn.addEventListener('click', (e) => {
      // Also supports mouse clicking for desktop testing
      this.input.triggerTouchJump();
    });

    this.interactBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.input.triggerTouchInteract();
    }, { passive: false });

    this.interactBtn.addEventListener('click', () => {
      this.input.triggerTouchInteract();
    });

    // Sprint toggle
    const toggleSprint = () => {
      this.isSprinting = !this.isSprinting;
      this.input.setTouchRunning(this.isSprinting);
      this.sprintBtn.classList.toggle('active', this.isSprinting);
    };

    this.sprintBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      toggleSprint();
    }, { passive: false });

    this.sprintBtn.addEventListener('click', toggleSprint);

    // Eye Vision toggle
    this.eyeBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (this.input.onToggleEyeVision) this.input.onToggleEyeVision();
    }, { passive: false });

    this.eyeBtn.addEventListener('click', () => {
      if (this.input.onToggleEyeVision) this.input.onToggleEyeVision();
    });
  }
}
