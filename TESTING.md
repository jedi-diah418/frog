# Testing Guide

## Overview

This project maintains high code quality through comprehensive testing. Every feature must include tests before being merged.

**Current Test Coverage:** 124 tests across 4 test suites

## Testing Philosophy

### Why We Test

1. **Catch bugs early** - Find issues before users do
2. **Document behavior** - Tests show how features should work
3. **Enable refactoring** - Change implementation with confidence
4. **Prevent regressions** - Ensure old features don't break
5. **Build confidence** - Ship features knowing they work

### Test Quality Over Quantity

- Write **meaningful** tests that verify real behavior
- Don't test implementation details, test outcomes
- Cover happy paths, edge cases, and error cases
- Keep tests simple and readable

## Test Structure

### Test Suites

```
tests/
├── game.test.js              # Basic frog game tests
├── seededRandom.test.js      # RNG determinism tests
├── radioactiveFroggies.test.js  # Core game logic tests
└── integration.test.js       # Browser/UI integration tests
```

### What to Test Where

**Unit Tests** (`radioactiveFroggies.test.js`, `game.test.js`)
- Game logic and rules
- State management
- Calculations (radiation, distance)
- Edge cases and boundaries
- Error handling

**Integration Tests** (`integration.test.js`)
- UI rendering
- User interactions
- DOM updates
- Event handlers
- Visual feedback

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Test Template

```javascript
describe('Feature Name', () => {
  test('should do expected behavior', () => {
    // Arrange - Set up test data
    const game = new RadioactiveFroggies(12345);

    // Act - Perform the action
    const result = game.someMethod();

    // Assert - Verify the outcome
    expect(result.valid).toBe(true);
    expect(result.value).toBeGreaterThan(0);
  });
});
```

### Testing Checklist

Before marking a feature complete, verify:

- [ ] **Happy Path** - Feature works as expected
  ```javascript
  test('should find powerup when probing its location', () => {
    const powerupPos = game.hiddenPowerup;
    const result = game.probe(powerupPos.x, powerupPos.y);
    expect(result.foundPowerup).toBe(true);
  });
  ```

- [ ] **Edge Cases** - Boundaries and limits
  ```javascript
  test('should keep frogs in bounds when hopping', () => {
    game.makeAllFrogsHop();
    for (const frog of game.frogs) {
      expect(frog.x).toBeGreaterThanOrEqual(0);
      expect(frog.x).toBeLessThan(game.GRID_SIZE);
    }
  });
  ```

- [ ] **Error Cases** - Invalid input or unavailable resources
  ```javascript
  test('should fail to use powerup when none available', () => {
    game.powerups = [];
    const result = game.usePowerup('radar');
    expect(result.valid).toBe(false);
  });
  ```

- [ ] **State Management** - Initialization, reset, updates
  ```javascript
  test('should reset powerups on game reset', () => {
    game.usePowerup('radar');
    expect(game.powerups.length).toBe(0);

    game.reset();

    expect(game.powerups.length).toBe(1);
  });
  ```

- [ ] **UI Integration** (if applicable)
  ```javascript
  test('should update powerup count when found', () => {
    const powerupTile = findPowerupTile();
    powerupTile.element.click();

    const radarCount = document.getElementById('radar-count');
    expect(radarCount.textContent).toBe('2');
  });
  ```

## Test-Driven Development (TDD)

For complex features, consider writing tests first:

1. **Write failing test** - Define expected behavior
2. **Implement feature** - Make the test pass
3. **Refactor** - Improve code while keeping tests green

### Example TDD Workflow

```javascript
// 1. Write the test (it will fail)
test('should freeze frog for 3 turns', () => {
  game.usePowerup('freeze');
  const frog = game.frogs[0];
  const originalPos = { x: frog.x, y: frog.y };

  // Frog should not move for 3 probes
  game.probe(frog.x + 1, frog.y);
  expect(game.frogs[0]).toEqual(originalPos);

  game.probe(frog.x + 1, frog.y);
  expect(game.frogs[0]).toEqual(originalPos);

  game.probe(frog.x + 1, frog.y);
  expect(game.frogs[0]).toEqual(originalPos);

  // After 3 turns, frog should hop again
  game.probe(frog.x + 1, frog.y);
  expect(game.frogs[0]).not.toEqual(originalPos);
});

// 2. Implement the feature
class RadioactiveFroggies {
  usePowerup(type) {
    if (type === 'freeze') {
      this.frozenTurnsRemaining = 3;
      // ... implementation
    }
  }
}

// 3. Refactor and optimize
```

## Common Patterns

### Testing with Seeds

Use fixed seeds for deterministic tests:

```javascript
test('should place frogs in same positions for same seed', () => {
  const game1 = new RadioactiveFroggies(12345);
  const game2 = new RadioactiveFroggies(12345);

  expect(game1.frogs).toEqual(game2.frogs);
});
```

### Testing Async/Animations

For UI animations, use timeouts sparingly:

```javascript
test('should remove animation class after delay', (done) => {
  tile.element.click();

  setTimeout(() => {
    expect(tile.element.classList.contains('just-probed')).toBe(false);
    done();
  }, 700); // Just longer than 600ms animation
});
```

### Testing User Interactions

Simulate clicks and events:

```javascript
test('should register click on tile', () => {
  const tile = window.gameUI.tiles[0];
  const initialMoves = window.gameUI.game.moves;

  tile.element.click();

  expect(window.gameUI.game.moves).toBe(initialMoves + 1);
});
```

## Coverage Goals

- **Core game logic:** 90%+ coverage
- **UI interactions:** 80%+ coverage
- **Utility functions:** 100% coverage

Check coverage with:
```bash
npm run test:coverage
```

## Best Practices

### DO ✅

- **Test behavior, not implementation**
  ```javascript
  // Good - tests outcome
  expect(game.caughtFrogs).toBe(1);

  // Bad - tests implementation detail
  expect(game.frogs.splice).toHaveBeenCalled();
  ```

- **Use descriptive test names**
  ```javascript
  // Good
  test('should prevent frog from hopping to just-probed tile')

  // Bad
  test('frog movement')
  ```

- **Keep tests independent**
  ```javascript
  // Good - each test creates its own game
  test('test A', () => {
    const game = new RadioactiveFroggies(123);
    // test A logic
  });

  test('test B', () => {
    const game = new RadioactiveFroggies(456);
    // test B logic
  });
  ```

- **Test one thing per test**
  ```javascript
  // Good - focused test
  test('should increment move count on probe', () => {
    const initialMoves = game.moves;
    game.probe(0, 0);
    expect(game.moves).toBe(initialMoves + 1);
  });
  ```

### DON'T ❌

- **Don't test framework/library code**
  ```javascript
  // Bad - testing Jest itself
  expect(game).toBeDefined();

  // Good - testing your code
  expect(game.frogs.length).toBe(5);
  ```

- **Don't make tests dependent on each other**
  ```javascript
  // Bad - test B depends on test A running first
  let sharedGame;
  test('test A', () => {
    sharedGame = new RadioactiveFroggies();
  });
  test('test B', () => {
    sharedGame.probe(0, 0); // Fails if A doesn't run!
  });
  ```

- **Don't test private implementation**
  ```javascript
  // Bad - testing internal method
  expect(game._internalHelper()).toBe(true);

  // Good - test public API behavior
  expect(game.getState().value).toBe(expectedValue);
  ```

## Debugging Failed Tests

### Read the Error Message

```
Expected: 2
Received: 1
```

The test expected 2 powerups but found 1. Check:
- Did you forget to add a powerup?
- Is there a typo in the powerup type?
- Did another test consume the powerup?

### Use Console Logging

```javascript
test('debugging test', () => {
  console.log('Game state:', game.getState());
  console.log('Powerups:', game.powerups);

  const result = game.probe(0, 0);
  console.log('Probe result:', result);

  expect(result.foundPowerup).toBe(true);
});
```

### Run Single Test

```bash
# Run only tests matching "powerup"
npm test -- -t "powerup"

# Run only one test file
npm test -- radioactiveFroggies.test.js
```

## Examples from the Codebase

### Example 1: Unit Test for Game Logic

```javascript
describe('Dual Radiation Tracking', () => {
  test('should return initial radiation before frogs hop', () => {
    const game = new RadioactiveFroggies(12345);
    game.frogs = [{ x: 5, y: 5 }];

    const result = game.probe(5, 4); // Next to frog

    expect(result.initialRadiation).toBeDefined();
    expect(result.initialRadiation).toBeGreaterThan(0);
  });
});
```

### Example 2: Integration Test for UI

```javascript
test('should show powerup on hidden tile', () => {
  const powerupPos = window.gameUI.game.hiddenPowerup;
  const tile = window.gameUI.tiles.find(
    t => t.x === powerupPos.x && t.y === powerupPos.y
  );

  expect(tile).toBeDefined();
  expect(tile.element.classList.contains('has-powerup')).toBe(true);
});
```

### Example 3: Edge Case Test

```javascript
test('should allow frog to stay in place if no valid moves', () => {
  const game = new RadioactiveFroggies(12345);
  game.frogs = [{ x: 0, y: 0 }]; // Corner position

  game.probe(0, 1); // Try to make it hop

  // Frog should still be in valid position (might not have moved)
  expect(game.frogs[0].x).toBeGreaterThanOrEqual(0);
  expect(game.frogs[0].x).toBeLessThan(game.GRID_SIZE);
});
```

## Contributing

When adding new features:

1. **Before coding:** Write tests defining expected behavior
2. **During coding:** Run tests frequently to verify progress
3. **Before committing:** Ensure all tests pass
4. **In PR:** Include test summary showing coverage

See [TODO_TEMPLATE.md](TODO_TEMPLATE.md) for the standard feature development workflow.

## Questions?

- Check existing tests for patterns
- Ask in PR reviews
- Update this guide when you learn something new

Happy Testing! 🧪✅
