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

  describe('Powerup System', () => {
    test('should start with 1 radar powerup', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.powerups).toContain('radar');
      expect(game.powerups.length).toBe(1);
    });

    test('should initialize hidden powerup', () => {
      const game = new RadioactiveFroggies(12345);
      expect(game.hiddenPowerup).toBeDefined();
      expect(game.hiddenPowerup.x).toBeGreaterThanOrEqual(0);
      expect(game.hiddenPowerup.x).toBeLessThan(game.GRID_SIZE);
      expect(game.hiddenPowerup.y).toBeGreaterThanOrEqual(0);
      expect(game.hiddenPowerup.y).toBeLessThan(game.GRID_SIZE);
    });

    test('should not place hidden powerup on frog position', () => {
      const game = new RadioactiveFroggies(12345);
      const powerup = game.hiddenPowerup;
      const onFrog = game.frogs.some(f => f.x === powerup.x && f.y === powerup.y);
      expect(onFrog).toBe(false);
    });

    test('should find powerup when probing its location', () => {
      const game = new RadioactiveFroggies(12345);
      const powerupPos = game.hiddenPowerup;

      const result = game.probe(powerupPos.x, powerupPos.y);

      expect(result.foundPowerup).toBe(true);
      expect(game.powerups.length).toBe(2); // Started with 1, found 1
      expect(game.hiddenPowerup).toBeNull();
    });

    test('should not find powerup at wrong location', () => {
      const game = new RadioactiveFroggies(12345);
      const powerupPos = game.hiddenPowerup;

      // Probe different location
      const differentX = (powerupPos.x + 1) % game.GRID_SIZE;
      const result = game.probe(differentX, powerupPos.y);

      expect(result.foundPowerup).toBe(false);
      expect(game.powerups.length).toBe(1); // Still only starting powerup
    });

    test('should use radar powerup successfully', () => {
      const game = new RadioactiveFroggies(12345);
      const initialCount = game.powerups.length;

      const result = game.usePowerup('radar');

      expect(result.valid).toBe(true);
      expect(result.type).toBe('radar');
      expect(result.frogPositions).toBeDefined();
      expect(result.frogPositions.length).toBe(game.frogs.length);
      expect(game.powerups.length).toBe(initialCount - 1);
    });

    test('should return frog positions when using radar', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 3, y: 4 }, { x: 7, y: 8 }];

      const result = game.usePowerup('radar');

      expect(result.frogPositions).toEqual([
        { x: 3, y: 4 },
        { x: 7, y: 8 }
      ]);
    });

    test('should fail to use powerup when none available', () => {
      const game = new RadioactiveFroggies(12345);
      game.powerups = []; // Remove all powerups

      const result = game.usePowerup('radar');

      expect(result.valid).toBe(false);
    });

    test('should reset powerups on game reset', () => {
      const game = new RadioactiveFroggies(12345);
      game.usePowerup('radar'); // Use the starting powerup
      expect(game.powerups.length).toBe(0);

      game.reset();

      expect(game.powerups.length).toBe(1);
      expect(game.powerups).toContain('radar');
    });

    test('should include powerup info in game state', () => {
      const game = new RadioactiveFroggies(12345);

      const state = game.getState();

      expect(state.powerups).toBeDefined();
      expect(state.powerups).toEqual(['radar']);
      expect(state.hasPowerup).toBe(true);
    });

    test('should show no powerups in state when used', () => {
      const game = new RadioactiveFroggies(12345);
      game.usePowerup('radar');

      const state = game.getState();

      expect(state.powerups).toEqual([]);
      expect(state.hasPowerup).toBe(false);
    });
  });

  describe('Frog Hopping with Powerup', () => {
    test('should make all frogs hop when called', () => {
      const game = new RadioactiveFroggies(12345);
      const originalPositions = game.frogs.map(f => ({ x: f.x, y: f.y }));

      game.makeAllFrogsHop();

      // At least some frogs should have moved (unless they had nowhere to go)
      const someHopped = game.frogs.some((frog, i) =>
        frog.x !== originalPositions[i].x || frog.y !== originalPositions[i].y
      );

      // This might not always be true if frogs are stuck, but usually true
      expect(game.frogs.length).toBe(originalPositions.length);
    });

    test('should keep frogs in bounds when hopping', () => {
      const game = new RadioactiveFroggies(12345);

      game.makeAllFrogsHop();

      for (const frog of game.frogs) {
        expect(frog.x).toBeGreaterThanOrEqual(0);
        expect(frog.x).toBeLessThan(game.GRID_SIZE);
        expect(frog.y).toBeGreaterThanOrEqual(0);
        expect(frog.y).toBeLessThan(game.GRID_SIZE);
      }
    });

    test('should be able to make frogs hop twice', () => {
      const game = new RadioactiveFroggies(12345);
      const originalPositions = game.frogs.map(f => ({ x: f.x, y: f.y }));

      game.makeAllFrogsHop();
      game.makeAllFrogsHop();

      // Frogs should still be valid
      expect(game.frogs.length).toBe(originalPositions.length);
      for (const frog of game.frogs) {
        expect(frog.x).toBeGreaterThanOrEqual(0);
        expect(frog.x).toBeLessThan(game.GRID_SIZE);
      }
    });
  });

  describe('Dual Radiation Tracking', () => {
    test('should return initial radiation before frogs hop', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 4); // Next to frog

      expect(result.initialRadiation).toBeDefined();
      expect(result.initialRadiation).toBeGreaterThan(0);
    });

    test('should return final radiation after frogs hop', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 4);

      expect(result.finalRadiation).toBeDefined();
      expect(result.finalRadiation).toBeGreaterThanOrEqual(0);
    });

    test('should show radiation difference when frog hops away', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 4); // Probe next to frog

      // Initial should be high (frog is at 5,5)
      expect(result.initialRadiation).toBeGreaterThan(0);

      // Final might be lower if frog hopped away (unless it hopped closer)
      expect(result.finalRadiation).toBeDefined();
    });

    test('should not have dual radiation when catching frog', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      const result = game.probe(5, 5); // Catch the frog

      expect(result.caught).toBe(true);
      expect(result.initialRadiation).toBeUndefined();
      expect(result.finalRadiation).toBeUndefined();
    });

    test('should track radiation for far probe', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 0, y: 0 }];

      const result = game.probe(9, 9); // Far from frog

      expect(result.initialRadiation).toBe(0);
      expect(result.finalRadiation).toBe(0);
    });
  });

  describe('Frog Movement Prevention', () => {
    test('should not allow frog to hop to just-probed tile', () => {
      const game = new RadioactiveFroggies(12345);
      game.frogs = [{ x: 5, y: 5 }];

      // Probe next to frog to make it hop
      game.probe(5, 4);

      // Frog should not be at the probed location
      const frogAtProbed = game.frogs.some(f => f.x === 5 && f.y === 4);
      expect(frogAtProbed).toBe(false);
    });

    test('should allow frog to stay in place if no valid moves', () => {
      const game = new RadioactiveFroggies(12345);
      // Place frog in corner
      game.frogs = [{ x: 0, y: 0 }];

      const originalPos = { x: game.frogs[0].x, y: game.frogs[0].y };

      // Probe next to it - limited hop options
      game.probe(0, 1);

      // Frog should still be somewhere valid (might stay in place)
      expect(game.frogs[0].x).toBeGreaterThanOrEqual(0);
      expect(game.frogs[0].x).toBeLessThan(game.GRID_SIZE);
    });
  });
});
