/**
 * Seeded Random Number Generator
 * Uses a simple LCG (Linear Congruential Generator) for deterministic randomness
 */

(function(isNode) {

class SeededRandom {
  constructor(seed) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  /**
   * Returns a pseudo-random number between 0 and 1
   */
  next() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive)
   */
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Returns a random element from an array
   */
  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Shuffles an array in place using Fisher-Yates algorithm
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// Export for Node.js or browser
if (isNode) {
  module.exports = SeededRandom;
} else {
  window.SeededRandom = SeededRandom;
}

})(typeof module !== 'undefined' && typeof module.exports !== 'undefined' && typeof require === 'function');
