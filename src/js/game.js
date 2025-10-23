/**
 * Frog Game - Main game logic
 */

class FrogGame {
  constructor() {
    this.frogEmojis = ['🐸', '🐊', '🦎'];
    this.currentFrogIndex = 0;
    this.hopCount = 0;
    this.messageElement = null;
    this.frogElement = null;
  }

  /**
   * Initialize the game with DOM elements
   */
  init() {
    this.frogElement = document.getElementById('frog-display');
    this.messageElement = document.getElementById('message');

    if (this.frogElement) {
      this.frogElement.addEventListener('click', () => this.handleFrogClick());
    }

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.reset());
    }

    this.updateDisplay();
  }

  /**
   * Handle frog click event
   */
  handleFrogClick() {
    this.hopCount++;
    this.updateDisplay();

    if (this.hopCount % 5 === 0) {
      this.changeFrog();
    }
  }

  /**
   * Change to a different frog
   */
  changeFrog() {
    this.currentFrogIndex = (this.currentFrogIndex + 1) % this.frogEmojis.length;
    this.updateDisplay();
  }

  /**
   * Update the display with current state
   */
  updateDisplay() {
    if (this.frogElement) {
      this.frogElement.textContent = this.getCurrentFrog();
    }

    if (this.messageElement) {
      this.messageElement.textContent = this.getMessage();
    }
  }

  /**
   * Get the current frog emoji
   */
  getCurrentFrog() {
    return this.frogEmojis[this.currentFrogIndex];
  }

  /**
   * Get the current message based on hop count
   */
  getMessage() {
    if (this.hopCount === 0) {
      return 'Click the frog to make it hop!';
    } else if (this.hopCount === 1) {
      return '1 hop! Keep going!';
    } else if (this.hopCount < 5) {
      return `${this.hopCount} hops! You're doing great!`;
    } else if (this.hopCount === 5) {
      return `${this.hopCount} hops! You found a new friend!`;
    } else if (this.hopCount < 10) {
      return `${this.hopCount} hops! Amazing!`;
    } else {
      return `${this.hopCount} hops! You're a hopping champion!`;
    }
  }

  /**
   * Get the current hop count
   */
  getHopCount() {
    return this.hopCount;
  }

  /**
   * Reset the game
   */
  reset() {
    this.hopCount = 0;
    this.currentFrogIndex = 0;
    this.updateDisplay();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FrogGame;
}
