/**
 * Aethrava - Unified Input Manager
 * Automatically detects Desktop (Keyboard + Mouse) vs Touchscreen,
 * and normalizes inputs for character movement and camera control.
 */

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Movement state (-1 to 1)
    this.moveVector = { x: 0, z: 0 };
    this.isRunning = false;
    this.jumpRequested = false;
    this.interactRequested = false;

    // Camera look delta (radians/pixels)
    this.lookDelta = { x: 0, y: 0 };

    // Device detection
    this.isTouchDevice = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0
    );

    // Keyboard state tracking
    this.keys = {};
    this.pointerLocked = false;
    this.isRightMouseDown = false;
    this.prevMousePos = { x: 0, y: 0 };

    // Debug toggle callback
    this.onToggleDebug = null;

    this.initKeyboard();
    this.initMouse();
    this.initTouchDetection();
  }

  initKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space') {
        this.jumpRequested = true;
      }

      if (e.code === 'KeyE') {
        this.interactRequested = true;
      }

      // Debug toggle key: Backquote (` or ~) or F3
      if (e.code === 'Backquote' || e.code === 'F3') {
        e.preventDefault();
        if (this.onToggleDebug) this.onToggleDebug();
      }

      // Eye Vision toggle key: V
      if (e.code === 'KeyV') {
        if (this.onToggleEyeVision) this.onToggleEyeVision();
      }

      // Lore Book toggle key: B
      if (e.code === 'KeyB') {
        if (this.onToggleLoreBook) this.onToggleLoreBook();
      }

      // Prevent space or arrows from scrolling the page
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Clear keys if window loses focus
    window.addEventListener('blur', () => {
      this.keys = {};
    });
  }

  initMouse() {
    // Request pointer lock on canvas click (desktop)
    this.canvas.addEventListener('click', () => {
      if (!this.isTouchDevice && !this.pointerLocked) {
        this.canvas.requestPointerLock?.();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = (document.pointerLockElement === this.canvas);
    });

    // Mouse movement
    window.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.lookDelta.x += e.movementX;
        this.lookDelta.y += e.movementY;
      } else if (this.isRightMouseDown) {
        const dx = e.clientX - this.prevMousePos.x;
        const dy = e.clientY - this.prevMousePos.y;
        this.lookDelta.x += dx;
        this.lookDelta.y += dy;
        this.prevMousePos.x = e.clientX;
        this.prevMousePos.y = e.clientY;
      }
    });

    // Fallback: right-click mouse drag if pointer lock is not active
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 2 || (!this.pointerLocked && e.button === 0)) {
        this.isRightMouseDown = true;
        this.prevMousePos.x = e.clientX;
        this.prevMousePos.y = e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      this.isRightMouseDown = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  initTouchDetection() {
    // Dynamically flag touch if a touch is triggered on screen
    const detectTouch = () => {
      this.isTouchDevice = true;
      window.removeEventListener('touchstart', detectTouch);
    };
    window.addEventListener('touchstart', detectTouch, { passive: true });
  }

  /**
   * Set inputs from virtual touch controls
   */
  setTouchMovement(x, z) {
    this.touchMoveX = x;
    this.touchMoveZ = z;
  }

  setTouchLookDelta(dx, dy) {
    this.lookDelta.x += dx;
    this.lookDelta.y += dy;
  }

  setTouchRunning(val) {
    this.touchRunning = val;
  }

  triggerTouchJump() {
    this.jumpRequested = true;
  }

  triggerTouchInteract() {
    this.interactRequested = true;
  }

  /**
   * Evaluates combined input state for the current frame
   */
  update() {
    let x = 0;
    let z = 0;

    // 1. Keyboard WASD / Arrows
    if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

    // 2. Combine with Touch Joystick
    if (this.touchMoveX !== undefined && this.touchMoveZ !== undefined) {
      if (Math.abs(this.touchMoveX) > 0.05 || Math.abs(this.touchMoveZ) > 0.05) {
        x += this.touchMoveX;
        z += this.touchMoveZ;
      }
    }

    // Normalize movement vector so diagonal is not faster
    const len = Math.sqrt(x * x + z * z);
    if (len > 1.0) {
      x /= len;
      z /= len;
    }

    this.moveVector.x = x;
    this.moveVector.z = z;

    // Run modifier (Shift or Touch Sprint)
    this.isRunning = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.touchRunning);
  }

  /**
   * Returns current look delta and clears it for the next frame
   */
  consumeLookDelta() {
    const delta = { x: this.lookDelta.x, y: this.lookDelta.y };
    this.lookDelta.x = 0;
    this.lookDelta.y = 0;
    return delta;
  }

  consumeJump() {
    const jump = this.jumpRequested;
    this.jumpRequested = false;
    return jump;
  }

  consumeInteract() {
    const interact = this.interactRequested;
    this.interactRequested = false;
    return interact;
  }
}
