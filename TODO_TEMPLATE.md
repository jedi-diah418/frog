# Feature Development Template

Use this template when planning new features to ensure comprehensive development and testing.

## Quick Start

Copy the relevant section below into your todo list or planning document.

---

## Template: New Game Feature

```
Feature: [Feature Name]

Implementation Tasks:
- [ ] Design feature logic and data structures
- [ ] Implement core game logic
- [ ] Add UI components (if applicable)
- [ ] Add visual feedback/animations (if applicable)
- [ ] Write unit tests for game logic
- [ ] Write integration tests for UI
- [ ] Update documentation
- [ ] Verify all tests pass
- [ ] Commit and push changes
```

### Example: Freeze Frog Powerup

```
Feature: Freeze Frog Powerup

Implementation Tasks:
- [ ] Add freeze powerup to powerup system
- [ ] Implement freeze mechanics (prevent hopping for N turns)
- [ ] Add freeze icon and UI button
- [ ] Add frozen state visual indicator
- [ ] Write unit tests for freeze mechanics
- [ ] Write integration tests for freeze UI
- [ ] Update TESTING.md with examples
- [ ] Verify all tests pass
- [ ] Commit and push changes
```

---

## Template: UI Enhancement

```
Feature: [UI Enhancement Name]

Implementation Tasks:
- [ ] Design UI layout/behavior
- [ ] Update HTML structure
- [ ] Add CSS styles and animations
- [ ] Implement JavaScript interactions
- [ ] Write integration tests for new UI
- [ ] Test on different screen sizes
- [ ] Verify accessibility
- [ ] Update documentation
- [ ] Commit and push changes
```

### Example: Radiation Heat Map Overlay

```
Feature: Radiation Heat Map Overlay

Implementation Tasks:
- [ ] Design heat map visualization algorithm
- [ ] Add toggle button to UI
- [ ] Implement canvas/CSS grid overlay
- [ ] Add color gradient based on radiation levels
- [ ] Write integration tests for toggle behavior
- [ ] Test on mobile and desktop
- [ ] Ensure doesn't impact game performance
- [ ] Update README with screenshots
- [ ] Commit and push changes
```

---

## Template: Bug Fix

```
Bug: [Bug Description]

Fix Tasks:
- [ ] Reproduce the bug
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add regression test
- [ ] Verify fix resolves issue
- [ ] Ensure no new bugs introduced
- [ ] Verify all existing tests pass
- [ ] Update documentation if needed
- [ ] Commit and push fix
```

### Example: Frogs Escaping Grid Bounds

```
Bug: Frogs sometimes hop outside grid boundaries

Fix Tasks:
- [ ] Reproduce with specific seed
- [ ] Add console logging to track positions
- [ ] Identify makeFrogsHop boundary check issue
- [ ] Fix boundary validation logic
- [ ] Add unit test: "should keep frogs in bounds when hopping"
- [ ] Test with seeds that previously failed
- [ ] Verify all 124 tests still pass
- [ ] Commit and push fix
```

---

## Template: Refactoring

```
Refactor: [Code Section to Refactor]

Refactoring Tasks:
- [ ] Identify code to refactor
- [ ] Ensure all tests pass BEFORE changes
- [ ] Extract/rename/reorganize code
- [ ] Verify all tests still pass AFTER changes
- [ ] Check for performance impact
- [ ] Update comments/documentation
- [ ] Commit and push refactor
```

### Example: Extract Radiation Calculation Logic

```
Refactor: Move radiation math into separate utility class

Refactoring Tasks:
- [ ] Run tests to establish baseline (124 passing)
- [ ] Create RadiationCalculator utility class
- [ ] Move calculateRadiation method
- [ ] Move manhattanDistance method
- [ ] Update RadioactiveFroggies to use utility
- [ ] Verify all 124 tests still pass
- [ ] Add JSDoc comments to utility
- [ ] Commit and push refactor
```

---

## Testing Requirements

Every feature MUST include tests. Use this checklist:

### Unit Tests (Game Logic)

For every new game mechanic:

- [ ] **Happy path** - Feature works as designed
  ```javascript
  test('should [expected behavior]', () => {
    // Arrange
    const game = new RadioactiveFroggies(12345);

    // Act
    const result = game.newFeature();

    // Assert
    expect(result).toBe(expectedValue);
  });
  ```

- [ ] **Edge cases** - Boundaries and limits
  ```javascript
  test('should handle [edge case]', () => {
    // Test minimum values
    // Test maximum values
    // Test empty states
    // Test full states
  });
  ```

- [ ] **Error cases** - Invalid input
  ```javascript
  test('should fail gracefully with [invalid input]', () => {
    const result = game.invalidOperation();
    expect(result.valid).toBe(false);
  });
  ```

- [ ] **State management** - Init/reset/update
  ```javascript
  test('should reset [feature] on game reset', () => {
    game.useFeature();
    game.reset();
    expect(game.featureState).toBe(initialState);
  });
  ```

### Integration Tests (UI)

For every new UI component:

- [ ] **Rendering** - Elements exist
  ```javascript
  test('should display [UI element]', () => {
    const element = document.getElementById('new-element');
    expect(element).toBeDefined();
  });
  ```

- [ ] **Interactions** - Clicks/inputs work
  ```javascript
  test('should [action] when [UI element] clicked', () => {
    element.click();
    expect(game.state).toBe(expectedState);
  });
  ```

- [ ] **State updates** - UI reflects changes
  ```javascript
  test('should update [UI element] when [state] changes', () => {
    game.changeState();
    expect(element.textContent).toBe(newValue);
  });
  ```

- [ ] **Visual feedback** - Animations/classes
  ```javascript
  test('should add [CSS class] on [action]', () => {
    performAction();
    expect(element.classList.contains('active')).toBe(true);
  });
  ```

---

## Documentation Updates

Update relevant docs when adding features:

### README.md
- [ ] Update feature list
- [ ] Add screenshots/GIFs
- [ ] Update installation/usage if needed

### TESTING.md
- [ ] Add testing examples for new patterns
- [ ] Update test count
- [ ] Add to "Common Patterns" if reusable

### Code Comments
- [ ] Add JSDoc to new public methods
- [ ] Comment complex algorithms
- [ ] Explain non-obvious design decisions

---

## Pre-Commit Checklist

Before committing your feature:

- [ ] All tests pass (npm test)
- [ ] Code is formatted consistently
- [ ] No console.log or debug code
- [ ] No commented-out code
- [ ] Variable names are descriptive
- [ ] Functions are single-purpose
- [ ] Documentation is updated
- [ ] Commit message is descriptive

### Good Commit Message Format

```
[Type] Brief description

Detailed explanation:
- What changed
- Why it changed
- How it works

Tests added:
- Test A: validates X
- Test B: validates Y

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** Feature, Fix, Refactor, Docs, Test, Style, Perf

---

## Example: Complete Feature Development

### Feature: Shield Powerup

**Description:** Add a shield powerup that protects against one incorrect probe

**Todo List:**
```
- [ ] Design shield mechanics
  - Shield activates on use
  - Prevents 1 move deduction on miss
  - Visual indicator when active
  - Auto-expires after use or 5 turns

- [ ] Implement game logic
  - Add 'shield' to powerup types
  - Add shieldActive flag to game state
  - Add shieldTurnsRemaining counter
  - Modify probe() to check shield status
  - Update getState() to include shield info

- [ ] Add UI components
  - Shield icon in powerup inventory
  - Shield active indicator near grid
  - Shield count badge
  - Click handler for activation

- [ ] Write unit tests (8 tests)
  - [ ] Should activate shield successfully
  - [ ] Should prevent move deduction on miss
  - [ ] Should expire after one use
  - [ ] Should expire after 5 turns
  - [ ] Should not activate when none available
  - [ ] Should reset on game reset
  - [ ] Should include in game state
  - [ ] Should not affect caught frogs

- [ ] Write integration tests (4 tests)
  - [ ] Should display shield UI
  - [ ] Should show active indicator when used
  - [ ] Should update count when used
  - [ ] Should disable button when unavailable

- [ ] Update documentation
  - [ ] Add shield to README features
  - [ ] Add shield test examples to TESTING.md
  - [ ] Add JSDoc comments to new methods

- [ ] Verify and commit
  - [ ] All 136 tests pass (124 + 12 new)
  - [ ] No console errors
  - [ ] Works on mobile and desktop
  - [ ] Commit with descriptive message
  - [ ] Push to feature branch
```

**Testing Plan:**
- 8 unit tests for game logic
- 4 integration tests for UI
- Total test count: 124 → 136

**Success Criteria:**
- Shield activates and deactivates correctly
- Move count protected when shield active
- UI clearly shows shield status
- All tests passing
- Documentation complete

---

## Tips for Success

### Start with Tests
Consider writing tests first (TDD):
1. Write failing test defining behavior
2. Implement feature to pass test
3. Refactor while keeping tests green

### Break Down Large Features
If a feature has >10 tasks, break it into smaller features:
- Phase 1: Core functionality + tests
- Phase 2: UI enhancements + tests
- Phase 3: Advanced features + tests

### Ask for Review
Before marking complete:
- Self-review the code
- Run tests multiple times
- Test edge cases manually
- Consider asking teammate to review

### Keep It Simple
- Start with minimal viable feature
- Add complexity only if needed
- Optimize after it works
- Test before and after optimization

---

## Questions?

- Check [TESTING.md](TESTING.md) for testing patterns
- Review existing features for examples
- Ask in PR review comments
- Update this template when you find gaps

Happy developing! 🚀
