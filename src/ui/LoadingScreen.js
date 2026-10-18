/**
 * Aethrava - Atmospheric Fantasy Loading Screen
 * Displays title, lore passage, and smooth progress transition into the game world.
 */

export class LoadingScreen {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.container = document.createElement('div');
    this.container.id = 'aethrava-loading-screen';

    this.container.innerHTML = `
      <div class="loading-content">
        <div class="loading-eye-icon">
          <div class="eye-outer"></div>
          <div class="eye-inner"></div>
        </div>
        <h1 class="game-title">AETHRAVA</h1>
        <p class="game-subtitle">CHRONICLES OF THE SHATTERED EYE</p>
        <div class="lore-quote">
          <p>"The First Eye shattered into five stones. Each stone birthed a god; each god claimed a people."</p>
          <span class="quote-author">— The Book of Fractured Truths</span>
        </div>
        <div class="progress-container">
          <div class="progress-bar" id="loading-progress-bar"></div>
        </div>
        <div class="loading-status" id="loading-status-text">Awakening the First Eye...</div>
        <button class="start-btn" id="enter-world-btn" style="display: none;">ENTER AETHRAVA</button>
      </div>
    `;

    document.body.appendChild(this.container);

    this.progressBar = this.container.querySelector('#loading-progress-bar');
    this.statusText = this.container.querySelector('#loading-status-text');
    this.startBtn = this.container.querySelector('#enter-world-btn');

    this.startBtn.addEventListener('click', () => {
      this.dismiss();
    });
  }

  setProgress(percent, statusMessage) {
    if (this.progressBar) {
      this.progressBar.style.width = `${Math.min(100, percent)}%`;
    }
    if (this.statusText && statusMessage) {
      this.statusText.innerText = statusMessage;
    }

    if (percent >= 100) {
      this.statusText.style.display = 'none';
      this.startBtn.style.display = 'inline-block';
    }
  }

  dismiss() {
    this.container.style.opacity = '0';
    this.container.style.pointerEvents = 'none';
    setTimeout(() => {
      if (this.container.parentNode) {
        this.container.parentNode.removeChild(this.container);
      }
      if (this.onComplete) this.onComplete();
    }, 600);
  }
}
