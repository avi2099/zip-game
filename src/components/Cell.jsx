import { useMemo } from 'react'

export default function Cell({
  row, col, size, puzzle, pathIndex, isOnPath, isStart, isEnd,
  waypoint, canMove, onClick, onMouseEnter, isDragging
}) {
  const wallClasses = useMemo(() => {
    if (!puzzle) return ''
    const classes = []
    for (const wall of puzzle.walls) {
      const [r1, c1] = wall.from
      const [r2, c2] = wall.to
      if (r1 === row && c1 === col) {
        if (r2 === row - 1) classes.push('cell-wall-top')
        if (r2 === row + 1) classes.push('cell-wall-bottom')
        if (c2 === col - 1) classes.push('cell-wall-left')
        if (c2 === col + 1) classes.push('cell-wall-right')
      }
      if (r2 === row && c2 === col) {
        if (r1 === row - 1) classes.push('cell-wall-top')
        if (r1 === row + 1) classes.push('cell-wall-bottom')
        if (c1 === col - 1) classes.push('cell-wall-left')
        if (c1 === col + 1) classes.push('cell-wall-right')
      }
    }
    return classes.join(' ')
  }, [puzzle, row, col])

  const cellSize = size <= 5 ? 'w-14 h-14 sm:w-16 sm:h-16' :
                   size <= 6 ? 'w-12 h-12 sm:w-14 sm:h-14' :
                               'w-10 h-10 sm:w-12 sm:h-12'

  let bg = 'bg-white dark:bg-gray-800'
  if (isOnPath) {
    bg = 'path-gradient'
  } else if (canMove && !isOnPath) {
    bg = 'bg-indigo-50 dark:bg-indigo-900/30'
  }

  return (
    <div
      data-row={row}
      data-col={col}
      className={`
        ${cellSize} border border-gray-300 dark:border-gray-600
        flex items-center justify-center relative cursor-pointer
        select-none transition-colors duration-100
        ${bg} ${wallClasses}
        ${isEnd ? 'ring-2 ring-purple-400' : ''}
        hover:brightness-95
      `}
      onClick={() => onClick(row, col)}
      onMouseEnter={() => isDragging && onMouseEnter(row, col)}
    >
      {waypoint && (
        <div className={`
          w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
          font-bold text-sm sm:text-base z-10
          ${isOnPath
            ? 'bg-white/30 text-white'
            : 'bg-blue-500 text-white shadow-md'
          }
        `}>
          {waypoint}
        </div>
      )}
      {isOnPath && !waypoint && (
        <div className="w-3 h-3 rounded-full bg-white/50" />
      )}
      {isOnPath && pathIndex !== null && (
        <span className="absolute bottom-0.5 right-1 text-[9px] text-white/60 font-mono">
          {pathIndex + 1}
        </span>
      )}
    </div>
  )
}
