# Frog Game Project

## Overview
A browser-based game with a frog theme, optimized for mobile devices and deployed via GitHub Pages.

## Project Requirements

### Core Requirements
- Browser-based game playable on desktop and mobile
- Mobile-first design and optimization
- Frog theme throughout the game
- Automated deployment to GitHub Pages
- Comprehensive automated testing
- Regression testing on all changes

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Testing**: Jest with jsdom for DOM testing
- **Deployment**: GitHub Actions → GitHub Pages
- **Development**: Feature branch workflow

## Development Workflow

### Branch Strategy
1. **Main Branch**: Production-ready code, deployed to GitHub Pages
2. **Feature Branches**: Named `claude/[description]-[session-id]`
   - Create feature branch for each change
   - Implement and test changes
   - Merge to main when complete
   - Delete feature branch after merge to keep repo clean

### Before Making Changes
1. **Always run tests**: `npm test` before starting work
2. **Create feature branch**: From main branch
3. **Make changes**: Implement feature/fix
4. **Run tests again**: Verify no regressions
5. **Commit and push**: To feature branch
6. **Merge to main**: After verification
7. **Clean up**: Delete feature branch

### Testing Requirements
- All new features must have tests
- All tests must pass before merging
- Run full test suite on each change
- GitHub Actions runs tests automatically on push
- Regression tests verify existing functionality

### Deployment
- Automatic deployment to GitHub Pages on push to main
- GitHub Actions workflow handles build and deploy
- Game accessible at: https://[username].github.io/frog/

## Project Structure

```
/
├── .claude/              # Claude project documentation
│   └── PROJECT.md       # This file
├── .github/
│   └── workflows/       # GitHub Actions workflows
│       ├── test.yml     # Run tests on push/PR
│       └── deploy.yml   # Deploy to GitHub Pages
├── src/                 # Source code
│   ├── js/             # JavaScript modules
│   ├── css/            # Stylesheets
│   └── assets/         # Images, sounds, etc.
├── tests/              # Test files
├── index.html          # Main entry point
├── package.json        # Dependencies and scripts
└── README.md          # Setup and usage instructions
```

## Important Constraints

### Git Operations
- **Branch naming**: Must start with `claude/` and end with session ID
- **Pushing**: Always use `git push -u origin <branch-name>`
- **Network errors**: Retry up to 4 times with exponential backoff
- **No dangling branches**: Delete feature branches after merge

### Code Quality
- Write clean, maintainable code
- Comment complex logic
- Mobile-first responsive design
- Cross-browser compatibility
- Performance optimization for mobile devices

### Testing
- Unit tests for game logic
- DOM tests for UI components
- Integration tests for game flow
- Test coverage should be comprehensive
- **Critical**: Always verify tests pass before and after changes

## Commands

### Development
```bash
npm install          # Install dependencies
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build for production (if needed)
npm start           # Start development server
```

### Git Workflow
```bash
git checkout main
git pull origin main
git checkout -b claude/feature-name-[session-id]
# ... make changes ...
npm test
git add .
git commit -m "Description"
git push -u origin claude/feature-name-[session-id]
# ... merge to main ...
git branch -d claude/feature-name-[session-id]
git push origin --delete claude/feature-name-[session-id]
```

## Key Principles

1. **Test-Driven Development**: Write tests, verify they fail, implement feature, verify they pass
2. **Clean Branches**: Don't let feature branches accumulate
3. **Mobile First**: Design for mobile, enhance for desktop
4. **Automated Everything**: Tests and deployment are automated
5. **Regression Prevention**: Always run full test suite

## Future Considerations
- Progressive Web App (PWA) capabilities
- Offline play support
- High score tracking
- Multiplayer features
- Sound effects and music
- Game state persistence
