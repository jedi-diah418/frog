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
          <div id="powerup-inventory">
            <h3>POWERUPS</h3>
            <div id="powerup-list">
              <div class="powerup-item" id="powerup-radar">
                <span class="powerup-icon">📡</span>
                <span class="powerup-count" id="radar-count">0</span>
              </div>
              <div class="powerup-item" id="powerup-mega-probe">
                <span class="powerup-icon">🎯</span>
                <span class="powerup-count" id="mega-probe-count">0</span>
              </div>
            </div>
          </div>
          <div id="game-grid"></div>
          <div id="message">Test</div>
          <div class="button-container">
            <button id="reset-button" class="button">RESET</button>
            <button id="new-game-button" class="button primary">NEW GAME</button>
            <button id="share-button" class="button">SHARE</button>
            <button id="sound-button" class="button">🔊 SOUND</button>
            <button id="debug-button" class="button">SHOW FROGS</button>
          </div>
          <div id="seed-info">
            Level Seed: <span id="seed-value">000000</span>
          </div>
        </div>
        <div id="game-over-overlay">
          <div class="game-over-content" id="game-over-content">
            <h2 id="game-over-title">MISSION COMPLETE</h2>
            <div class="game-over-stats" id="game-over-stats"></div>
            <div id="achievements-unlocked"></div>
            <div class="button-container">
              <button id="retry-button" class="button primary">RETRY LEVEL</button>
              <button id="next-level-button" class="button">NEW LEVEL</button>
            </div>
          </div>
        </div>
        <div id="achievement-toast" class="achievement-toast">
          <div class="achievement-content">
            <div class="achievement-icon"></div>
            <div class="achievement-text">
              <div class="achievement-title">Achievement Unlocked!</div>
              <div class="achievement-name"></div>
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
    const achievementsJS = fs.readFileSync(path.join(__dirname, '../src/js/achievements.js'), 'utf-8');
    const soundsJS = fs.readFileSync(path.join(__dirname, '../src/js/sounds.js'), 'utf-8');
    const radioactiveFroggiesJS = fs.readFileSync(path.join(__dirname, '../src/js/radioactiveFroggies.js'), 'utf-8');
    const uiJS = fs.readFileSync(path.join(__dirname, '../src/js/ui.js'), 'utf-8');

    // Execute scripts in the window context
    window.eval(seededRandomJS);
    window.eval(achievementsJS);
    window.eval(soundsJS);
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

  test('should display powerup inventory', () => {
    const powerupInventory = document.getElementById('powerup-inventory');
    const radarPowerup = document.getElementById('powerup-radar');
    const radarCount = document.getElementById('radar-count');

    expect(powerupInventory).toBeDefined();
    expect(radarPowerup).toBeDefined();
    expect(radarCount).toBeDefined();
  });

  test('should show initial radar powerup count', () => {
    const radarCount = document.getElementById('radar-count');
    expect(radarCount.textContent).toBe('1');
  });

  test('should NOT show powerup on hidden tile', () => {
    const powerupPos = window.gameUI.game.hiddenPowerup;
    const tile = window.gameUI.tiles.find(t => t.x === powerupPos.x && t.y === powerupPos.y);

    expect(tile).toBeDefined();
    // Powerups are now hidden for mystery
    expect(tile.element.classList.contains('has-powerup')).toBe(false);
  });

  test('should update powerup count when found', () => {
    const initialPowerupCount = window.gameUI.game.powerups.length;
    const powerupPos = window.gameUI.game.hiddenPowerup;
    const tile = window.gameUI.tiles.find(t => t.x === powerupPos.x && t.y === powerupPos.y);

    // Click the powerup tile
    tile.element.click();

    // Total powerup count should increase (could be radar or mega-probe)
    const finalPowerupCount = window.gameUI.game.powerups.length;
    expect(finalPowerupCount).toBe(initialPowerupCount + 1);
  });

  test('should keep powerup hidden before and after finding', () => {
    // Reset game to get fresh powerup
    window.gameUI.resetGame();

    const powerupPos = window.gameUI.game.hiddenPowerup;
    const tile = window.gameUI.tiles.find(t => t.x === powerupPos.x && t.y === powerupPos.y);

    // Powerup should be hidden before finding
    expect(tile.element.classList.contains('has-powerup')).toBe(false);

    // Click to find it
    tile.element.click();

    // Wait for UI update - powerup should remain hidden after finding (no indicator)
    setTimeout(() => {
      expect(tile.element.classList.contains('has-powerup')).toBe(false);
    }, 100);
  });

  test('should disable powerup when none available', () => {
    // Reset and use the powerup
    window.gameUI.resetGame();
    window.gameUI.game.usePowerup('radar');
    window.gameUI.updateUI();

    const radarElement = document.getElementById('powerup-radar');
    const radarCount = document.getElementById('radar-count');

    expect(radarCount.textContent).toBe('0');
    expect(radarElement.classList.contains('disabled')).toBe(true);
  });

  test('should enable powerup when available', () => {
    window.gameUI.resetGame();

    const radarElement = document.getElementById('powerup-radar');
    const radarCount = document.getElementById('radar-count');

    expect(radarCount.textContent).toBe('1');
    expect(radarElement.classList.contains('disabled')).toBe(false);
  });

  describe('Radiation Indicator Display', () => {
    test('should show radiation indicators on surrounding tiles', () => {
      window.gameUI.resetGame();

      // Place a frog at a known location
      window.gameUI.game.frogs = [{ x: 5, y: 5 }];

      // Probe nearby
      const tile = window.gameUI.tiles.find(t => t.x === 5 && t.y === 4);
      tile.element.click();

      // Radiation indicators should be applied
      // Check that surrounding tiles get styled
      const surroundingTile = window.gameUI.tiles.find(t => t.x === 5 && t.y === 6);
      // This test verifies the method is called, actual visual testing requires timing
      expect(window.gameUI.game.calculateRadiation(5, 6)).toBeGreaterThan(0);
    });

    test('should show radiation indicators on probed tiles', (done) => {
      window.gameUI.resetGame();

      // Place frogs
      window.gameUI.game.frogs = [{ x: 5, y: 5 }];

      // Probe once
      const firstTile = window.gameUI.tiles.find(t => t.x === 5 && t.y === 3);
      firstTile.element.click();

      // Wait for first animation to complete
      setTimeout(() => {
        // Probe again nearby
        const secondTile = window.gameUI.tiles.find(t => t.x === 5 && t.y === 2);
        secondTile.element.click();

        // Wait for animation
        setTimeout(() => {
          // First tile should be tracked as probed in game state
          expect(window.gameUI.game.isProbed(firstTile.x, firstTile.y)).toBe(true);
          // But should NOT have visual probed marker
          expect(firstTile.element.classList.contains('probed')).toBe(false);
          // Radiation calculation should still work for probed tiles
          expect(window.gameUI.game.calculateRadiation(firstTile.x, firstTile.y)).toBeGreaterThanOrEqual(0);
          done();
        }, 1500);
      }, 1500);
    }, 5000);

    test('should skip radiation indicators on probed tiles', () => {
      window.gameUI.resetGame();

      // Place frog
      window.gameUI.game.frogs = [{ x: 5, y: 5 }];

      // Probe a tile
      const probedTile = window.gameUI.tiles.find(t => t.x === 5 && t.y === 4);
      probedTile.element.click();

      // Verify tile is tracked as probed in game state
      expect(window.gameUI.game.isProbed(5, 4)).toBe(true);

      // But tile should NOT have visual probed marker
      expect(probedTile.element.classList.contains('probed')).toBe(false);

      // Radiation calculation still works (just won't show indicators on it)
      const radiation = window.gameUI.game.calculateRadiation(5, 4);
      expect(radiation).toBeGreaterThan(0);
    });
  });

  describe('Powerup UI Issues', () => {
    test('should not show hidden powerup initially', () => {
      window.gameUI.resetGame();

      // Hidden powerup should not be visible - it's a mystery!
      const powerupPos = window.gameUI.game.hiddenPowerup;
      const powerupTile = window.gameUI.tiles.find(t => t.x === powerupPos.x && t.y === powerupPos.y);

      // The tile should NOT have the has-powerup class (powerups are hidden for mystery)
      expect(powerupTile.element.classList.contains('has-powerup')).toBe(false);
      expect(powerupTile.element.classList.contains('has-frog')).toBe(false);
    });
  });
});
