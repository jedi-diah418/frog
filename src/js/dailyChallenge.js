/**
 * Daily Challenge System for Radioactive Froggies
 */

(function(isNode) {

class DailyChallenge {
  constructor() {
    this.loadData();
  }

  /**
   * Get today's date as YYYY-MM-DD string
   */
  getTodayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Generate deterministic seed from date string
   */
  getSeedFromDate(dateString) {
    // Simple hash function to convert date to seed
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      const char = dateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get today's daily challenge seed
   */
  getTodaysSeed() {
    const today = this.getTodayString();
    return this.getSeedFromDate(today);
  }

  /**
   * Load daily challenge data from localStorage
   */
  loadData() {
    try {
      if (typeof localStorage === 'undefined') {
        this.data = { completions: {}, attempts: {} };
        return;
      }
      const saved = localStorage.getItem('frog_daily_challenge');
      if (saved) {
        this.data = JSON.parse(saved);
      } else {
        this.data = {
          completions: {}, // { "2025-10-24": { count: 5, bestMoves: 12 } }
          attempts: {}      // { "2025-10-24": 3 }
        };
      }
    } catch (e) {
      console.error('Failed to load daily challenge data:', e);
      this.data = { completions: {}, attempts: {} };
    }
  }

  /**
   * Save daily challenge data to localStorage
   */
  saveData() {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem('frog_daily_challenge', JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save daily challenge data:', e);
    }
  }

  /**
   * Get today's stats
   */
  getTodaysStats() {
    const today = this.getTodayString();
    return {
      completions: this.data.completions[today] || { count: 0, bestMoves: Infinity },
      attempts: this.data.attempts[today] || 0,
      seed: this.getTodaysSeed(),
      date: today
    };
  }

  /**
   * Record a daily challenge attempt
   */
  recordAttempt() {
    const today = this.getTodayString();
    this.data.attempts[today] = (this.data.attempts[today] || 0) + 1;
    this.saveData();
  }

  /**
   * Record a daily challenge completion
   */
  recordCompletion(moves) {
    const today = this.getTodayString();

    if (!this.data.completions[today]) {
      this.data.completions[today] = {
        count: 0,
        bestMoves: Infinity
      };
    }

    this.data.completions[today].count++;

    if (moves < this.data.completions[today].bestMoves) {
      this.data.completions[today].bestMoves = moves;
    }

    this.saveData();
  }

  /**
   * Check if user has completed today's challenge
   */
  hasCompletedToday() {
    const today = this.getTodayString();
    return this.data.completions[today] && this.data.completions[today].count > 0;
  }

  /**
   * Get completion streak (consecutive days)
   */
  getStreak() {
    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

      if (this.data.completions[dateString] && this.data.completions[dateString].count > 0) {
        streak++;
      } else if (i > 0) {
        // Don't count today if not completed, but break if any other day is missed
        break;
      }
    }

    return streak;
  }

  /**
   * Get total unique days completed
   */
  getTotalDaysCompleted() {
    return Object.keys(this.data.completions).filter(
      date => this.data.completions[date].count > 0
    ).length;
  }

  /**
   * Reset data (for testing)
   */
  reset() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('frog_daily_challenge');
    }
    this.data = { completions: {}, attempts: {} };
  }
}

// Export for Node.js or browser
if (isNode) {
  module.exports = DailyChallenge;
} else {
  window.DailyChallenge = DailyChallenge;
}

})(typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require === 'function');
