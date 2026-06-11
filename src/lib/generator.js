// Procedural puzzle generator.
// Seeded PRNG means the same seed always produces the same puzzle,
// so "Level 12" or "Daily 2026-06-11" is identical for every player
// and leaderboard times stay comparable.

function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function shuffle(arr, rand) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Random Hamiltonian path via the "backbite" algorithm:
// start from a snake path, then repeatedly rewire one end —
// pick a grid neighbor v of the endpoint, cut the edge after v,
// and reverse the tail. Each move keeps the path Hamiltonian,
// and after ~30·N² moves the path is thoroughly randomized.
// Guaranteed O(moves · N²) — no backtracking blowups at any size.
function generateHamiltonianPath(n, rand) {
  const total = n * n

  let path = []
  for (let r = 0; r < n; r++) {
    if (r % 2 === 0) for (let c = 0; c < n; c++) path.push([r, c])
    else for (let c = n - 1; c >= 0; c--) path.push([r, c])
  }

  const neighborsOf = (r, c) => {
    const out = []
    if (r > 0) out.push([r - 1, c])
    if (r < n - 1) out.push([r + 1, c])
    if (c > 0) out.push([r, c - 1])
    if (c < n - 1) out.push([r, c + 1])
    return out
  }

  const iterations = total * 30
  for (let it = 0; it < iterations; it++) {
    if (rand() < 0.5) path.reverse() // alternate which end gets rewired
    const [tr, tc] = path[total - 1]
    const [pr, pc] = path[total - 2]
    const options = neighborsOf(tr, tc).filter(([r, c]) => !(r === pr && c === pc))
    if (options.length === 0) continue
    const [vr, vc] = options[Math.floor(rand() * options.length)]
    const i = path.findIndex(([r, c]) => r === vr && c === vc)
    // keep path[0..i], then walk back from the old tail to i+1
    path = path.slice(0, i + 1).concat(path.slice(i + 1).reverse())
  }

  return path
}

// Pick waypoint indices along the path: always first and last cell,
// the rest spread roughly evenly with seeded jitter.
function placeWaypoints(path, count, rand) {
  const total = path.length
  const indices = new Set([0, total - 1])
  const middles = count - 2
  for (let i = 1; i <= middles; i++) {
    const base = Math.round((i * (total - 1)) / (middles + 1))
    const jitter = Math.floor((rand() - 0.5) * (total / (middles + 1)) * 0.6)
    let idx = Math.max(1, Math.min(total - 2, base + jitter))
    while (indices.has(idx) && idx < total - 1) idx++
    indices.add(idx)
  }
  const sorted = [...indices].sort((a, b) => a - b)
  const waypoints = {}
  sorted.forEach((pathIdx, i) => {
    const [r, c] = path[pathIdx]
    waypoints[`${r},${c}`] = i + 1
  })
  return waypoints
}

// Walls go only on edges the solution does NOT traverse,
// so the generated solution is always valid.
function placeWalls(path, n, count, rand) {
  const used = new Set()
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1].join(',')
    const b = path[i].join(',')
    used.add(`${a}|${b}`)
    used.add(`${b}|${a}`)
  }
  const candidates = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c + 1 < n && !used.has(`${r},${c}|${r},${c + 1}`)) {
        candidates.push({ from: [r, c], to: [r, c + 1] })
      }
      if (r + 1 < n && !used.has(`${r},${c}|${r + 1},${c}`)) {
        candidates.push({ from: [r, c], to: [r + 1, c] })
      }
    }
  }
  shuffle(candidates, rand)
  return candidates.slice(0, Math.min(count, candidates.length))
}

export function generatePuzzle({ seed, size, waypointCount, wallCount, id, name, difficulty }) {
  const rand = mulberry32(typeof seed === 'string' ? hashString(seed) : seed)
  const solution = generateHamiltonianPath(size, rand)
  const waypoints = placeWaypoints(solution, waypointCount, rand)
  const walls = placeWalls(solution, size, wallCount, rand)
  return { id, name, difficulty, size, waypoints, walls, solution }
}
