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
    this.achievementManager = new AchievementManager(); // Achievement tracking
    this.soundManager = new SoundManager(); // Sound effects
    this.dailyChallenge = new DailyChallenge(); // Daily challenge tracking
    this.currentGameMisses = 0; // Track misses for perfect game
    this.isDailyChallenge = false; // Track if current game is daily challenge

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

    document.getElementById('sound-button').addEventListener('click', () => {
      this.toggleSound();
    });

    document.getElementById('daily-challenge-button').addEventListener('click', () => {
      this.loadDailyChallenge();
    });

    document.getElementById('stats-button').addEventListener('click', () => {
      this.showStats();
    });

    // Powerup listeners
    document.getElementById('powerup-radar').addEventListener('click', () => {
      this.useRadarPowerup();
    });

    document.getElementById('powerup-mega-probe').addEventListener('click', () => {
      this.activateMegaProbe();
    });

    // Update sound button text on init
    this.updateSoundButton();
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
        tile.element.classList.add('caught', `frog-${result.frogType}`);
        tile.element.textContent = '🐸';

        // Play ribbit sound
        this.soundManager.ribbit();

        // Achievement: Lucky Shot - catch on first probe
        if (this.game.moves === 1) {
          const achievements = this.achievementManager.recordFirstProbeCatch();
          this.showAchievementNotifications(achievements);
        }

        // Update frog display for caught frogs
        this.updateFrogDisplay();
      } else {
        // Track miss for perfect game achievement
        this.currentGameMisses++;

        // Play geiger click based on radiation level
        const maxRadiation = this.game.FROG_COUNT * (this.game.RADIATION_RANGE + 1);
        const intensity = result.finalRadiation / maxRadiation;
        this.soundManager.geigerClick(intensity);

        // Don't mark tiles as probed - let them look normal
        // Just show pulse animation for feedback
        tile.element.classList.add('just-probed');

        // If zero radiation, show "CLEAR" indicator
        if (result.finalRadiation === 0) {
          const clearIndicator = document.createElement('div');
          clearIndicator.className = 'radiation-clear';
          clearIndicator.textContent = 'CLEAR';
          tile.element.appendChild(clearIndicator);

          // Remove clear indicator after animation
          setTimeout(() => {
            clearIndicator.remove();
          }, 1500);
        }

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

      // Track powerup found
      if (result.foundPowerup) {
        this.soundManager.powerup();
        const achievements = this.achievementManager.recordPowerupFound();
        this.showAchievementNotifications(achievements);
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
      tile.element.classList.remove('has-frog', 'frog-normal', 'frog-toxic', 'frog-jumpy', 'frog-ninja');
    });

    // Then add indicators for current frog positions
    this.game.frogs.forEach(frog => {
      const tile = this.tiles.find(t => t.x === frog.x && t.y === frog.y);
      if (tile && !tile.element.classList.contains('caught')) {
        tile.element.classList.add('has-frog', `frog-${frog.type}`);
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

    // Track powerup usage for achievements
    const achievements = this.achievementManager.recordPowerupUsed();
    this.showAchievementNotifications(achievements);

    // Disable tile clicks during animation
    this.gridElement.style.pointerEvents = 'none';

    // Play radar sweep sound
    this.soundManager.radarSweep();

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

    // Track powerup usage for achievements
    const achievements = this.achievementManager.recordPowerupUsed();
    this.showAchievementNotifications(achievements);

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
    // Play explosion sound
    this.soundManager.explosion();

    // Update UI
    this.updateUI();

    // Track mega-probe capture for achievements
    if (result.caughtCount > 0) {
      const achievements = this.achievementManager.recordMegaProbeCapture(result.caughtCount);
      this.showAchievementNotifications(achievements);
    }

    // Track powerup found
    if (result.foundPowerup) {
      this.soundManager.powerup();
      const achievements = this.achievementManager.recordPowerupFound();
      this.showAchievementNotifications(achievements);
    }

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
          tile.element.classList.add('caught', `frog-${pos.type}`);
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

    // Record game for achievements
    const wasPerfect = this.currentGameMisses === 0 && state.gameWon;
    const achievements = this.achievementManager.recordGame(
      state.gameWon,
      state.moves,
      state.probed.length,
      state.caughtFrogs,
      wasPerfect
    );

    // Record daily challenge completion if applicable
    if (this.isDailyChallenge && state.gameWon) {
      this.dailyChallenge.recordCompletion(state.moves);
      this.updateDailyChallengeDisplay();
    }

    if (state.gameWon) {
      content.className = 'game-over-content won';
      title.textContent = '🎉 MISSION SUCCESS! 🎉';

      let statsContent = `
        <div>All ${state.totalFrogs} frogs captured!</div>
        <div>Moves used: ${state.moves}/${state.maxMoves}</div>
        <div>Efficiency: ${Math.round((state.maxMoves - state.moves) / state.maxMoves * 100)}%</div>
      `;

      // Add daily challenge info if applicable
      if (this.isDailyChallenge) {
        const dailyStats = this.dailyChallenge.getTodaysStats();
        statsContent += `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
            <strong>🏆 Daily Challenge Complete!</strong>
          </div>
          <div>Completions today: ${dailyStats.completions.count}</div>
          <div>Your best: ${dailyStats.completions.bestMoves} moves</div>
        `;
      } else {
        statsContent += `<div style="margin-top: 10px; font-size: 0.9rem;">Share this level with friends!</div>`;
      }

      stats.innerHTML = statsContent;
      // Play success sound
      setTimeout(() => this.soundManager.success(), 500);
    } else {
      content.className = 'game-over-content lost';
      title.textContent = '☠️ MISSION FAILED ☠️';
      stats.innerHTML = `
        <div>Frogs captured: ${state.caughtFrogs}/${state.totalFrogs}</div>
        <div>Moves used: ${state.moves}/${state.maxMoves}</div>
        <div style="margin-top: 10px;">The frogs dried up from radiation exposure.</div>
        <div style="font-size: 0.9rem;">Try again!</div>
      `;
      // Play failure sound
      setTimeout(() => this.soundManager.failure(), 500);
    }

    // Show achievements unlocked this game
    this.showGameOverAchievements(achievements);

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
    this.currentGameMisses = 0;
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
    this.currentGameMisses = 0;
    this.isDailyChallenge = false;

    // Hide daily challenge banner
    document.getElementById('daily-challenge-banner').style.display = 'none';

    // Update URL with new seed
    const url = new URL(window.location);
    url.searchParams.set('seed', this.game.seed);
    url.searchParams.delete('daily');
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

  /**
   * Show achievement notification toasts
   */
  showAchievementNotifications(achievements) {
    if (!achievements || achievements.length === 0) {
      return;
    }

    const toast = document.getElementById('achievement-toast');
    const icon = toast.querySelector('.achievement-icon');
    const name = toast.querySelector('.achievement-name');

    // Show each achievement with delay
    achievements.forEach((achievement, index) => {
      setTimeout(() => {
        icon.textContent = achievement.icon;
        name.textContent = achievement.name;
        toast.classList.add('show');

        // Play achievement sound
        this.soundManager.achievement();

        // Hide after 3 seconds
        setTimeout(() => {
          toast.classList.remove('show');
        }, 3000);
      }, index * 3500); // Stagger multiple achievements
    });
  }

  /**
   * Show achievements in game over screen
   */
  showGameOverAchievements(newAchievements) {
    const container = document.getElementById('achievements-unlocked');

    if (!newAchievements || newAchievements.length === 0) {
      container.innerHTML = '';
      return;
    }

    let html = '<h3>🏆 Achievements Unlocked!</h3>';

    newAchievements.forEach(achievement => {
      html += `
        <div class="achievement-item">
          <div class="achievement-item-icon">${achievement.icon}</div>
          <div class="achievement-item-text">
            <div class="achievement-item-name">${achievement.name}</div>
            <div class="achievement-item-description">${achievement.description}</div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Toggle sound on/off
   */
  toggleSound() {
    this.soundManager.toggleMute();
    this.updateSoundButton();
    this.soundManager.blip();
  }

  /**
   * Update sound button text
   */
  updateSoundButton() {
    const button = document.getElementById('sound-button');
    button.textContent = this.soundManager.muted ? '🔇 SOUND' : '🔊 SOUND';
  }

  /**
   * Load today's daily challenge
   */
  loadDailyChallenge() {
    const seed = this.dailyChallenge.getTodaysSeed();
    const stats = this.dailyChallenge.getTodaysStats();

    // Start game with today's seed
    this.game = new RadioactiveFroggies(seed);
    this.isDailyChallenge = true;
    this.currentGameMisses = 0;

    // Record attempt
    this.dailyChallenge.recordAttempt();

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('seed', seed);
    url.searchParams.set('daily', 'true');
    window.history.pushState({}, '', url);

    // Update UI
    this.createGrid();
    this.updateUI();
    this.updateDailyChallengeDisplay();

    // Show banner
    const banner = document.getElementById('daily-challenge-banner');
    banner.style.display = 'block';

    // Hide game over if showing
    this.hideGameOver();

    // Show message
    const messageElement = document.getElementById('message');
    messageElement.textContent = '🏆 Daily Challenge loaded! Can you beat it?';
    messageElement.className = 'success';
  }

  /**
   * Update daily challenge banner display
   */
  updateDailyChallengeDisplay() {
    const stats = this.dailyChallenge.getTodaysStats();
    const statsElement = document.getElementById('daily-challenge-stats');

    let statsText = `Today: ${stats.date}`;

    if (stats.completions.count > 0) {
      statsText += ` | Completed ${stats.completions.count}x | Best: ${stats.completions.bestMoves} moves`;
    } else {
      statsText += ` | Not completed yet`;
    }

    if (stats.attempts > 0) {
      statsText += ` | Attempts: ${stats.attempts}`;
    }

    statsElement.textContent = statsText;
  }

  /**
   * Show statistics dashboard
   */
  showStats() {
    // Get achievement stats
    const achievementStats = this.achievementManager.getStats();
    const allAchievements = this.achievementManager.getAllAchievements();
    const unlockedCount = allAchievements.filter(a => a.unlocked).length;

    // Get daily challenge stats
    const dailyStats = this.dailyChallenge.getTodaysStats();
    const streak = this.dailyChallenge.getStreak();
    const totalDays = this.dailyChallenge.getTotalDaysCompleted();

    // Create stats display
    let statsHTML = `
      <h2>📊 STATISTICS</h2>
      <div class="stats-section">
        <h3>🎮 Game Stats</h3>
        <div>Total Games: ${achievementStats.totalGames}</div>
        <div>Total Wins: ${achievementStats.totalWins}</div>
        <div>Win Rate: ${achievementStats.totalGames > 0 ? Math.round((achievementStats.totalWins / achievementStats.totalGames) * 100) : 0}%</div>
        <div>Total Frogs Caught: ${achievementStats.totalFrogsCaught}</div>
        <div>Best Moves: ${achievementStats.bestMoves === Infinity ? 'N/A' : achievementStats.bestMoves}</div>
        <div>Best Accuracy: ${achievementStats.bestAccuracy}%</div>
        <div>Perfect Games: ${achievementStats.perfectGames}</div>
        <div>Win Streak: ${achievementStats.currentWinStreak} (Best: ${achievementStats.maxWinStreak})</div>
      </div>
      <div class="stats-section">
        <h3>🏆 Daily Challenge</h3>
        <div>Current Streak: ${streak} days</div>
        <div>Total Days Completed: ${totalDays}</div>
        <div>Today's Attempts: ${dailyStats.attempts}</div>
        ${dailyStats.completions.count > 0 ?
          `<div>Today's Best: ${dailyStats.completions.bestMoves} moves</div>` :
          '<div>Not completed today</div>'}
      </div>
      <div class="stats-section">
        <h3>🏅 Achievements</h3>
        <div>Unlocked: ${unlockedCount}/${allAchievements.length}</div>
        <div>Powerups Used: ${achievementStats.powerupsUsed}</div>
        <div>Powerups Found: ${achievementStats.powerupsFound}</div>
        <div>Max Mega-Probe Capture: ${achievementStats.maxMegaProbeCapture}</div>
      </div>
    `;

    // Show in game over overlay (reusing it as modal)
    const overlay = document.getElementById('game-over-overlay');
    const content = document.getElementById('game-over-content');
    const title = document.getElementById('game-over-title');
    const stats = document.getElementById('game-over-stats');
    const achievements = document.getElementById('achievements-unlocked');

    content.className = 'game-over-content stats';
    title.textContent = '📊 STATISTICS';
    stats.innerHTML = statsHTML;
    achievements.innerHTML = '';

    overlay.classList.add('show');
  }
}

// Initialize game UI
const gameUI = new GameUI();
