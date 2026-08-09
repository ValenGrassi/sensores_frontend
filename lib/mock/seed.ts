// Deterministic pseudo-random helpers so mock data stays stable across
// requests/renders without needing to persist generated arrays.

export function hashString(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

// mulberry32 PRNG
export function createRng(seed: number) {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededRandom(seedInput: string, salt = 0): number {
  const rng = createRng(hashString(seedInput) + salt)
  return rng()
}

export function seededRange(seedInput: string, min: number, max: number, salt = 0): number {
  return min + seededRandom(seedInput, salt) * (max - min)
}
