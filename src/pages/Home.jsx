import { useState, useEffect, useMemo } from 'react'
import { makeLevelPuzzle, makeDailyPuzzle, getLevelConfig, todayKey, loadProgress, saveProgress } from '../data/levels'
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

const fmtBest = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

export default function Home({ player }) {
  const [progress, setProgress] = useState(loadProgress)
  const [mode, setMode] = useState(null) // null | { type: 'level', level } | { type: 'daily' }
  const [showWin, setShowWin] = useState(false)
  const [scoreSaved, setScoreSaved] = useState(false)

  const puzzle = useMemo(() => {
    if (!mode) return null
    return mode.type === 'daily' ? makeDailyPuzzle() : makeLevelPuzzle(mode.level)
  }, [mode])

  const game = useGame(puzzle)
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
      recordWin()
      // Auto-save if we already know the player's name; otherwise the
      // win modal will prompt for one and call saveScore on submit.
      if (isSupabaseConfigured() && player.name) {
        saveScore(player.name)
      }
    }
  }, [game.solved])

  const recordWin = () => {
    setProgress(prev => {
      const next = { ...prev, best: { ...prev.best } }
      const old = next.best[puzzle.id]
      if (!old || timer.seconds < old) next.best[puzzle.id] = timer.seconds
      if (mode.type === 'level' && mode.level >= next.unlocked) {
        next.unlocked = mode.level + 1
      }
      saveProgress(next)
      return next
    })
  }

  const saveScore = async (name) => {
    if (!isSupabaseConfigured()) return
    player.setName(name)
    try {
      await supabase.from('scores').insert({
        player_id: player.playerId,
        display_name: name,
        puzzle_id: puzzle.id,
        puzzle_name: puzzle.name,
        time_seconds: timer.seconds,
        hints_used: game.hintsUsed
      })
      setScoreSaved(true)
    } catch (e) {
      console.error('Failed to save score:', e)
    }
  }

  const startMode = (m) => {
    setMode(m)
    setShowWin(false)
    setScoreSaved(false)
    timer.reset()
  }

  const handleNextPuzzle = () => {
    if (mode.type === 'daily') {
      startMode({ type: 'level', level: progress.unlocked })
    } else {
      startMode({ type: 'level', level: mode.level + 1 })
    }
  }

  const handlePlayAgain = () => {
    game.clear()
    timer.reset()
    setShowWin(false)
    setScoreSaved(false)
  }

  const handleClear = () => {
    game.clear()
    timer.reset()
  }

  const exitToMenu = () => {
    handleClear()
    setMode(null)
  }

  // ----- Menu view -----
  if (!mode) {
    const daily = makeDailyPuzzle()
    const dailyDone = progress.best[daily.id] != null
    const levelsToShow = Math.max(progress.unlocked + 3, 8)

    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Zip Puzzle</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Draw a path through every cell, hitting numbered waypoints in order.
        </p>

        {/* Daily challenge */}
        <button
          onClick={() => startMode({ type: 'daily' })}
          className="w-full text-left p-5 rounded-2xl mb-8 bg-gradient-to-r from-indigo-600 to-purple-600
                     text-white shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider opacity-80">Daily Challenge</div>
              <div className="text-xl font-bold mt-1">{todayKey()}</div>
              <div className="text-sm opacity-80 mt-1">
                {daily.size}×{daily.size} grid · same puzzle for everyone, worldwide
              </div>
            </div>
            <div className="text-right">
              {dailyDone ? (
                <div>
                  <div className="text-2xl">✅</div>
                  <div className="text-sm font-mono">{fmtBest(progress.best[daily.id])}</div>
                </div>
              ) : (
                <div className="text-3xl">🎯</div>
              )}
            </div>
          </div>
        </button>

        {/* Levels */}
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Levels</h2>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Endless — difficulty keeps rising
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: levelsToShow }, (_, i) => i + 1).map(level => {
            const cfg = getLevelConfig(level)
            const locked = level > progress.unlocked
            const best = progress.best[`level_${level}`]
            return (
              <button
                key={level}
                disabled={locked}
                onClick={() => startMode({ type: 'level', level })}
                className={`text-left p-4 rounded-xl border transition-all ${
                  locked
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-800 dark:text-white">
                    {locked ? '🔒' : best != null ? '✅' : '▶️'} Level {level}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{cfg.size}×{cfg.size}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[cfg.difficulty]}`}>
                    {cfg.difficulty}
                  </span>
                </div>
                {best != null && (
                  <div className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                    Best {fmtBest(best)}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ----- Game view -----
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={exitToMenu}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          ← Menu
        </button>
        <h2 className="font-bold text-lg text-gray-800 dark:text-white">{puzzle.name}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[puzzle.difficulty]}`}>
          {puzzle.difficulty}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <Timer seconds={timer.seconds} formatTime={timer.formatTime} isRunning={timer.isRunning} />
          <span className="text-sm text-gray-400 dark:text-gray-500">
            {game.path.length}/{puzzle.size * puzzle.size} cells
          </span>
        </div>

        <Grid puzzle={puzzle} game={game} />

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

      {showWin && (
        <WinModal
          puzzle={puzzle}
          timeSeconds={timer.seconds}
          hintsUsed={game.hintsUsed}
          formatTime={timer.formatTime}
          isConfigured={isSupabaseConfigured()}
          scoreSaved={scoreSaved}
          savedName={player.name}
          onSaveScore={saveScore}
          nextLabel={mode.type === 'daily' ? `Level ${progress.unlocked}` : `Level ${mode.level + 1}`}
          onNextPuzzle={handleNextPuzzle}
          onPlayAgain={handlePlayAgain}
          onClose={() => setShowWin(false)}
        />
      )}
    </div>
  )
}
