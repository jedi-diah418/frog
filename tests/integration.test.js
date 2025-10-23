/**
 * Integration test - Verify JavaScript can execute in browser-like environment
 */

const fs = require('fs');
const path = require('path');

// Setup global environment polyfills for Node
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const { JSDOM } = require('jsdom');

describe('Browser Integration', () => {
  let dom;
  let window;
  let document;
  let consoleLog;
  let consoleError;

  beforeAll((done) => {
    // Read the actual HTML file
    const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf-8');

    // Create JSDOM instance with scripts enabled
    dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost:3000/',
      beforeParse(window) {
        // Capture console output
        consoleLog = [];
        consoleError = [];

        const originalLog = window.console.log;
        const originalError = window.console.error;

        window.console.log = (...args) => {
          consoleLog.push(args.join(' '));
          originalLog.apply(window.console, args);
        };

        window.console.error = (...args) => {
          consoleError.push(args.join(' '));
          originalError.apply(window.console, args);
        };
      }
    });

    window = dom.window;
    document = window.document;

    // Wait for scripts to execute
    setTimeout(() => {
      console.log('Console logs:', consoleLog);
      console.log('Console errors:', consoleError);
      done();
    }, 1000);
  });

  test('should load SeededRandom class globally', () => {
    expect(window.SeededRandom).toBeDefined();
    expect(typeof window.SeededRandom).toBe('function');
  });

  test('should load RadioactiveFroggies class globally', () => {
    expect(window.RadioactiveFroggies).toBeDefined();
    expect(typeof window.RadioactiveFroggies).toBe('function');
  });

  test('should create game instance', () => {
    expect(window.gameUI).toBeDefined();
    expect(window.gameUI.game).toBeDefined();
  });

  test('should create grid with 100 tiles', () => {
    expect(window.gameUI.tiles).toBeDefined();
    expect(window.gameUI.tiles.length).toBe(100);
  });

  test('should have tile click handlers', () => {
    const tile = window.gameUI.tiles[0];
    expect(tile.element).toBeDefined();

    // Simulate a click
    const initialMoves = window.gameUI.game.moves;
    tile.element.click();

    // Should have registered the move
    expect(window.gameUI.game.moves).toBeGreaterThan(initialMoves);
  });

  test('should update UI when tile is clicked', () => {
    const moveCount = document.getElementById('move-count');
    const initialMoves = parseInt(moveCount.textContent);

    // Click a tile
    const tile = window.gameUI.tiles[5];
    tile.element.click();

    // Move count should increment
    expect(parseInt(moveCount.textContent)).toBe(initialMoves + 1);
  });

  test('should have working reset button', () => {
    // Make some moves
    window.gameUI.tiles[0].element.click();
    window.gameUI.tiles[1].element.click();

    expect(window.gameUI.game.moves).toBeGreaterThan(0);

    // Click reset
    const resetButton = document.getElementById('reset-button');
    resetButton.click();

    // Should be back to 0
    expect(window.gameUI.game.moves).toBe(0);
  });

  test('should catch a frog when clicked', () => {
    // Get a frog position
    const frog = window.gameUI.game.frogs[0];

    // Find the tile at that position
    const tile = window.gameUI.tiles.find(t => t.x === frog.x && t.y === frog.y);

    expect(tile).toBeDefined();

    const initialCaught = window.gameUI.game.caughtFrogs;

    // Click it
    tile.element.click();

    // Should have caught the frog
    expect(window.gameUI.game.caughtFrogs).toBe(initialCaught + 1);
    expect(tile.element.classList.contains('caught')).toBe(true);
    expect(tile.element.textContent).toBe('🐸');
  });
});
