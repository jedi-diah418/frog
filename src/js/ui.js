/**
 * UI Controller for Radioactive Froggies
 */

class GameUI {
  constructor() {
    this.game = null;
    this.gridElement = null;
    this.tiles = [];
    this.debugMode = false; // Show frog positions

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  /**
   * Initialize the game and UI
   */
  init() {
    // Get seed from URL parameter or generate new one
    const urlParams = new URLSearchParams(window.location.search);
    const seed = urlParams.get('seed') ? parseInt(urlParams.get('seed')) : null;

    // Create game instance
    this.game = new RadioactiveFroggies(seed);

    // Get DOM elements
    this.gridElement = document.getElementById('game-grid');

    // Set up event listeners
    this.setupEventListeners();

    // Create grid
    this.createGrid();

    // Initial UI update
    this.updateUI();

    // Make game globally available for debugging
    window.radioactiveFroggies = this.game;
    window.gameUI = this;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Button listeners
    document.getElementById('reset-button').addEventListener('click', () => {
      this.resetGame();
    });

    document.getElementById('new-game-button').addEventListener('click', () => {
      this.newGame();
    });

    document.getElementById('share-button').addEventListener('click', () => {
      this.shareLevel();
    });

    document.getElementById('seed-value').addEventListener('click', () => {
      this.copyShareURL();
    });

    document.getElementById('retry-button').addEventListener('click', () => {
      this.resetGame();
      this.hideGameOver();
    });

    document.getElementById('next-level-button').addEventListener('click', () => {
      this.newGame();
      this.hideGameOver();
    });

    document.getElementById('debug-button').addEventListener('click', () => {
      this.toggleDebugMode();
    });
  }

  /**
   * Create the game grid
   */
  createGrid() {
    this.gridElement.innerHTML = '';
    this.tiles = [];

    for (let y = 0; y < this.game.GRID_SIZE; y++) {
      for (let x = 0; x < this.game.GRID_SIZE; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.x = x;
        tile.dataset.y = y;

        tile.addEventListener('click', () => this.handleTileClick(x, y));

        this.gridElement.appendChild(tile);
        this.tiles.push({ x, y, element: tile });
      }
    }
  }

  /**
   * Handle tile click
   */
  handleTileClick(x, y) {
    const result = this.game.probe(x, y);

    if (!result.valid) {
      // Invalid move
      return;
    }

    // Update UI
    this.updateUI();

    // Update tile appearance
    const tile = this.tiles.find(t => t.x === x && t.y === y);
    if (tile) {
      if (result.caught) {
        tile.element.classList.add('caught');
        tile.element.textContent = '🐸';
      } else {
        // Add probed marker and pulse animation
        tile.element.classList.add('probed');
        tile.element.classList.add('just-probed');

        // Remove pulse animation after it completes
        setTimeout(() => {
          tile.element.classList.remove('just-probed');
        }, 600);
      }
    }

    // Update frog display (frogs may have hopped)
    this.updateFrogDisplay();

    // Show game over if needed
    if (result.gameWon || result.gameOver) {
      setTimeout(() => this.showGameOver(), 500);
    }
  }

  /**
   * Toggle debug mode to show/hide frog positions
   */
  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    const button = document.getElementById('debug-button');
    button.textContent = this.debugMode ? 'HIDE FROGS' : 'SHOW FROGS';
    button.classList.toggle('active', this.debugMode);
    this.updateFrogDisplay();
  }

  /**
   * Update the visual display of frog positions
   */
  updateFrogDisplay() {
    if (!this.debugMode) {
      // Remove all frog indicators
      this.tiles.forEach(tile => {
        tile.element.classList.remove('has-frog');
      });
      return;
    }

    // First, remove all frog indicators
    this.tiles.forEach(tile => {
      tile.element.classList.remove('has-frog');
    });

    // Then add indicators for current frog positions
    this.game.frogs.forEach(frog => {
      const tile = this.tiles.find(t => t.x === frog.x && t.y === frog.y);
      if (tile && !tile.element.classList.contains('caught')) {
        tile.element.classList.add('has-frog');
      }
    });
  }

  /**
   * Update all UI elements
   */
  updateUI() {
    const state = this.game.getState();

    // Update game info
    document.getElementById('caught-count').textContent = `${state.caughtFrogs}/${state.totalFrogs}`;
    document.getElementById('move-count').textContent = state.moves;

    const remainingElement = document.getElementById('moves-remaining');
    remainingElement.textContent = state.movesRemaining;

    // Change color based on remaining moves
    remainingElement.className = 'info-value';
    if (state.movesRemaining <= 10) {
      remainingElement.classList.add('danger');
    } else if (state.movesRemaining <= 20) {
      remainingElement.classList.add('warning');
    }

    // Update radiation meter
    this.updateRadiationMeter(state);

    // Update seed display
    document.getElementById('seed-value').textContent = state.seed.toString().padStart(6, '0');

    // Update message
    this.updateMessage(state);
  }

  /**
   * Update radiation meter
   */
  updateRadiationMeter(state) {
    const meterFill = document.getElementById('meter-fill');
    const meterText = document.getElementById('meter-text');
    const trendIndicator = document.getElementById('trend-indicator');

    const percentage = state.normalizedRadiation * 100;
    meterFill.style.width = `${percentage}%`;

    // Color based on radiation level
    let color = '#39ff14'; // green
    if (percentage > 75) {
      color = '#ff0000'; // red
    } else if (percentage > 50) {
      color = '#ff8800'; // orange
    } else if (percentage > 25) {
      color = '#ffff00'; // yellow
    }
    meterFill.style.backgroundColor = color;

    // Update text
    if (state.radiation === 0) {
      meterText.textContent = 'NO SIGNAL';
    } else {
      meterText.textContent = `${Math.round(state.radiation)} RAD`;
    }

    // Update trend indicator
    trendIndicator.innerHTML = '';
    if (state.moves > 1) {
      if (state.trend === 'hotter') {
        trendIndicator.innerHTML = '🔥 HOTTER';
        trendIndicator.className = 'trend-indicator trend-hotter';
      } else if (state.trend === 'colder') {
        trendIndicator.innerHTML = '❄️ COLDER';
        trendIndicator.className = 'trend-indicator trend-colder';
      } else {
        trendIndicator.innerHTML = '➡️ SAME';
        trendIndicator.className = 'trend-indicator trend-same';
      }
    }
  }

  /**
   * Update message area
   */
  updateMessage(state) {
    const messageElement = document.getElementById('message');

    if (state.caughtFrogs === state.totalFrogs) {
      messageElement.textContent = '🎉 All frogs captured! Mission complete!';
      messageElement.className = 'success';
    } else if (state.gameOver) {
      messageElement.textContent = '☠️ Time expired! The frogs have dried up from radiation.';
      messageElement.className = 'danger';
    } else if (state.radiation === 0 && state.moves > 0) {
      messageElement.textContent = 'No radiation detected. Keep searching...';
      messageElement.className = '';
    } else if (state.radiation > 0) {
      const intensity = state.normalizedRadiation;
      if (intensity > 0.75) {
        messageElement.textContent = '☢️ EXTREME RADIATION! A frog is very close!';
        messageElement.className = 'danger';
      } else if (intensity > 0.5) {
        messageElement.textContent = '⚠️ High radiation detected. Getting warm...';
        messageElement.className = 'warning';
      } else if (intensity > 0.25) {
        messageElement.textContent = '📡 Moderate radiation. You\'re on the right track.';
        messageElement.className = '';
      } else {
        messageElement.textContent = '📉 Low radiation detected. Keep searching.';
        messageElement.className = '';
      }
    } else {
      messageElement.textContent = 'Probe the forest to detect radioactive frogs. They hop when scared!';
      messageElement.className = '';
    }
  }

  /**
   * Show game over overlay
   */
  showGameOver() {
    const state = this.game.getState();
    const overlay = document.getElementById('game-over-overlay');
    const content = document.getElementById('game-over-content');
    const title = document.getElementById('game-over-title');
    const stats = document.getElementById('game-over-stats');

    if (state.gameWon) {
      content.className = 'game-over-content won';
      title.textContent = '🎉 MISSION SUCCESS! 🎉';
      stats.innerHTML = `
        <div>All ${state.totalFrogs} frogs captured!</div>
        <div>Moves used: ${state.moves}/${state.maxMoves}</div>
        <div>Efficiency: ${Math.round((state.maxMoves - state.moves) / state.maxMoves * 100)}%</div>
        <div style="margin-top: 10px; font-size: 0.9rem;">Share this level with friends!</div>
      `;
    } else {
      content.className = 'game-over-content lost';
      title.textContent = '☠️ MISSION FAILED ☠️';
      stats.innerHTML = `
        <div>Frogs captured: ${state.caughtFrogs}/${state.totalFrogs}</div>
        <div>Moves used: ${state.moves}/${state.maxMoves}</div>
        <div style="margin-top: 10px;">The frogs dried up from radiation exposure.</div>
        <div style="font-size: 0.9rem;">Try again!</div>
      `;
    }

    overlay.classList.add('show');
  }

  /**
   * Hide game over overlay
   */
  hideGameOver() {
    document.getElementById('game-over-overlay').classList.remove('show');
  }

  /**
   * Reset the current game
   */
  resetGame() {
    this.game.reset();
    this.createGrid();
    this.updateUI();
  }

  /**
   * Start a new game with new seed
   */
  newGame() {
    this.game.newGame();

    // Update URL with new seed
    const url = new URL(window.location);
    url.searchParams.set('seed', this.game.seed);
    window.history.pushState({}, '', url);

    this.createGrid();
    this.updateUI();
  }

  /**
   * Share the current level
   */
  shareLevel() {
    this.copyShareURL();

    const messageElement = document.getElementById('message');
    const originalText = messageElement.textContent;
    const originalClass = messageElement.className;

    messageElement.textContent = '📋 Shareable URL copied to clipboard!';
    messageElement.className = 'success';

    setTimeout(() => {
      messageElement.textContent = originalText;
      messageElement.className = originalClass;
    }, 2000);
  }

  /**
   * Copy shareable URL to clipboard
   */
  copyShareURL() {
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('seed', this.game.seed);

    // Copy to clipboard
    navigator.clipboard.writeText(url.toString()).then(() => {
      console.log('URL copied:', url.toString());
    }).catch(err => {
      console.error('Failed to copy URL:', err);
      // Fallback: create a temporary input element
      const input = document.createElement('input');
      input.value = url.toString();
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    });
  }

  /**
   * Get radiation color based on level
   */
  getRadiationColor(normalized) {
    if (normalized > 0.75) return '#ff0000';
    if (normalized > 0.5) return '#ff8800';
    if (normalized > 0.25) return '#ffff00';
    return '#39ff14';
  }
}

// Initialize game UI
const gameUI = new GameUI();
