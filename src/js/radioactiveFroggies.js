/**
 * Radioactive Froggies - A puzzle game about finding radioactive frogs
 */

// Import SeededRandom - works in both Node and browser
let SeededRandom;
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  // Node.js environment (for tests)
  SeededRandom = require('./seededRandom.js');
} else if (typeof window !== 'undefined' && window.SeededRandom) {
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
    this.MAX_RADIATION = 30; // For normalization

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

    // Initialize game
    this.initializeFrogs();
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
    this.frogs = shuffled.slice(0, this.FROG_COUNT);
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
        radiation += (this.RADIATION_RANGE + 1 - distance);
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
        const hopDistance = this.rng.nextInt(2, 3);
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

    // Check if already probed
    if (this.isProbed(x, y)) {
      return { valid: false, message: 'Already probed' };
    }

    // Check if frog is here
    const frogIndex = this.isFrogAt(x, y);

    if (frogIndex !== -1) {
      // Caught a frog!
      this.frogs.splice(frogIndex, 1);
      this.caughtFrogs++;
      this.caughtPositions.push({ x, y });
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
        radiation: 0,
        message: `Caught a frog! ${this.caughtFrogs}/${this.FROG_COUNT}`,
        gameWon: this.gameWon
      };
    } else {
      // No frog here, calculate radiation
      const radiation = this.calculateRadiation(x, y);
      this.previousRadiation = this.lastRadiation;
      this.lastRadiation = radiation;
      this.probed.push({ x, y });
      this.moves++;

      // Make nearby frogs hop away
      this.makeFrogsHop(x, y);

      // Check lose condition
      if (this.moves >= this.MAX_MOVES) {
        this.gameOver = true;
      }

      return {
        valid: true,
        caught: false,
        radiation: radiation,
        message: radiation > 0 ? 'Detecting radiation...' : 'No radiation detected',
        gameOver: this.gameOver && !this.gameWon
      };
    }
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
      movesRemaining: this.MAX_MOVES - this.moves
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
    this.initializeFrogs();
  }

  /**
   * Start a new game with a new seed
   */
  newGame(seed = null) {
    this.seed = seed || this.generateSeed();
    this.reset();
  }
}

// Export for Node.js (testing) and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RadioactiveFroggies;
}
if (typeof window !== 'undefined') {
  window.RadioactiveFroggies = RadioactiveFroggies;
}
