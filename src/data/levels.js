import { generatePuzzle } from '../lib/generator.js'

// Difficulty curve: every 4 levels the grid grows (4x4 → 8x8),
// and within each tier the walls pile up and waypoints thin out.
export function getLevelConfig(level) {
  const tier = Math.min(Math.floor((level - 1) / 4), 4) // 0..4
  const step = (level - 1) % 4                          // 0..3 within tier
  const size = 4 + tier                                 // 4..8
  const cells = size * size

  const waypointCount = Math.max(3, Math.round(cells / 6) - step)
  const wallCount = Math.round(cells * (0.06 + step * 0.05))

  const difficulty =
    size <= 4 ? 'easy' :
    size === 5 ? (step < 2 ? 'easy' : 'medium') :
    size === 6 ? (step < 2 ? 'medium' : 'hard') :
    size === 7 ? (step < 2 ? 'hard' : 'expert') :
    'expert'

  return { size, waypointCount, wallCount, difficulty }
}

export function makeLevelPuzzle(level) {
  const cfg = getLevelConfig(level)
  return generatePuzzle({
    seed: `zip-level-${level}`,
    size: cfg.size,
    waypointCount: cfg.waypointCount,
    wallCount: cfg.wallCount,
    id: `level_${level}`,
    name: `Level ${level}`,
    difficulty: cfg.difficulty,
  })
}

export function todayKey() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Daily challenge: same puzzle worldwide for a given date.
// Grows through the week — gentle Monday, brutal weekend.
export function makeDailyPuzzle(dateKey = todayKey()) {
  const dow = new Date(dateKey + 'T12:00:00').getDay() // 0 Sun .. 6 Sat
  const size = [7, 5, 5, 6, 6, 7, 7][dow]
  const wallFactor = [0.16, 0.08, 0.10, 0.10, 0.12, 0.14, 0.16][dow]
  const cells = size * size
  return generatePuzzle({
    seed: `zip-daily-${dateKey}`,
    size,
    waypointCount: Math.max(4, Math.round(cells / 6)),
    wallCount: Math.round(cells * wallFactor),
    id: `daily_${dateKey}`,
    name: `Daily ${dateKey}`,
    difficulty: size <= 5 ? 'medium' : size === 6 ? 'hard' : 'expert',
  })
}

// localStorage progress
const PROGRESS_KEY = 'zip-progress'

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      return { unlocked: p.unlocked || 1, best: p.best || {} }
    }
  } catch { /* corrupted storage — start fresh */ }
  return { unlocked: 1, best: {} }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch { /* storage unavailable (private mode) — progress just won't persist */ }
}
