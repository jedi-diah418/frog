/**
 * UI Controller for Radioactive Froggies
 */

class GameUI {
  constructor() {
    this.game = null;
    this.gridElement = null;
    this.tiles = [];
    this.debugMode = false; // Show frog positions
    this.megaProbeActive = false; // Track if mega-probe is active

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

    // Powerup listeners
    document.getElementById('powerup-radar').addEventListener('click', () => {
      this.useRadarPowerup();
    });

    document.getElementById('powerup-mega-probe').addEventListener('click', () => {
      this.activateMegaProbe();
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
        tile.addEventListener('mouseenter', () => this.handleTileHover(x, y));
        tile.addEventListener('mouseleave', () => this.clearMegaProbeHighlight());

        this.gridElement.appendChild(tile);
        this.tiles.push({ x, y, element: tile });
      }
    }
  }

  /**
   * Handle tile click
   */
  handleTileClick(x, y) {
    // Use mega-probe if active
    const result = this.megaProbeActive ? this.game.megaProbe(x, y) : this.game.probe(x, y);

    if (!result.valid) {
      // Invalid move
      return;
    }

    // If mega-probe was used, deactivate it and clear highlights
    if (this.megaProbeActive) {
      this.megaProbeActive = false;
      this.clearMegaProbeHighlight();
      document.getElementById('game-grid').style.cursor = 'default';

      // Handle mega-probe result
      if (result.megaProbe) {
        this.handleMegaProbeResult(result);
        return;
      }
    }

    // Update UI immediately (move count, etc.)
    this.updateUI();

    // Update tile appearance
    const tile = this.tiles.find(t => t.x === x && t.y === y);
    if (tile) {
      // Remove powerup indicator if it was there
      if (result.foundPowerup) {
        tile.element.classList.remove('has-powerup');
        // Show powerup found message - check which type was found
        const state = this.game.getState();
        const lastPowerup = state.powerups[state.powerups.length - 1];
        const messageElement = document.getElementById('message');
        const originalText = messageElement.textContent;
        const originalClass = messageElement.className;

        if (lastPowerup === 'mega-probe') {
          messageElement.textContent = '🎯 Found a Mega Probe powerup!';
        } else {
          messageElement.textContent = '📡 Found a Sweeping Radar powerup!';
        }
        messageElement.className = 'success';
        setTimeout(() => {
          messageElement.textContent = originalText;
          messageElement.className = originalClass;
        }, 2000);
      }

      if (result.caught) {
        tile.element.classList.add('caught');
        tile.element.textContent = '🐸';

        // Update frog display for caught frogs
        this.updateFrogDisplay();
      } else {
        // Don't mark tiles as probed - let them look normal
        // Just show pulse animation for feedback
        tile.element.classList.add('just-probed');

        // Remove pulse animation after it completes
        setTimeout(() => {
          tile.element.classList.remove('just-probed');
        }, 600);

        // Show initial radiation (before frogs hopped)
        this.showRadiationIndicators(x, y, result.initialRadiation, true);

        // After initial animation, show final radiation (after frogs hopped)
        setTimeout(() => {
          this.showRadiationIndicators(x, y, result.finalRadiation, false);

          // Update frog display after both animations
          this.updateFrogDisplay();
        }, 1000);
      }
    }

    // Show game over if needed
    if (result.gameWon || result.gameOver) {
      setTimeout(() => this.showGameOver(), 2000);
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
   * Show radiation indicators on surrounding tiles
   */
  showRadiationIndicators(probeX, probeY, centerRadiation, isInitial) {
    // Define all 8 surrounding directions plus orthogonal distance-2 tiles
    const directions = [
      // Adjacent tiles (distance 1)
      { dx: -1, dy: 0 },  // left
      { dx: 1, dy: 0 },   // right
      { dx: 0, dy: -1 },  // up
      { dx: 0, dy: 1 },   // down
      { dx: -1, dy: -1 }, // up-left
      { dx: 1, dy: -1 },  // up-right
      { dx: -1, dy: 1 },  // down-left
      { dx: 1, dy: 1 },   // down-right
      // Distance 2 orthogonal (for better directional indication)
      { dx: -2, dy: 0 },  // far left
      { dx: 2, dy: 0 },   // far right
      { dx: 0, dy: -2 },  // far up
      { dx: 0, dy: 2 }    // far down
    ];

    directions.forEach(({ dx, dy }, index) => {
      const x = probeX + dx;
      const y = probeY + dy;

      // Check if position is valid
      if (x < 0 || x >= this.game.GRID_SIZE || y < 0 || y >= this.game.GRID_SIZE) {
        return;
      }

      // Find the tile
      const tile = this.tiles.find(t => t.x === x && t.y === y);

      // Skip tiles that are caught or already probed
      if (!tile ||
          tile.element.classList.contains('caught') ||
          this.game.isProbed(x, y)) {
        return;
      }

      // Calculate radiation at this position
      const radiation = this.game.calculateRadiation(x, y);

      if (radiation > 0) {
        // Calculate normalized radiation for this tile
        const normalized = Math.min(radiation / this.game.MAX_RADIATION, 1);

        // Get color based on radiation intensity
        const color = this.getRadiationColor(normalized);

        // Apply visual indicator with delay based on distance
        const distance = Math.abs(dx) + Math.abs(dy);
        const delay = distance * 50; // 50ms per tile distance for ripple effect

        setTimeout(() => {
          // Double-check tile hasn't been probed while we were waiting
          if (this.game.isProbed(x, y) ||
              tile.element.classList.contains('caught')) {
            return;
          }

          // Apply radiation color with higher specificity
          tile.element.style.backgroundColor = color;
          tile.element.style.borderColor = color;
          tile.element.style.boxShadow = `0 0 10px ${color}`;
          tile.element.classList.add('radiation-indicator');

          // Add visual indicator for initial vs final
          if (isInitial) {
            tile.element.style.opacity = '0.7';
          }

          // Remove animation and clear inline styles after animation completes
          setTimeout(() => {
            tile.element.classList.remove('radiation-indicator');
            // Remove inline styles to let CSS classes take over
            tile.element.style.backgroundColor = '';
            tile.element.style.borderColor = '';
            tile.element.style.boxShadow = '';
            tile.element.style.opacity = '';
          }, 800);
        }, delay);
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

    // Update powerup display
    this.updatePowerupDisplay();
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
   * Update powerup display
   */
  updatePowerupDisplay() {
    const state = this.game.getState();
    const radarCount = state.powerups.filter(p => p === 'radar').length;
    const megaProbeCount = state.powerups.filter(p => p === 'mega-probe').length;

    // Update radar count
    document.getElementById('radar-count').textContent = radarCount;

    // Update radar disabled state
    const radarElement = document.getElementById('powerup-radar');
    if (radarCount === 0) {
      radarElement.classList.add('disabled');
    } else {
      radarElement.classList.remove('disabled');
    }

    // Update mega-probe count
    document.getElementById('mega-probe-count').textContent = megaProbeCount;

    // Update mega-probe disabled state
    const megaProbeElement = document.getElementById('powerup-mega-probe');
    if (megaProbeCount === 0) {
      megaProbeElement.classList.add('disabled');
    } else {
      megaProbeElement.classList.remove('disabled');
    }

    // Powerups are hidden - no visual indication on tiles
    this.tiles.forEach(tile => {
      tile.element.classList.remove('has-powerup');
    });
  }

  /**
   * Use radar powerup
   */
  useRadarPowerup() {
    const result = this.game.usePowerup('radar');

    if (!result.valid) {
      return;
    }

    // Disable tile clicks during animation
    this.gridElement.style.pointerEvents = 'none';

    // Show radar sweep animation on all tiles
    this.tiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.element.classList.add('radar-sweep');
        setTimeout(() => {
          tile.element.classList.remove('radar-sweep');
        }, 500);
      }, index * 10); // Stagger animation
    });

    // Reveal frog positions after sweep
    setTimeout(() => {
      result.frogPositions.forEach(pos => {
        const tile = this.tiles.find(t => t.x === pos.x && t.y === pos.y);
        if (tile) {
          tile.element.classList.add('has-frog');
          tile.element.style.background = 'rgba(255, 0, 0, 0.5)';
        }
      });

      // Show message
      const messageElement = document.getElementById('message');
      messageElement.textContent = '📡 Radar sweep complete! Frogs detected. They\'re hopping away!';
      messageElement.className = 'warning';
    }, 1000);

    // Make frogs hop twice
    setTimeout(() => {
      this.game.makeAllFrogsHop();
    }, 1500);

    setTimeout(() => {
      this.game.makeAllFrogsHop();
    }, 2000);

    // Clear frog indicators and re-enable clicks
    setTimeout(() => {
      this.tiles.forEach(tile => {
        tile.element.classList.remove('has-frog');
        tile.element.style.background = '';
      });

      // Re-enable tile clicks
      this.gridElement.style.pointerEvents = '';

      // Update UI
      this.updateUI();
      this.updateFrogDisplay();
    }, 2500);
  }

  /**
   * Activate mega-probe mode
   */
  activateMegaProbe() {
    const result = this.game.usePowerup('mega-probe');

    if (!result.valid) {
      return;
    }

    // Set mega-probe active flag
    this.megaProbeActive = true;

    // Change cursor to indicate mega-probe mode
    document.getElementById('game-grid').style.cursor = 'crosshair';

    // Show message
    const messageElement = document.getElementById('message');
    messageElement.textContent = '🎯 Mega Probe activated! Click a tile to capture frogs in a 3x3 area.';
    messageElement.className = 'success';
  }

  /**
   * Handle tile hover for mega-probe preview
   */
  handleTileHover(x, y) {
    if (!this.megaProbeActive) {
      return;
    }

    // Clear previous highlights
    this.clearMegaProbeHighlight();

    // Highlight 3x3 area
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;

        // Skip out of bounds
        if (checkX < 0 || checkX >= this.game.GRID_SIZE || checkY < 0 || checkY >= this.game.GRID_SIZE) {
          continue;
        }

        const tile = this.tiles.find(t => t.x === checkX && t.y === checkY);
        if (tile) {
          if (dx === 0 && dy === 0) {
            tile.element.classList.add('mega-probe-center');
          } else {
            tile.element.classList.add('mega-probe-highlight');
          }
        }
      }
    }
  }

  /**
   * Clear mega-probe highlight
   */
  clearMegaProbeHighlight() {
    this.tiles.forEach(tile => {
      tile.element.classList.remove('mega-probe-highlight', 'mega-probe-center');
    });
  }

  /**
   * Handle mega-probe result
   */
  handleMegaProbeResult(result) {
    // Update UI
    this.updateUI();

    // Show capture animation on all probed tiles
    result.probedPositions.forEach(pos => {
      const tile = this.tiles.find(t => t.x === pos.x && t.y === pos.y);
      if (tile) {
        tile.element.classList.add('mega-probe-capture');
        setTimeout(() => {
          tile.element.classList.remove('mega-probe-capture');
        }, 800);
      }
    });

    // Mark caught frogs
    result.caughtFrogs.forEach(pos => {
      const tile = this.tiles.find(t => t.x === pos.x && t.y === pos.y);
      if (tile) {
        setTimeout(() => {
          tile.element.classList.add('caught');
          tile.element.textContent = '🐸';
        }, 400);
      }
    });

    // Show result message
    setTimeout(() => {
      const messageElement = document.getElementById('message');
      messageElement.textContent = result.message;
      messageElement.className = result.caughtCount > 0 ? 'success' : 'warning';

      // Update frog display
      this.updateFrogDisplay();
    }, 800);

    // Show powerup found message if applicable
    if (result.foundPowerup) {
      setTimeout(() => {
        const state = this.game.getState();
        const lastPowerup = state.powerups[state.powerups.length - 1];
        const messageElement = document.getElementById('message');

        if (lastPowerup === 'mega-probe') {
          messageElement.textContent = '🎯 Found a Mega Probe powerup!';
        } else {
          messageElement.textContent = '📡 Found a Sweeping Radar powerup!';
        }
        messageElement.className = 'success';
      }, 2000);
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
    this.megaProbeActive = false;
    this.clearMegaProbeHighlight();
    document.getElementById('game-grid').style.cursor = 'default';
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
