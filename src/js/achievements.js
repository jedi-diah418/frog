/**
 * Achievement System for Radioactive Froggies
 */

class AchievementManager {
  constructor() {
    this.achievements = {
      firstBlood: {
        id: 'firstBlood',
        name: 'First Blood',
        description: 'Catch your first frog',
        icon: '🎯',
        unlocked: false,
        check: (stats) => stats.totalFrogsCaught >= 1
      },
      sharpshooter: {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Win a game in 15 moves or less',
        icon: '🎖️',
        unlocked: false,
        check: (stats) => stats.bestMoves <= 15
      },
      megaHunter: {
        id: 'megaHunter',
        name: 'Mega Hunter',
        description: 'Catch 3+ frogs with one mega-probe',
        icon: '💥',
        unlocked: false,
        check: (stats) => stats.maxMegaProbeCapture >= 3
      },
      perfectGame: {
        id: 'perfectGame',
        name: 'Perfect Game',
        description: 'Win without missing a single probe',
        icon: '⭐',
        unlocked: false,
        check: (stats) => stats.perfectGames >= 1
      },
      hotStreak: {
        id: 'hotStreak',
        name: 'Hot Streak',
        description: 'Win 3 games in a row',
        icon: '🔥',
        unlocked: false,
        check: (stats) => stats.maxWinStreak >= 3
      },
      dedication: {
        id: 'dedication',
        name: 'Dedication',
        description: 'Play 10 games',
        icon: '💪',
        unlocked: false,
        check: (stats) => stats.totalGames >= 10
      },
      powerUser: {
        id: 'powerUser',
        name: 'Power User',
        description: 'Use 5 powerups',
        icon: '⚡',
        unlocked: false,
        check: (stats) => stats.powerupsUsed >= 5
      },
      lucky: {
        id: 'lucky',
        name: 'Lucky Shot',
        description: 'Catch a frog on your first probe',
        icon: '🍀',
        unlocked: false,
        check: (stats) => stats.firstProbeCatches >= 1
      },
      efficient: {
        id: 'efficient',
        name: 'Efficiency Expert',
        description: 'Win with 90% accuracy or better',
        icon: '📊',
        unlocked: false,
        check: (stats) => stats.bestAccuracy >= 90
      },
      explorer: {
        id: 'explorer',
        name: 'Explorer',
        description: 'Find 5 hidden powerups',
        icon: '🗺️',
        unlocked: false,
        check: (stats) => stats.powerupsFound >= 5
      }
    };

    this.stats = {
      totalGames: 0,
      totalWins: 0,
      totalFrogsCaught: 0,
      bestMoves: Infinity,
      bestAccuracy: 0,
      maxMegaProbeCapture: 0,
      perfectGames: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      powerupsUsed: 0,
      powerupsFound: 0,
      firstProbeCatches: 0
    };

    this.loadProgress();
  }

  /**
   * Load achievement progress from localStorage
   */
  loadProgress() {
    try {
      const saved = localStorage.getItem('frog_achievements');
      if (saved) {
        const data = JSON.parse(saved);

        // Load stats
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }

        // Load unlocked achievements
        if (data.unlocked) {
          data.unlocked.forEach(id => {
            if (this.achievements[id]) {
              this.achievements[id].unlocked = true;
            }
          });
        }
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
  }

  /**
   * Save achievement progress to localStorage
   */
  saveProgress() {
    try {
      const unlocked = Object.keys(this.achievements)
        .filter(id => this.achievements[id].unlocked);

      const data = {
        stats: this.stats,
        unlocked: unlocked,
        lastUpdate: new Date().toISOString()
      };

      localStorage.setItem('frog_achievements', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  /**
   * Check and unlock achievements based on current stats
   * Returns array of newly unlocked achievements
   */
  checkAchievements() {
    const newlyUnlocked = [];

    Object.values(this.achievements).forEach(achievement => {
      if (!achievement.unlocked && achievement.check(this.stats)) {
        achievement.unlocked = true;
        newlyUnlocked.push(achievement);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveProgress();
    }

    return newlyUnlocked;
  }

  /**
   * Record a game completion
   */
  recordGame(won, moves, totalProbes, frogsCaught, wasPerfect = false) {
    this.stats.totalGames++;

    if (won) {
      this.stats.totalWins++;
      this.stats.currentWinStreak++;
      this.stats.maxWinStreak = Math.max(this.stats.maxWinStreak, this.stats.currentWinStreak);

      // Track best moves
      if (moves < this.stats.bestMoves) {
        this.stats.bestMoves = moves;
      }

      // Track accuracy (catches / total probes)
      const accuracy = (frogsCaught / totalProbes) * 100;
      if (accuracy > this.stats.bestAccuracy) {
        this.stats.bestAccuracy = Math.round(accuracy);
      }

      // Track perfect games
      if (wasPerfect) {
        this.stats.perfectGames++;
      }
    } else {
      this.stats.currentWinStreak = 0;
    }

    this.stats.totalFrogsCaught += frogsCaught;

    this.saveProgress();
    return this.checkAchievements();
  }

  /**
   * Record powerup usage
   */
  recordPowerupUsed() {
    this.stats.powerupsUsed++;
    this.saveProgress();
    return this.checkAchievements();
  }

  /**
   * Record powerup found
   */
  recordPowerupFound() {
    this.stats.powerupsFound++;
    this.saveProgress();
    return this.checkAchievements();
  }

  /**
   * Record mega-probe capture
   */
  recordMegaProbeCapture(count) {
    if (count > this.stats.maxMegaProbeCapture) {
      this.stats.maxMegaProbeCapture = count;
      this.saveProgress();
      return this.checkAchievements();
    }
    return [];
  }

  /**
   * Record first probe catch
   */
  recordFirstProbeCatch() {
    this.stats.firstProbeCatches++;
    this.saveProgress();
    return this.checkAchievements();
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Object.values(this.achievements);
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return Object.values(this.achievements).filter(a => a.unlocked);
  }

  /**
   * Get stats
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * Reset all progress (for testing)
   */
  reset() {
    localStorage.removeItem('frog_achievements');
    this.stats = {
      totalGames: 0,
      totalWins: 0,
      totalFrogsCaught: 0,
      bestMoves: Infinity,
      bestAccuracy: 0,
      maxMegaProbeCapture: 0,
      perfectGames: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      powerupsUsed: 0,
      powerupsFound: 0,
      firstProbeCatches: 0
    };
    Object.values(this.achievements).forEach(a => a.unlocked = false);
  }
}
