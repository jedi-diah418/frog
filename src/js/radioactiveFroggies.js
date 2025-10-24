/**
 * Radioactive Froggies - A puzzle game about finding radioactive frogs
 */

(function(isNode) {

// Import SeededRandom - works in both Node and browser
let SeededRandom;
if (isNode) {
  // Node.js environment (for tests)
  SeededRandom = require('./seededRandom.js');
} else {
  // Browser environment
  SeededRandom = window.SeededRandom;
}

class RadioactiveFroggies {
  constructor(seed = null) {
    // Game constants
    this.GRID_SIZE = 10;
    this.FROG_COUNT = 5;
    this.MAX_MOVES = 50;
    this.RADIATION_RANGE = 5;
    this.FROG_SCARE_RADIUS = 2;
    this.MAX_RADIATION = 18; // For normalization - being near 3 frogs should nearly fill meter

    // Game state
    this.seed = seed || this.generateSeed();
    this.rng = new SeededRandom(this.seed);
    this.moves = 0;
    this.caughtFrogs = 0;
    this.lastRadiation = 0;
    this.previousRadiation = 0;
    this.gameOver = false;
    this.gameWon = false;

    // Grid state
    this.frogs = []; // Array of {x, y} positions
    this.probed = []; // Array of probed positions
    this.caughtPositions = []; // Array of caught frog positions

    // Powerup system
    this.powerups = ['radar']; // Start with 1 radar powerup
    this.hiddenPowerup = null; // Position of hidden powerup

    // Initialize game
    this.initializeFrogs();
    this.initializeHiddenPowerup();
  }

  /**
   * Generate a random seed from current timestamp
   */
  generateSeed() {
    return Math.floor(Math.random() * 1000000);
  }

  /**
   * Initialize frog positions on the grid
   */
  initializeFrogs() {
    const positions = [];

    // Generate all possible positions
    for (let x = 0; x < this.GRID_SIZE; x++) {
      for (let y = 0; y < this.GRID_SIZE; y++) {
        positions.push({ x, y });
      }
    }

    // Shuffle and take first FROG_COUNT positions
    const shuffled = this.rng.shuffle(positions);
    this.frogs = shuffled.slice(0, this.FROG_COUNT).map((pos, index) => {
      // Assign frog types: normal, jumpy, toxic, ninja
      // Distribution: 40% normal, 30% toxic, 20% jumpy, 10% ninja
      const rand = this.rng.next();
      let type;
      if (rand < 0.4) {
        type = 'normal';
      } else if (rand < 0.7) {
        type = 'toxic'; // 2x radiation
      } else if (rand < 0.9) {
        type = 'jumpy'; // Hops 2 tiles
      } else {
        type = 'ninja'; // 0.5x radiation
      }

      return {
        ...pos,
        type: type
      };
    });
  }

  /**
   * Initialize hidden powerup position
   */
  initializeHiddenPowerup() {
    const positions = [];

    // Generate all possible positions
    for (let x = 0; x < this.GRID_SIZE; x++) {
      for (let y = 0; y < this.GRID_SIZE; y++) {
        // Don't place powerup on frog positions
        if (!this.frogs.some(f => f.x === x && f.y === y)) {
          positions.push({ x, y });
        }
      }
    }

    // Shuffle and take first position
    const shuffled = this.rng.shuffle(positions);
    this.hiddenPowerup = shuffled[0];
  }

  /**
   * Calculate Manhattan distance between two points
   */
  manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  /**
   * Calculate radiation level at a given position
   * Higher radiation means closer to frogs
   */
  calculateRadiation(x, y) {
    let radiation = 0;

    for (const frog of this.frogs) {
      const distance = this.manhattanDistance(x, y, frog.x, frog.y);

      if (distance <= this.RADIATION_RANGE) {
        // Radiation intensity decreases with distance
        // Formula: (RADIATION_RANGE + 1 - distance)
        let frogRadiation = (this.RADIATION_RANGE + 1 - distance);

        // Apply frog type multipliers
        if (frog.type === 'toxic') {
          frogRadiation *= 2; // Toxic frogs give 2x radiation
        } else if (frog.type === 'ninja') {
          frogRadiation *= 0.5; // Ninja frogs give 0.5x radiation
        }

        radiation += frogRadiation;
      }
    }

    return radiation;
  }

  /**
   * Check if a frog is at the given position
   */
  isFrogAt(x, y) {
    return this.frogs.findIndex(frog => frog.x === x && frog.y === y);
  }

  /**
   * Check if position has been probed
   */
  isProbed(x, y) {
    return this.probed.some(pos => pos.x === x && pos.y === y);
  }

  /**
   * Check if a frog was caught at this position
   */
  isCaughtAt(x, y) {
    return this.caughtPositions.some(pos => pos.x === x && pos.y === y);
  }

  /**
   * Make frogs hop away if probed nearby but missed
   */
  makeFrogsHop(probeX, probeY) {
    const newFrogPositions = [];

    for (const frog of this.frogs) {
      const distance = this.manhattanDistance(probeX, probeY, frog.x, frog.y);

      // If probe is within scare radius, frog hops away
      if (distance > 0 && distance <= this.FROG_SCARE_RADIUS) {
        // Jumpy frogs hop 2 tiles, others hop 1
        const hopDistance = frog.type === 'jumpy' ? 2 : 1;
        let newX = frog.x;
        let newY = frog.y;
        let attempts = 0;
        const maxAttempts = 20;

        // Try to find a valid hop position
        while (attempts < maxAttempts) {
          // Random direction
          const dx = this.rng.nextInt(-hopDistance, hopDistance);
          const dy = hopDistance - Math.abs(dx);
          const dySign = this.rng.nextInt(0, 1) === 0 ? -1 : 1;

          newX = frog.x + dx;
          newY = frog.y + (dy * dySign);

          // Check if position is valid, not occupied, and not the just-probed location
          if (newX >= 0 && newX < this.GRID_SIZE &&
              newY >= 0 && newY < this.GRID_SIZE &&
              !(newX === probeX && newY === probeY) &&
              !newFrogPositions.some(f => f.x === newX && f.y === newY) &&
              !this.frogs.some(f => f.x === newX && f.y === newY && f !== frog)) {
            break;
          }

          attempts++;
        }

        // If we couldn't find a valid position, frog stays put
        if (attempts >= maxAttempts) {
          newX = frog.x;
          newY = frog.y;
        }

        newFrogPositions.push({ x: newX, y: newY });
      } else {
        newFrogPositions.push({ x: frog.x, y: frog.y });
      }
    }

    this.frogs = newFrogPositions;
  }

  /**
   * Probe a tile at the given position
   * Returns object with result info
   */
  probe(x, y) {
    // Validate position
    if (x < 0 || x >= this.GRID_SIZE || y < 0 || y >= this.GRID_SIZE) {
      return { valid: false, message: 'Invalid position' };
    }

    // Check if game is over
    if (this.gameOver) {
      return { valid: false, message: 'Game is over' };
    }

    // Allow re-probing tiles (no longer blocking already probed tiles)

    // Check if powerup is here
    let foundPowerup = false;
    if (this.hiddenPowerup && this.hiddenPowerup.x === x && this.hiddenPowerup.y === y) {
      // Randomly give either radar or mega-probe
      const powerupTypes = ['radar', 'mega-probe'];
      const randomType = powerupTypes[Math.floor(this.rng.next() * powerupTypes.length)];
      this.powerups.push(randomType);
      this.hiddenPowerup = null;
      foundPowerup = true;
    }

    // Check if frog is here
    const frogIndex = this.isFrogAt(x, y);

    if (frogIndex !== -1) {
      // Caught a frog!
      const caughtFrog = this.frogs[frogIndex];
      this.frogs.splice(frogIndex, 1);
      this.caughtFrogs++;
      this.caughtPositions.push({ x, y, type: caughtFrog.type });
      this.probed.push({ x, y });
      this.moves++;

      // Store radiation for display
      this.previousRadiation = this.lastRadiation;
      this.lastRadiation = 0;

      // Check win condition
      if (this.caughtFrogs === this.FROG_COUNT) {
        this.gameWon = true;
        this.gameOver = true;
      }

      return {
        valid: true,
        caught: true,
        frogType: caughtFrog.type,
        radiation: 0,
        foundPowerup: foundPowerup,
        message: `Caught a frog! ${this.caughtFrogs}/${this.FROG_COUNT}`,
        gameWon: this.gameWon
      };
    } else {
      // No frog here, calculate radiation BEFORE frogs hop
      const initialRadiation = this.calculateRadiation(x, y);
      this.previousRadiation = this.lastRadiation;
      this.probed.push({ x, y });
      this.moves++;

      // Make nearby frogs hop away
      this.makeFrogsHop(x, y);

      // Calculate radiation AFTER frogs hop
      const finalRadiation = this.calculateRadiation(x, y);
      this.lastRadiation = finalRadiation;

      // Check lose condition
      if (this.moves >= this.MAX_MOVES) {
        this.gameOver = true;
      }

      return {
        valid: true,
        caught: false,
        radiation: finalRadiation,
        initialRadiation: initialRadiation,
        finalRadiation: finalRadiation,
        foundPowerup: foundPowerup,
        message: finalRadiation > 0 ? 'Detecting radiation...' : 'No radiation detected',
        gameOver: this.gameOver && !this.gameWon
      };
    }
  }

  /**
   * Mega probe - captures frogs in a 3x3 area
   */
  megaProbe(x, y) {
    // Validate position
    if (x < 0 || x >= this.GRID_SIZE || y < 0 || y >= this.GRID_SIZE) {
      return { valid: false, message: 'Invalid position' };
    }

    // Check if game is over
    if (this.gameOver) {
      return { valid: false, message: 'Game is over' };
    }

    // Check if powerup is here (only at center tile)
    let foundPowerup = false;
    if (this.hiddenPowerup && this.hiddenPowerup.x === x && this.hiddenPowerup.y === y) {
      // Randomly give either radar or mega-probe
      const powerupTypes = ['radar', 'mega-probe'];
      const randomType = powerupTypes[Math.floor(this.rng.next() * powerupTypes.length)];
      this.powerups.push(randomType);
      this.hiddenPowerup = null;
      foundPowerup = true;
    }

    // Check for frogs in 3x3 area
    const caughtFrogs = [];
    const probedPositions = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = x + dx;
        const checkY = y + dy;

        // Skip out of bounds positions
        if (checkX < 0 || checkX >= this.GRID_SIZE || checkY < 0 || checkY >= this.GRID_SIZE) {
          continue;
        }

        // Mark as probed
        probedPositions.push({ x: checkX, y: checkY });

        // Check for frog
        const frogIndex = this.isFrogAt(checkX, checkY);
        if (frogIndex !== -1) {
          const caughtFrog = this.frogs[frogIndex];
          caughtFrogs.push({ x: checkX, y: checkY, type: caughtFrog.type });
          this.frogs.splice(frogIndex, 1);
          this.caughtFrogs++;
          this.caughtPositions.push({ x: checkX, y: checkY, type: caughtFrog.type });
        }
      }
    }

    // Add all probed positions
    probedPositions.forEach(pos => this.probed.push(pos));
    this.moves++;

    // Store radiation
    this.previousRadiation = this.lastRadiation;
    this.lastRadiation = 0;

    // Check win condition
    if (this.caughtFrogs >= this.FROG_COUNT) {
      this.gameWon = true;
      this.gameOver = true;
    }

    // Check lose condition
    if (this.moves >= this.MAX_MOVES) {
      this.gameOver = true;
    }

    return {
      valid: true,
      megaProbe: true,
      caughtFrogs: caughtFrogs,
      caughtCount: caughtFrogs.length,
      probedPositions: probedPositions,
      foundPowerup: foundPowerup,
      message: caughtFrogs.length > 0 ?
        `Mega probe captured ${caughtFrogs.length} frog${caughtFrogs.length > 1 ? 's' : ''}! ${this.caughtFrogs}/${this.FROG_COUNT}` :
        'No frogs in mega probe area',
      gameWon: this.gameWon,
      gameOver: this.gameOver && !this.gameWon
    };
  }

  /**
   * Use a powerup
   */
  usePowerup(powerupType) {
    const index = this.powerups.indexOf(powerupType);
    if (index === -1) {
      return { valid: false, message: 'Powerup not available' };
    }

    // Remove powerup from inventory
    this.powerups.splice(index, 1);

    if (powerupType === 'radar') {
      return {
        valid: true,
        type: 'radar',
        frogPositions: this.frogs.map(f => ({ x: f.x, y: f.y }))
      };
    }

    return { valid: false, message: 'Unknown powerup type' };
  }

  /**
   * Make all frogs hop (for radar powerup)
   */
  makeAllFrogsHop() {
    // Make frogs hop twice by calling this twice
    // Use center of grid as "probe" position so frogs scatter
    const centerX = Math.floor(this.GRID_SIZE / 2);
    const centerY = Math.floor(this.GRID_SIZE / 2);

    // Just hop randomly, not based on any particular scare location
    const newFrogPositions = [];

    for (const frog of this.frogs) {
      const hopDistance = 1;
      let newX = frog.x;
      let newY = frog.y;
      let attempts = 0;
      const maxAttempts = 20;

      // Try to find a valid hop position
      while (attempts < maxAttempts) {
        const dx = this.rng.nextInt(-hopDistance, hopDistance);
        const dy = hopDistance - Math.abs(dx);
        const dySign = this.rng.nextInt(0, 1) === 0 ? -1 : 1;

        newX = frog.x + dx;
        newY = frog.y + (dy * dySign);

        // Check if position is valid and not occupied
        if (newX >= 0 && newX < this.GRID_SIZE &&
            newY >= 0 && newY < this.GRID_SIZE &&
            !newFrogPositions.some(f => f.x === newX && f.y === newY) &&
            !this.frogs.some(f => f.x === newX && f.y === newY && f !== frog)) {
          break;
        }

        attempts++;
      }

      // If we couldn't find a valid position, frog stays put
      if (attempts >= maxAttempts) {
        newX = frog.x;
        newY = frog.y;
      }

      newFrogPositions.push({ x: newX, y: newY });
    }

    this.frogs = newFrogPositions;
  }

  /**
   * Get radiation change indicator (hotter/colder)
   */
  getRadiationTrend() {
    if (this.moves <= 1) return 'neutral';

    const diff = this.lastRadiation - this.previousRadiation;
    if (diff > 0) return 'hotter';
    if (diff < 0) return 'colder';
    return 'same';
  }

  /**
   * Get normalized radiation level (0-1)
   */
  getNormalizedRadiation() {
    return Math.min(this.lastRadiation / this.MAX_RADIATION, 1);
  }

  /**
   * Get current game state
   */
  getState() {
    return {
      seed: this.seed,
      moves: this.moves,
      maxMoves: this.MAX_MOVES,
      caughtFrogs: this.caughtFrogs,
      totalFrogs: this.FROG_COUNT,
      radiation: this.lastRadiation,
      normalizedRadiation: this.getNormalizedRadiation(),
      trend: this.getRadiationTrend(),
      gameOver: this.gameOver,
      gameWon: this.gameWon,
      movesRemaining: this.MAX_MOVES - this.moves,
      powerups: this.powerups.slice(), // Return copy of powerups array
      hasPowerup: this.powerups.length > 0
    };
  }

  /**
   * Reset the game with the same seed
   */
  reset() {
    this.rng = new SeededRandom(this.seed);
    this.moves = 0;
    this.caughtFrogs = 0;
    this.lastRadiation = 0;
    this.previousRadiation = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.frogs = [];
    this.probed = [];
    this.caughtPositions = [];
    this.powerups = ['radar'];
    this.hiddenPowerup = null;
    this.initializeFrogs();
    this.initializeHiddenPowerup();
  }

  /**
   * Start a new game with a new seed
   */
  newGame(seed = null) {
    this.seed = seed || this.generateSeed();
    this.reset();
  }
}

// Export for Node.js or browser
if (isNode) {
  module.exports = RadioactiveFroggies;
} else {
  window.RadioactiveFroggies = RadioactiveFroggies;
}

})(typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require === 'function');
