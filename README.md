# ☢️ Radioactive Froggies

Hunt radioactive frogs in a nighttime forest using your radiation detector! A puzzle game where you use radiation readings to triangulate and capture escaped radioactive frogs before time runs out.

![Night Forest Theme](https://img.shields.io/badge/theme-nuclear%20forest-green) ![Mobile Optimized](https://img.shields.io/badge/mobile-optimized-blue) ![Tests](https://img.shields.io/badge/tests-124%20passing-brightgreen)

## Game Overview

In this minesweeper-inspired puzzle game, you must locate and capture 5 radioactive frogs hidden across a 10x10 grid forest. Use your radiation detector to probe tiles - the closer you get to a frog, the higher the radiation reading. But be careful! The frogs are scared and will hop away if you probe too close without catching them.

### Key Features

- **Radiation Detection System**: Distance-based radiation readings guide you to hidden frogs
- **Dual Radiation Display**: See radiation before AND after frogs hop to track movement
- **Powerup System**: Collect and use powerups like the Sweeping Radar to reveal frog locations
- **Dynamic Frog AI**: Frogs hop away when you probe nearby, adding strategic challenge
- **Seeded Levels**: Share level codes with friends to compete on the same puzzle
- **Move Limit**: Catch all frogs within 50 moves or they'll dry up from radiation
- **Mobile-First Design**: Optimized for touchscreen devices and mobile browsers
- **Night Forest Aesthetic**: Immersive dark theme with glowing radiation indicators

## How to Play

1. **Probe tiles** to detect radiation levels
2. **Watch the meter** - higher radiation means you're getting closer to a frog
3. **Follow the trend** - "HOTTER" or "COLDER" tells you if you're on the right track
4. **Catch all 5 frogs** before running out of moves
5. **Share your level** - Send the URL to friends to compete on the same puzzle

### Game Mechanics

- **Grid**: 10x10 forest tiles
- **Frogs**: 5 radioactive froggies per level
- **Detection Range**: 5 tiles (Manhattan distance)
- **Frog Scare Radius**: 2 tiles - they hop if you probe this close
- **Move Limit**: 50 probes maximum
- **Radiation Amplification**: Multiple nearby frogs create stronger readings

## Quick Start

### Play Online

Visit the live game: `https://[username].github.io/frog/`

### Play with a Specific Seed

Share levels by adding `?seed=123456` to the URL:
```
https://[username].github.io/frog/?seed=123456
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/[username]/frog.git
cd frog

# Install dependencies
npm install

# Run tests (124 tests)
npm test

# Start development server
npm start
```

Visit `http://localhost:3000` to play locally.

## Project Structure

```
frog/
├── .claude/                    # AI assistant guidelines
│   └── PROJECT.md             # Development workflow
├── .github/                   # GitHub configuration
│   ├── workflows/             # CI/CD pipelines
│   │   ├── test.yml          # Automated testing
│   │   └── deploy.yml        # GitHub Pages deployment
│   ├── ISSUE_TEMPLATE/       # Issue templates
│   │   ├── feature_request.md
│   │   └── bug_report.md
│   └── pull_request_template.md
├── src/
│   ├── js/
│   │   ├── seededRandom.js   # Deterministic RNG
│   │   ├── radioactiveFroggies.js  # Core game logic
│   │   └── ui.js             # UI controller
│   ├── css/
│   │   └── style.css         # Night forest theme
│   └── assets/               # Game assets
├── tests/                     # Jest test suite (124 tests)
│   ├── seededRandom.test.js
│   ├── radioactiveFroggies.test.js
│   ├── game.test.js
│   └── integration.test.js
├── index.html                 # Main entry point
├── package.json              # Dependencies & scripts
├── TESTING.md                # Testing guide & standards
├── TODO_TEMPLATE.md          # Feature development template
└── README.md                 # This file
```

## Development

### Testing

All game mechanics are thoroughly tested with 124 automated tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**
- ✅ Seeded random number generation (19 tests)
- ✅ Game initialization and state management (8 tests)
- ✅ Radiation calculation and detection (7 tests)
- ✅ Frog placement and hopping mechanics (11 tests)
- ✅ Powerup system (11 tests)
- ✅ Dual radiation tracking (5 tests)
- ✅ Frog movement prevention (2 tests)
- ✅ Win/lose conditions (4 tests)
- ✅ Edge cases and regression prevention (12 tests)
- ✅ Legacy game compatibility (24 tests)
- ✅ UI integration tests (15 tests)

**See [TESTING.md](TESTING.md) for detailed testing guidelines and examples.**

### Development Workflow

This project follows a strict testing and branching workflow:

1. **Feature Branches**: All changes go through feature branches
2. **Test-First**: Run `npm test` before AND after changes
3. **Automated CI**: Tests run automatically on push
4. **Deploy on Success**: GitHub Pages deploys only when tests pass
5. **Clean Up**: Delete feature branches after merging

**Development Resources:**
- 📖 [TESTING.md](TESTING.md) - Comprehensive testing guide
- 📋 [TODO_TEMPLATE.md](TODO_TEMPLATE.md) - Feature development templates
- 🐛 [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔀 [Pull Request Template](.github/pull_request_template.md)

See `.claude/PROJECT.md` for detailed workflow guidelines.

### Making Changes

```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b claude/your-feature-name-[session-id]

# Run baseline tests
npm test

# Make your changes...

# Verify no regressions
npm test

# Commit and push
git add .
git commit -m "Your changes"
git push -u origin claude/your-feature-name-[session-id]

# Merge to main
git checkout main
git merge claude/your-feature-name-[session-id]
git push origin main

# Clean up
git branch -d claude/your-feature-name-[session-id]
git push origin --delete claude/your-feature-name-[session-id]
```

## Game Design Details

### Radiation Calculation

Radiation intensity is calculated using Manhattan distance:

```
radiation = Σ max(0, (RANGE + 1 - distance))
```

Where:
- `RANGE = 5` tiles
- Multiple frogs amplify the signal
- Distance = |x₁ - x₂| + |y₁ - y₂|

### Frog Hopping Behavior

When you probe within 2 tiles of a frog without catching it:
- Frog hops 2-3 tiles away
- Stays within grid bounds
- Won't hop onto another frog's position
- Direction is seeded random (deterministic)

### Seeded Randomness

Every level is generated from a numeric seed:
- Same seed = same frog positions
- Enables competitive sharing
- Deterministic frog hopping
- Level codes are 6-digit numbers

## Deployment

The game auto-deploys to GitHub Pages when you push to `main`:

1. GitHub Actions runs all tests
2. If tests pass, deploys to GitHub Pages
3. If tests fail, deployment is blocked
4. Live at: `https://[username].github.io/frog/`

### First-Time Setup

1. Go to repo Settings → Pages
2. Set source to "GitHub Actions"
3. Push to main branch
4. Site will be live in ~1 minute

## Browser Support

- ✅ Chrome/Edge (latest 2 versions)
- ✅ Firefox (latest 2 versions)
- ✅ Safari (latest 2 versions)
- ✅ iOS Safari
- ✅ Chrome Mobile
- ✅ Touch-optimized for all mobile devices

## Future Enhancements

- [ ] Different difficulty levels (more frogs, smaller grid, fewer moves)
- [ ] Daily challenge mode
- [ ] Leaderboard for fastest solutions
- [ ] Hint system (reveal closest frog)
- [ ] Sound effects and ambient forest sounds
- [ ] Progressive Web App (PWA) for offline play
- [ ] Achievement system
- [ ] Tutorial for new players
- [ ] Accessibility improvements (screen reader support)

## Contributing

We welcome contributions! Please follow these steps:

### Quick Start

1. **Review Documentation**
   - Read [TESTING.md](TESTING.md) for testing standards
   - Check [TODO_TEMPLATE.md](TODO_TEMPLATE.md) for development workflow
   - Use issue templates for bugs/features

2. **Create Feature Branch**
   ```bash
   git checkout -b your-feature-name
   ```

3. **Follow Development Template**
   - Use [TODO_TEMPLATE.md](TODO_TEMPLATE.md) to plan your work
   - Write tests BEFORE or ALONGSIDE implementation
   - Include unit tests for game logic
   - Include integration tests for UI changes

4. **Ensure Quality**
   - All 124+ tests must pass
   - Add tests for new features
   - Update documentation
   - Follow existing code style

5. **Submit Pull Request**
   - Fill out [PR template](.github/pull_request_template.md)
   - Include test results
   - Link related issues
   - Wait for review

### Testing Requirements

Every new feature MUST include:
- ✅ Unit tests for game logic
- ✅ Integration tests for UI
- ✅ Edge case coverage
- ✅ Error handling tests

**Example:** Adding a new powerup requires ~8-12 new tests.

See [TESTING.md](TESTING.md) for detailed examples and patterns.

### Code of Conduct

- Be respectful and constructive
- Test thoroughly before submitting
- Document complex logic
- Ask questions in issues/PRs

## Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Testing**: Jest with jsdom (124 tests, 100% critical path coverage)
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages
- **Development**: Node.js 18+
- **Quality**: Comprehensive test suite, PR templates, issue templates

## License

MIT

## Acknowledgments

Inspired by classic puzzle games like Minesweeper, with a unique twist on the hot-and-cold guessing game mechanic. Built with a focus on mobile UX, deterministic gameplay, and comprehensive automated testing.

---

**Have fun hunting radioactive froggies! 🐸☢️**
