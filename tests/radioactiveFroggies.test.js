/**
 * Tests for RadioactiveFroggies
 */

const RadioactiveFroggies = require('../src/js/radioactiveFroggies.js');

describe('RadioactiveFroggies', () => {
  describe('Initialization', () => {
    test('should create game instance', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game).toBeInstanceOf(RadioactiveFroggies);
    });

    test('should initialize with provided seed', () => {
      const game = new RadioactiveFroggies(42);
      expect(game.seed).toBe(42);
    });

    test('should generate seed if none provided', () => {
      const game = new RadioactiveFroggies();
      expect(game.seed).toBeDefined();
      expect(typeof game.seed).toBe('number');
    });

    test('should place correct number of frogs', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.frogs.length).toBe(game.FROG_COUNT);
    });

    test('should place frogs within grid bounds', () => {
      const game = new RadioactiveFroggies(12345);

      for (const frog of game.frogs) {
        expect(frog.x).toBeGreaterThanOrEqual(0);
        expect(frog.x).toBeLessThan(game.GRID_SIZE);
        expect(frog.y).toBeGreaterThanOrEqual(0);
        expect(frog.y).toBeLessThan(game.GRID_SIZE);
      }
    });

    test('should start with 0 moves', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.moves).toBe(0);
    });

    test('should start with 0 caught frogs', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.caughtFrogs).toBe(0);
    });

    test('should not be game over initially', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.gameOver).toBe(false);
      expect(game.gameWon).toBe(false);
    });
  });

  describe('Deterministic Frog Placement', () => {
    test('should place frogs in same positions for same seed', () => {
      const game1 = new RadioactiveFroggies(999);
      const game2 = new RadioactiveFroggies(999);

      expect(game1.frogs).toEqual(game2.frogs);
    });

    test('should place frogs in different positions for different seeds', () => {
      const game1 = new RadioactiveFroggies(100);
      const game2 = new RadioactiveFroggies(200);

      expect(game1.frogs).not.toEqual(game2.frogs);
    });
  });

  describe('Manhattan Distance', () => {
    test('should calculate correct distance', () => {
      const game = new RadioactiveFroggies(12345);

      expect(game.manhattanDistance(0, 0, 0, 0)).toBe(0);
      expect(game.manhattanDistance(0, 0, 1, 0)).toBe(1);
      expect(game.manhattanDistance(0, 0, 0, 1)).toBe(1);
      expect(game.manhattanDistance(0, 0, 1, 1)).toBe(2);
      expect(game.manhattanDistance(0, 0, 3, 4)).toBe(7);
    });

    test('should work with negative differences', () => {
      const game = new RadioactiveFroggies(12345);

      expect(game.manhattanDistance(5, 5, 3, 3)).toBe(4);
      expect(game.manhattanDistance(10, 10, 0, 0)).toBe(20);
    });
  });

  describe('Radiation Calculation', () => {
    test('should return 0 radiation when no frogs nearby', () => {
      const game = new RadioactiveFroggies(12345);
      // Place frogs in known locations
      game.frogs = [{ x: 0, y: 0 }];

      // Far from frog
      const radiation = game.calculateRadiation(9, 9);
      expect(radiation).toBe(0);
    });

    test('should return high radiation when next to frog', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const radiation = game.calculateRadiation(5, 6);
      expect(radiation).toBeGreaterThan(0);
    });

    test('should return maximum radiation at frog location', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const radiation = game.calculateRadiation(5, 5);
      expect(radiation).toBe(game.RADIATION_RANGE + 1);
    });

    test('should amplify radiation with multiple frogs', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }, { x: 5, y: 6 }];

      const radiationSingle = game.RADIATION_RANGE + 1;
      const radiationDouble = game.calculateRadiation(5, 5);

      expect(radiationDouble).toBeGreaterThan(radiationSingle);
    });

    test('should decrease radiation with distance', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const rad0 = game.calculateRadiation(5, 5);
      const rad1 = game.calculateRadiation(5, 6);
      const rad2 = game.calculateRadiation(5, 7);

      expect(rad0).toBeGreaterThan(rad1);
      expect(rad1).toBeGreaterThan(rad2);
    });
  });

  describe('Probing', () => {
    test('should reject invalid coordinates', () => {
      const game = new RadioactiveFroggies(12345);

      const result = game.probe(-1, 0);
      expect(result.valid).toBe(false);
    });

    test('should reject out of bounds coordinates', () => {
      const game = new RadioactiveFroggies(12345);

      const result = game.probe(100, 100);
      expect(result.valid).toBe(false);
    });

    test('should increment moves on valid probe', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      game.probe(5, 5);
      expect(game.moves).toBe(1);
    });

    test('should catch frog at correct location', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 5);

      expect(result.valid).toBe(true);
      expect(result.caught).toBe(true);
      expect(game.caughtFrogs).toBe(1);
      expect(game.frogs.length).toBe(0);
    });

    test('should not catch frog at wrong location', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(3, 3);

      expect(result.valid).toBe(true);
      expect(result.caught).toBe(false);
      expect(game.caughtFrogs).toBe(0);
      expect(game.frogs.length).toBe(1);
    });

    test('should mark probed positions', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      game.probe(5, 5);
      expect(game.isProbed(5, 5)).toBe(true);
      expect(game.isProbed(3, 3)).toBe(false);
    });

    test('should allow re-probing positions', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      game.probe(5, 5);
      const result = game.probe(5, 5);

      expect(result.valid).toBe(true);
      expect(game.moves).toBe(2); // Should increment on re-probe
    });

    test('should return radiation level on miss', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 6);

      expect(result.valid).toBe(true);
      expect(result.radiation).toBeGreaterThan(0);
    });
  });

  describe('Frog Hopping', () => {
    test('should make frog hop when probed nearby', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];
      const originalPos = { ...game.frogs[0] };

      // Probe near frog (within scare radius)
      game.probe(5, 6);

      // Frog should have moved
      expect(game.frogs[0]).not.toEqual(originalPos);
    });

    test('should not make frog hop when probed far away', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];
      const originalPos = { ...game.frogs[0] };

      // Probe far from frog
      game.probe(0, 0);

      // Frog should not have moved
      expect(game.frogs[0]).toEqual(originalPos);
    });

    test('should keep frog in bounds when hopping', () => {
      const game = new RadioactiveFroggies(12345);
      // Place frog near edge
      game.frogs = [{ x: 0, y: 0 }];

      // Probe nearby to make it hop
      game.probe(0, 1);

      // Frog should still be in bounds
      expect(game.frogs[0].x).toBeGreaterThanOrEqual(0);
      expect(game.frogs[0].x).toBeLessThan(game.GRID_SIZE);
      expect(game.frogs[0].y).toBeGreaterThanOrEqual(0);
      expect(game.frogs[0].y).toBeLessThan(game.GRID_SIZE);
    });
  });

  describe('Game State', () => {
    test('should win when all frogs caught', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];
      game.FROG_COUNT = 1;

      const result = game.probe(5, 5);

      expect(result.gameWon).toBe(true);
      expect(game.gameWon).toBe(true);
      expect(game.gameOver).toBe(true);
    });

    test('should lose when max moves reached', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];
      game.MAX_MOVES = 1;

      const result = game.probe(5, 5);

      expect(result.gameOver).toBe(true);
      expect(game.gameOver).toBe(true);
      expect(game.gameWon).toBe(false);
    });

    test('should not accept probes after game over', () => {
      const game = new RadioactiveFroggies(12345);
      game.gameOver = true;

      const result = game.probe(5, 5);

      expect(result.valid).toBe(false);
    });

    test('should return correct game state', () => {
      const game = new RadioactiveFroggies(999);

      const state = game.getState();

      expect(state.seed).toBe(999);
      expect(state.moves).toBe(0);
      expect(state.maxMoves).toBe(game.MAX_MOVES);
      expect(state.caughtFrogs).toBe(0);
      expect(state.totalFrogs).toBe(game.FROG_COUNT);
      expect(state.gameOver).toBe(false);
      expect(state.gameWon).toBe(false);
    });
  });

  describe('Radiation Trend', () => {
    test('should return neutral on first move', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.getRadiationTrend()).toBe('neutral');
    });

    test('should return hotter when getting closer', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      game.probe(5, 8); // Far
      game.probe(5, 6); // Closer

      expect(game.getRadiationTrend()).toBe('hotter');
    });

    test('should return colder when getting farther', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      game.probe(5, 6); // Close
      game.probe(0, 0); // Far

      expect(game.getRadiationTrend()).toBe('colder');
    });
  });

  describe('Reset and New Game', () => {
    test('should reset game state', () => {
      const game = new RadioactiveFroggies(12345);
      game.probe(5, 5);
      game.probe(6, 6);

      game.reset();

      expect(game.moves).toBe(0);
      expect(game.caughtFrogs).toBe(0);
      expect(game.gameOver).toBe(false);
      expect(game.probed.length).toBe(0);
    });

    test('should keep same seed on reset', () => {
      const game = new RadioactiveFroggies(777);
      const originalSeed = game.seed;

      game.reset();

      expect(game.seed).toBe(originalSeed);
    });

    test('should place frogs in same positions after reset', () => {
      const game = new RadioactiveFroggies(555);
      const originalFrogs = JSON.parse(JSON.stringify(game.frogs));

      game.reset();

      expect(game.frogs).toEqual(originalFrogs);
    });

    test('should generate new seed on new game', () => {
      const game = new RadioactiveFroggies(123);
      const originalSeed = game.seed;

      game.newGame();

      expect(game.seed).not.toBe(originalSeed);
    });

    test('should use provided seed on new game', () => {
      const game = new RadioactiveFroggies(123);

      game.newGame(456);

      expect(game.seed).toBe(456);
    });
  });

  describe('Edge Cases', () => {
    test('should handle all frogs in same location check', () => {
      const game = new RadioactiveFroggies(12345);
      // Manually set frogs to nearby positions
      game.frogs = [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 6, y: 5 }
      ];

      // High radiation when multiple frogs nearby
      const radiation = game.calculateRadiation(5, 5);
      expect(radiation).toBeGreaterThan(game.RADIATION_RANGE);
    });

    test('should handle rapid consecutive probes', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      for (let i = 1; i < 10; i++) {
        game.probe(i, i);
      }

      expect(game.moves).toBe(9);
    });

    test('should handle catching all frogs sequentially', () => {
      const game = new RadioactiveFroggies(12345);
      const frogPositions = [...game.frogs];

      for (let i = 0; i < frogPositions.length; i++) {
        const pos = frogPositions[i];
        game.probe(pos.x, pos.y);
      }

      // Note: This might not catch all frogs if they hop
      expect(game.caughtFrogs).toBeGreaterThan(0);
    });
  });

  describe('Normalized Radiation', () => {
    test('should return value between 0 and 1', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      game.probe(5, 6);

      const normalized = game.getNormalizedRadiation();
      expect(normalized).toBeGreaterThanOrEqual(0);
      expect(normalized).toBeLessThanOrEqual(1);
    });

    test('should return 0 when no radiation', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      game.probe(9, 9);

      expect(game.getNormalizedRadiation()).toBe(0);
    });
  });
});
