import { useState, useEffect, useCallback } from 'react'
import puzzles from '../data/puzzles'
import Grid from '../components/Grid'
import Timer from '../components/Timer'
import WinModal from '../components/WinModal'
import { useGame } from '../hooks/useGame'
import { useTimer } from '../hooks/useTimer'
import { supabase, isSupabaseConfigured } from '../supabase'

const difficultyColors = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  hard: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  expert: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function Home({ user }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(puzzles[0])
  const [showWin, setShowWin] = useState(false)
  const [showSelector, setShowSelector] = useState(true)

  const game = useGame(selectedPuzzle)
  const timer = useTimer()

  useEffect(() => {
    if (game.started && !timer.isRunning && !game.solved) {
      timer.start()
    }
  }, [game.started, timer.isRunning, game.solved])

  useEffect(() => {
    if (game.solved) {
      timer.stop()
      setShowWin(true)
      saveScore()
    }
  }, [game.solved])

  const saveScore = async () => {
    if (!user || !isSupabaseConfigured()) return
    try {
      await supabase.from('scores').insert({
        user_id: user.id,
        display_name: user.user_metadata?.full_name,
        avatar_url: user.user_metadata?.avatar_url,
        puzzle_id: selectedPuzzle.id,
        puzzle_name: selectedPuzzle.name,
        time_seconds: timer.seconds,
        hints_used: game.hintsUsed
      })
    } catch (e) {
      console.error('Failed to save score:', e)
    }
  }

  const handleSelectPuzzle = (puzzle) => {
    setSelectedPuzzle(puzzle)
    setShowSelector(false)
    timer.reset()
  }

  const handleNextPuzzle = () => {
    const idx = puzzles.findIndex(p => p.id === selectedPuzzle.id)
    const next = puzzles[(idx + 1) % puzzles.length]
    handleSelectPuzzle(next)
    setShowWin(false)
  }

  const handlePlayAgain = () => {
    game.clear()
    timer.reset()
    setShowWin(false)
  }

  const handleClear = () => {
    game.clear()
    timer.reset()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {showSelector ? (
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Zip Puzzle
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Draw a path through every cell, hitting numbered waypoints in order.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {puzzles.map(puzzle => (
              <button
                key={puzzle.id}
                onClick={() => handleSelectPuzzle(puzzle)}
                className="text-left p-4 rounded-xl border border-gray-200 dark:border-gray-700
                           bg-white dark:bg-gray-800 hover:shadow-lg hover:border-indigo-300
                           dark:hover:border-indigo-600 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {puzzle.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[puzzle.difficulty]}`}>
                    {puzzle.difficulty}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {puzzle.size}×{puzzle.size} grid · {Object.keys(puzzle.waypoints).length} waypoints
                  {puzzle.walls.length > 0 && ` · ${puzzle.walls.length} walls`}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => { setShowSelector(true); handleClear() }}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ← Puzzles
            </button>
            <h2 className="font-bold text-lg text-gray-800 dark:text-white">
              {selectedPuzzle.name}
            </h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[selectedPuzzle.difficulty]}`}>
              {selectedPuzzle.difficulty}
            </span>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <Timer seconds={timer.seconds} formatTime={timer.formatTime} isRunning={timer.isRunning} />
              <span className="text-sm text-gray-400 dark:text-gray-500">
                {game.path.length}/{selectedPuzzle.size * selectedPuzzle.size} cells
              </span>
            </div>

            <Grid puzzle={selectedPuzzle} game={game} />

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={game.undo}
                disabled={game.path.length === 0 || game.solved}
                className="px-4 py-2 text-sm rounded-lg font-medium border border-gray-300 dark:border-gray-600
                           text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Undo
              </button>
              <button
                onClick={handleClear}
                disabled={game.path.length === 0 || game.solved}
                className="px-4 py-2 text-sm rounded-lg font-medium border border-gray-300 dark:border-gray-600
                           text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Clear
              </button>
              <button
                onClick={game.useHint}
                disabled={game.hintsUsed >= game.maxHints || game.solved}
                className="px-4 py-2 text-sm rounded-lg font-medium bg-amber-100 dark:bg-amber-900/30
                           text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50
                           disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Hint ({game.maxHints - game.hintsUsed} left)
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Click cell 1 to start · Drag or use arrow keys · Hit waypoints in order
            </p>
          </div>
        </div>
      )}

      {showWin && (
        <WinModal
          puzzle={selectedPuzzle}
          timeSeconds={timer.seconds}
          hintsUsed={game.hintsUsed}
          formatTime={timer.formatTime}
          user={user}
          onNextPuzzle={handleNextPuzzle}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowWin(false)}
        />
      )}
    </div>
  )
}
