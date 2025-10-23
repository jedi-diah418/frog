/**
 * Tests for SeededRandom
 */

const SeededRandom = require('../src/js/seededRandom.js');

describe('SeededRandom', () => {
  describe('Initialization', () => {
    test('should create instance with seed', () => {
      const rng = new SeededRandom(12345);
      expect(rng).toBeInstanceOf(SeededRandom);
      expect(rng.seed).toBeDefined();
    });

    test('should handle zero seed', () => {
      const rng = new SeededRandom(0);
      expect(rng.seed).toBeGreaterThan(0);
    });

    test('should handle negative seed', () => {
      const rng = new SeededRandom(-100);
      expect(rng.seed).toBeGreaterThan(0);
    });
  });

  describe('Determinism', () => {
    test('should produce same sequence for same seed', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(42);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }

      expect(sequence1).toEqual(sequence2);
    });

    test('should produce different sequences for different seeds', () => {
      const rng1 = new SeededRandom(42);
      const rng2 = new SeededRandom(43);

      const val1 = rng1.next();
      const val2 = rng2.next();

      expect(val1).not.toBe(val2);
    });
  });

  describe('next() method', () => {
    test('should return values between 0 and 1', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    test('should produce different values on successive calls', () => {
      const rng = new SeededRandom(12345);
      const val1 = rng.next();
      const val2 = rng.next();

      expect(val1).not.toBe(val2);
    });
  });

  describe('nextInt() method', () => {
    test('should return integers in range', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(0, 10);
        expect(Number.isInteger(val)).toBe(true);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    test('should work with single value range', () => {
      const rng = new SeededRandom(12345);
      const val = rng.nextInt(5, 5);
      expect(val).toBe(5);
    });

    test('should work with negative range', () => {
      const rng = new SeededRandom(12345);

      for (let i = 0; i < 50; i++) {
        const val = rng.nextInt(-10, -5);
        expect(val).toBeGreaterThanOrEqual(-10);
        expect(val).toBeLessThanOrEqual(-5);
      }
    });

    test('should be deterministic', () => {
      const rng1 = new SeededRandom(100);
      const rng2 = new SeededRandom(100);

      for (let i = 0; i < 20; i++) {
        expect(rng1.nextInt(0, 100)).toBe(rng2.nextInt(0, 100));
      }
    });
  });

  describe('choice() method', () => {
    test('should return element from array', () => {
      const rng = new SeededRandom(12345);
      const arr = ['a', 'b', 'c', 'd'];

      for (let i = 0; i < 20; i++) {
        const choice = rng.choice(arr);
        expect(arr).toContain(choice);
      }
    });

    test('should work with single element array', () => {
      const rng = new SeededRandom(12345);
      const arr = ['only'];
      expect(rng.choice(arr)).toBe('only');
    });

    test('should be deterministic', () => {
      const rng1 = new SeededRandom(999);
      const rng2 = new SeededRandom(999);
      const arr = [1, 2, 3, 4, 5];

      for (let i = 0; i < 10; i++) {
        expect(rng1.choice(arr)).toBe(rng2.choice(arr));
      }
    });
  });

  describe('shuffle() method', () => {
    test('should return array with same elements', () => {
      const rng = new SeededRandom(12345);
      const arr = [1, 2, 3, 4, 5];
      const shuffled = rng.shuffle(arr);

      expect(shuffled.length).toBe(arr.length);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    test('should not modify original array', () => {
      const rng = new SeededRandom(12345);
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      rng.shuffle(arr);

      expect(arr).toEqual(original);
    });

    test('should be deterministic', () => {
      const rng1 = new SeededRandom(777);
      const rng2 = new SeededRandom(777);
      const arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const arr2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      const shuffled1 = rng1.shuffle(arr1);
      const shuffled2 = rng2.shuffle(arr2);

      expect(shuffled1).toEqual(shuffled2);
    });

    test('should produce different order (usually)', () => {
      const rng = new SeededRandom(12345);
      const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffled = rng.shuffle(arr);

      // With high probability, at least one element should be in different position
      let different = false;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== shuffled[i]) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });
  });

  describe('Distribution', () => {
    test('should have roughly uniform distribution', () => {
      const rng = new SeededRandom(12345);
      const buckets = [0, 0, 0, 0, 0];
      const iterations = 1000;

      for (let i = 0; i < iterations; i++) {
        const val = rng.nextInt(0, 4);
        buckets[val]++;
      }

      // Each bucket should have roughly 20% (200 ± 100)
      for (const count of buckets) {
        expect(count).toBeGreaterThan(100);
        expect(count).toBeLessThan(300);
      }
    });
  });
});
