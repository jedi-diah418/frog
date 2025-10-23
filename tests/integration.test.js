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

  beforeAll(() => {
    // Read the actual HTML file (but we'll strip out script tags and load them manually)
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Radioactive Froggies Test</title>
      </head>
      <body>
        <div id="game-container">
          <h1>☢️ RADIOACTIVE FROGGIES ☢️</h1>
          <div id="game-info">
            <div class="info-item">
              <div class="info-label">CAUGHT</div>
              <div class="info-value" id="caught-count">0/5</div>
            </div>
            <div class="info-item">
              <div class="info-label">MOVES</div>
              <div class="info-value" id="move-count">0</div>
            </div>
            <div class="info-item">
              <div class="info-label">REMAINING</div>
              <div class="info-value" id="moves-remaining">50</div>
            </div>
          </div>
          <div id="radiation-meter">
            <h3>RADIATION DETECTOR</h3>
            <div class="meter-container">
              <div class="meter-fill" id="meter-fill"></div>
              <div class="meter-text" id="meter-text">STANDBY</div>
            </div>
            <div class="trend-indicator" id="trend-indicator"></div>
          </div>
          <div id="game-grid"></div>
          <div id="message">Test</div>
          <div class="button-container">
            <button id="reset-button" class="button">RESET</button>
            <button id="new-game-button" class="button primary">NEW GAME</button>
            <button id="share-button" class="button">SHARE</button>
          </div>
          <div id="seed-info">
            Level Seed: <span id="seed-value">000000</span>
          </div>
        </div>
        <div id="game-over-overlay">
          <div class="game-over-content" id="game-over-content">
            <h2 id="game-over-title">MISSION COMPLETE</h2>
            <div class="game-over-stats" id="game-over-stats"></div>
            <div class="button-container">
              <button id="retry-button" class="button primary">RETRY LEVEL</button>
              <button id="next-level-button" class="button">NEW LEVEL</button>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Create JSDOM instance without external resource loading
    dom = new JSDOM(htmlContent, {
      runScripts: 'outside-only',
      url: 'http://localhost:3000/'
    });

    window = dom.window;
    document = window.document;

    // Manually load and execute the JavaScript files in order
    const seededRandomJS = fs.readFileSync(path.join(__dirname, '../src/js/seededRandom.js'), 'utf-8');
    const radioactiveFroggiesJS = fs.readFileSync(path.join(__dirname, '../src/js/radioactiveFroggies.js'), 'utf-8');
    const uiJS = fs.readFileSync(path.join(__dirname, '../src/js/ui.js'), 'utf-8');

    // Execute scripts in the window context
    window.eval(seededRandomJS);
    window.eval(radioactiveFroggiesJS);
    window.eval(uiJS);

    // Wait a tick for initialization
    return new Promise(resolve => setTimeout(resolve, 100));
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
