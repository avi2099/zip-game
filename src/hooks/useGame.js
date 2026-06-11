import { useState, useCallback, useEffect } from 'react'

export function useGame(puzzle) {
  const [path, setPath] = useState([])
  const [hintsUsed, setHintsUsed] = useState(0)
  const [solved, setSolved] = useState(false)
  const [started, setStarted] = useState(false)

  const maxHints = 3

  useEffect(() => {
    setPath([])
    setHintsUsed(0)
    setSolved(false)
    setStarted(false)
  }, [puzzle?.id])

  const getWallSet = useCallback(() => {
    if (!puzzle) return new Set()
    const set = new Set()
    for (const wall of puzzle.walls) {
      const [r1, c1] = wall.from
      const [r2, c2] = wall.to
      set.add(`${r1},${c1}|${r2},${c2}`)
      set.add(`${r2},${c2}|${r1},${c1}`)
    }
    return set
  }, [puzzle])

  const isAdjacent = useCallback((r1, c1, r2, c2) => {
    return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1
  }, [])

  const isWallBlocked = useCallback((r1, c1, r2, c2) => {
    const walls = getWallSet()
    return walls.has(`${r1},${c1}|${r2},${c2}`)
  }, [getWallSet])

  const pathSet = new Set(path.map(([r, c]) => `${r},${c}`))

  const getNextRequiredWaypoint = useCallback(() => {
    if (!puzzle) return null
    const wpEntries = Object.entries(puzzle.waypoints)
      .map(([key, num]) => ({ key, num, pos: key.split(',').map(Number) }))
      .sort((a, b) => a.num - b.num)

    for (const wp of wpEntries) {
      if (!path.some(([r, c]) => r === wp.pos[0] && c === wp.pos[1])) {
        return wp
      }
    }
    return null
  }, [puzzle, path])

  const canMoveTo = useCallback((row, col) => {
    if (!puzzle || solved) return false
    const key = `${row},${col}`
    if (pathSet.has(key)) return false
    if (row < 0 || row >= puzzle.size || col < 0 || col >= puzzle.size) return false

    if (path.length === 0) {
      const firstWp = Object.entries(puzzle.waypoints)
        .find(([, num]) => num === 1)
      if (!firstWp) return false
      return firstWp[0] === key
    }

    const [lastR, lastC] = path[path.length - 1]
    if (!isAdjacent(lastR, lastC, row, col)) return false
    if (isWallBlocked(lastR, lastC, row, col)) return false

    const wpNum = puzzle.waypoints[key]
    if (wpNum) {
      const nextWp = getNextRequiredWaypoint()
      if (!nextWp || wpNum !== nextWp.num) return false
    }

    return true
  }, [puzzle, path, pathSet, solved, isAdjacent, isWallBlocked, getNextRequiredWaypoint])

  const checkWin = useCallback((currentPath) => {
    if (!puzzle) return false
    const n = puzzle.size
    if (currentPath.length !== n * n) return false

    const wpEntries = Object.entries(puzzle.waypoints)
      .sort(([, a], [, b]) => a - b)
    let wpIdx = 0
    for (const [r, c] of currentPath) {
      const key = `${r},${c}`
      if (wpIdx < wpEntries.length && wpEntries[wpIdx][0] === key) {
        wpIdx++
      }
    }
    return wpIdx === wpEntries.length
  }, [puzzle])

  const addCell = useCallback((row, col) => {
    if (!canMoveTo(row, col)) return false

    if (path.length === 0) setStarted(true)

    const newPath = [...path, [row, col]]
    setPath(newPath)

    if (checkWin(newPath)) {
      setSolved(true)
    }
    return true
  }, [path, canMoveTo, checkWin])

  const undo = useCallback(() => {
    if (path.length === 0 || solved) return
    setPath(path.slice(0, -1))
    if (path.length === 1) setStarted(false)
  }, [path, solved])

  const clear = useCallback(() => {
    setPath([])
    setSolved(false)
    setStarted(false)
  }, [])

  const useHint = useCallback(() => {
    if (!puzzle || solved || hintsUsed >= maxHints) return
    const sol = puzzle.solution
    const currentLen = path.length

    if (currentLen < sol.length) {
      let matchLen = 0
      for (let i = 0; i < Math.min(path.length, sol.length); i++) {
        if (path[i][0] === sol[i][0] && path[i][1] === sol[i][1]) {
          matchLen = i + 1
        } else break
      }

      if (matchLen < path.length) {
        setPath(sol.slice(0, matchLen + 1))
      } else {
        setPath(sol.slice(0, currentLen + 1))
      }

      if (!started) setStarted(true)
      setHintsUsed(h => h + 1)
    }
  }, [puzzle, path, solved, hintsUsed, started])

  const moveByKey = useCallback((direction) => {
    if (!puzzle || solved) return
    if (path.length === 0) return

    const [r, c] = path[path.length - 1]
    const deltas = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }
    const [dr, dc] = deltas[direction] || [0, 0]
    addCell(r + dr, c + dc)
  }, [puzzle, path, solved, addCell])

  return {
    path,
    pathSet,
    hintsUsed,
    maxHints,
    solved,
    started,
    addCell,
    undo,
    clear,
    useHint,
    canMoveTo,
    moveByKey
  }
}
