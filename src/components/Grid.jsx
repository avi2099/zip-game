import { useState, useEffect, useCallback } from 'react'
import Cell from './Cell'

export default function Grid({ puzzle, game }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleClick = useCallback((row, col) => {
    game.addCell(row, col)
  }, [game])

  const handleMouseEnter = useCallback((row, col) => {
    if (isDragging) {
      game.addCell(row, col)
    }
  }, [isDragging, game])

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0]
    if (!touch) return
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    const cell = el?.closest('[data-row]')
    if (cell) {
      game.addCell(Number(cell.dataset.row), Number(cell.dataset.col))
    }
  }, [game])

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('touchend', handleMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      const keyMap = {
        ArrowUp: 'up', ArrowDown: 'down',
        ArrowLeft: 'left', ArrowRight: 'right'
      }
      if (keyMap[e.key]) {
        e.preventDefault()
        game.moveByKey(keyMap[e.key])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [game])

  if (!puzzle) return null

  const rows = []
  for (let r = 0; r < puzzle.size; r++) {
    const cells = []
    for (let c = 0; c < puzzle.size; c++) {
      const key = `${r},${c}`
      const pathIndex = game.path.findIndex(([pr, pc]) => pr === r && pc === c)
      const isOnPath = pathIndex !== -1
      const isStart = pathIndex === 0
      const isEnd = pathIndex === game.path.length - 1 && game.path.length > 0
      const waypoint = puzzle.waypoints[key] || null

      cells.push(
        <Cell
          key={key}
          row={r}
          col={c}
          size={puzzle.size}
          puzzle={puzzle}
          pathIndex={isOnPath ? pathIndex : null}
          isOnPath={isOnPath}
          isStart={isStart}
          isEnd={isEnd}
          waypoint={waypoint}
          canMove={game.canMoveTo(r, c)}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          isDragging={isDragging}
        />
      )
    }
    rows.push(
      <div key={r} className="flex">
        {cells}
      </div>
    )
  }

  return (
    <div
      className="inline-block border-2 border-gray-400 dark:border-gray-500 rounded-lg overflow-hidden shadow-lg"
      style={{ touchAction: 'none' }}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onTouchMove={handleTouchMove}
    >
      {rows}
    </div>
  )
}
