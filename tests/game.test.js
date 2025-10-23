/**
 * Tests for FrogGame
 */

const FrogGame = require('../src/js/game.js');

describe('FrogGame', () => {
  let game;

  beforeEach(() => {
    // Set up DOM elements
    document.body.innerHTML = `
      <div id="frog-display">🐸</div>
      <div id="message"></div>
      <button id="reset-button"></button>
    `;

    game = new FrogGame();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Initialization', () => {
    test('should create a new FrogGame instance', () => {
      expect(game).toBeInstanceOf(FrogGame);
    });

    test('should initialize with hop count of 0', () => {
      expect(game.getHopCount()).toBe(0);
    });

    test('should start with the first frog emoji', () => {
      expect(game.getCurrentFrog()).toBe('🐸');
    });

    test('should initialize DOM elements when init() is called', () => {
      game.init();
      expect(game.frogElement).toBeTruthy();
      expect(game.messageElement).toBeTruthy();
    });
  });

  describe('Frog Clicking', () => {
    beforeEach(() => {
      game.init();
    });

    test('should increment hop count when frog is clicked', () => {
      game.handleFrogClick();
      expect(game.getHopCount()).toBe(1);
    });

    test('should increment hop count multiple times', () => {
      game.handleFrogClick();
      game.handleFrogClick();
      game.handleFrogClick();
      expect(game.getHopCount()).toBe(3);
    });

    test('should update display after clicking', () => {
      const updateSpy = jest.spyOn(game, 'updateDisplay');
      game.handleFrogClick();
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  describe('Frog Changing', () => {
    beforeEach(() => {
      game.init();
    });

    test('should change frog after 5 hops', () => {
      const initialFrog = game.getCurrentFrog();
      for (let i = 0; i < 5; i++) {
        game.handleFrogClick();
      }
      expect(game.getCurrentFrog()).not.toBe(initialFrog);
    });

    test('should cycle through different frogs', () => {
      const frogs = [];
      for (let i = 0; i < 15; i++) {
        if (i % 5 === 0 && i > 0) {
          frogs.push(game.getCurrentFrog());
        }
        game.handleFrogClick();
      }
      // Should have seen at least 2 different frogs
      const uniqueFrogs = [...new Set(frogs)];
      expect(uniqueFrogs.length).toBeGreaterThan(1);
    });

    test('should not change frog before 5 hops', () => {
      const initialFrog = game.getCurrentFrog();
      game.handleFrogClick();
      game.handleFrogClick();
      game.handleFrogClick();
      expect(game.getCurrentFrog()).toBe(initialFrog);
    });
  });

  describe('Messages', () => {
    test('should show initial message when hop count is 0', () => {
      expect(game.getMessage()).toBe('Click the frog to make it hop!');
    });

    test('should show singular message for 1 hop', () => {
      game.hopCount = 1;
      expect(game.getMessage()).toBe('1 hop! Keep going!');
    });

    test('should show plural message for multiple hops', () => {
      game.hopCount = 3;
      expect(game.getMessage()).toContain('3 hops');
    });

    test('should show special message at 5 hops', () => {
      game.hopCount = 5;
      expect(game.getMessage()).toContain('You found a new friend!');
    });

    test('should show champion message for 10+ hops', () => {
      game.hopCount = 15;
      expect(game.getMessage()).toContain('champion');
    });
  });

  describe('Reset Functionality', () => {
    beforeEach(() => {
      game.init();
    });

    test('should reset hop count to 0', () => {
      game.handleFrogClick();
      game.handleFrogClick();
      game.reset();
      expect(game.getHopCount()).toBe(0);
    });

    test('should reset to first frog', () => {
      for (let i = 0; i < 5; i++) {
        game.handleFrogClick();
      }
      game.reset();
      expect(game.getCurrentFrog()).toBe('🐸');
    });

    test('should update display after reset', () => {
      const updateSpy = jest.spyOn(game, 'updateDisplay');
      game.reset();
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should show initial message after reset', () => {
      game.hopCount = 10;
      game.reset();
      expect(game.getMessage()).toBe('Click the frog to make it hop!');
    });
  });

  describe('Display Updates', () => {
    beforeEach(() => {
      game.init();
    });

    test('should update frog display element', () => {
      game.updateDisplay();
      expect(document.getElementById('frog-display').textContent).toBe('🐸');
    });

    test('should update message element', () => {
      game.hopCount = 3;
      game.updateDisplay();
      expect(document.getElementById('message').textContent).toContain('3 hops');
    });

    test('should handle missing elements gracefully', () => {
      game.frogElement = null;
      game.messageElement = null;
      expect(() => game.updateDisplay()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid clicking', () => {
      game.init();
      for (let i = 0; i < 100; i++) {
        game.handleFrogClick();
      }
      expect(game.getHopCount()).toBe(100);
    });

    test('should cycle through all frog types', () => {
      game.init();
      const seenFrogs = new Set();

      for (let i = 0; i < 15; i++) {
        if (i % 5 === 0) {
          seenFrogs.add(game.getCurrentFrog());
        }
        game.handleFrogClick();
      }

      expect(seenFrogs.size).toBe(3); // Should see all 3 frog types
    });
  });
});
