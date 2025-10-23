# Frog Game

A fun, interactive browser-based game with a frog theme, optimized for mobile devices.

## Features

- Mobile-first responsive design
- Animated frog character that hops when clicked
- Multiple frog types that appear as you play
- Touch-optimized controls
- Automated testing with Jest
- Continuous deployment to GitHub Pages
- Clean feature branch workflow

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/[username]/frog.git
cd frog

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm start
```

Visit `http://localhost:3000` (or the port shown) to play the game.

## Development Workflow

### Important: Feature Branch Strategy

This project uses a clean feature branch workflow. Follow these steps for any changes:

1. **Start from main branch:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b claude/your-feature-name-[session-id]
   ```
   Note: Branch names must start with `claude/` and end with your session ID.

3. **Run tests before making changes:**
   ```bash
   npm test
   ```

4. **Make your changes and test:**
   - Edit code
   - Add/update tests
   - Run `npm test` to verify no regressions

5. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push -u origin claude/your-feature-name-[session-id]
   ```

6. **Merge to main:**
   ```bash
   git checkout main
   git merge claude/your-feature-name-[session-id]
   git push origin main
   ```

7. **Clean up feature branch:**
   ```bash
   git branch -d claude/your-feature-name-[session-id]
   git push origin --delete claude/your-feature-name-[session-id]
   ```

### Testing

All changes must pass tests before merging:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Automated CI/CD

- **Tests**: Automatically run on every push and pull request
- **Deployment**: Automatically deploys to GitHub Pages when pushed to main
- Tests must pass before deployment proceeds

## Project Structure

```
frog/
├── .claude/              # Claude AI project documentation
│   └── PROJECT.md       # Detailed project guidelines
├── .github/
│   └── workflows/       # GitHub Actions workflows
│       ├── test.yml     # Automated testing
│       └── deploy.yml   # GitHub Pages deployment
├── src/
│   ├── js/             # JavaScript source files
│   │   └── game.js     # Main game logic
│   ├── css/            # Stylesheets
│   │   └── style.css   # Main styles (mobile-first)
│   └── assets/         # Images, sounds, etc.
├── tests/              # Test files
│   └── game.test.js    # Game logic tests
├── index.html          # Main entry point
├── package.json        # Dependencies and scripts
├── jest.config.js      # Jest configuration
└── README.md          # This file
```

## Available Scripts

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm start` - Start development server
- `npm run build` - Build for production (currently no-op for static site)

## Deployment

The game is automatically deployed to GitHub Pages when changes are pushed to the main branch.

**Live URL:** `https://[username].github.io/frog/`

### Setting Up GitHub Pages

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "GitHub Actions"
4. The deploy workflow will handle the rest

## Game Features

### Current Features
- Click/tap the frog to make it hop
- Hop counter tracks your progress
- Every 5 hops reveals a new frog friend
- Reset button to start over
- Responsive design for all screen sizes
- Touch-optimized for mobile devices

### Future Enhancements
- Game levels and challenges
- Score tracking and leaderboards
- Sound effects and music
- Power-ups and special abilities
- Multiplayer mode
- PWA support for offline play
- Game state persistence

## Testing Philosophy

This project emphasizes thorough testing:

- **Unit tests**: Test individual functions and methods
- **DOM tests**: Test UI interactions and updates
- **Integration tests**: Test complete game flows
- **Regression testing**: Every change must pass all existing tests

See `.claude/PROJECT.md` for detailed testing guidelines.

## Contributing

1. Always create a feature branch
2. Write tests for new features
3. Ensure all tests pass
4. Keep feature branches short-lived
5. Clean up branches after merging

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT

## Need Help?

- Check `.claude/PROJECT.md` for detailed guidelines
- Review existing tests in `tests/` directory
- Check GitHub Actions logs for CI/CD issues
