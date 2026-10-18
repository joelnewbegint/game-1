/**
 * Aethrava - Engine Time Management
 * Handles delta time clamping and FPS tracking.
 */

export class Time {
  constructor() {
    this.lastTime = performance.now();
    this.delta = 0;
    this.elapsed = 0;
    this.frameCount = 0;
    this.fps = 60;
    this.fpsUpdateInterval = 500; // ms
    this.lastFpsUpdate = performance.now();
    this.framesSinceLastFpsUpdate = 0;
  }

  update() {
    const now = performance.now();
    let rawDelta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp delta to prevent erratic physics explosions during tab switching or hiccups
    this.delta = Math.min(rawDelta, 0.1);
    this.elapsed += this.delta;
    this.frameCount++;
    this.framesSinceLastFpsUpdate++;

    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = Math.round((this.framesSinceLastFpsUpdate * 1000) / (now - this.lastFpsUpdate));
      this.lastFpsUpdate = now;
      this.framesSinceLastFpsUpdate = 0;
    }

    return this.delta;
  }
}
