import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function WinModal({
  puzzle, timeSeconds, hintsUsed, formatTime,
  isConfigured, scoreSaved, savedName, onSaveScore,
  nextLabel, onNextPuzzle, onPlayAgain, onClose
}) {
  const [copied, setCopied] = useState(false)
  const [nameInput, setNameInput] = useState(savedName || '')

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [])

  const generateShareGrid = () => {
    const n = puzzle.size
    const lines = []
    for (let r = 0; r < n; r++) {
      let row = ''
      for (let c = 0; c < n; c++) {
        const key = `${r},${c}`
        if (puzzle.waypoints[key]) {
          row += '🔵'
        } else if ((r + c) % 3 === 0) {
          row += '⬜'
        } else {
          row += '🟦'
        }
      }
      lines.push(row)
    }
    return lines.join('\n')
  }

  const shareText = `${generateShareGrid()}\nSolved Zip "${puzzle.name}" in ${formatTime(timeSeconds)} ⚡${hintsUsed > 0 ? ` (${hintsUsed} hints)` : ''}\nPlay free at ${window.location.origin}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    const clean = nameInput.trim()
    if (clean) onSaveScore(clean)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
            Puzzle Solved!
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {puzzle.name} ({puzzle.difficulty})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
              {formatTime(timeSeconds)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Time</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
              {hintsUsed}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Hints Used</div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <pre className="text-center text-sm leading-tight whitespace-pre">
            {generateShareGrid()}
          </pre>
        </div>

        {/* Leaderboard save (no login — just a name) */}
        {isConfigured && (
          scoreSaved ? (
            <p className="text-center text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Saved to leaderboard{savedName ? ` as ${savedName}` : ''}
            </p>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                placeholder="Your name"
                maxLength={20}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                           focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleSave}
                disabled={!nameInput.trim()}
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                           font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          )
        )}

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
          {copied ? 'Copied!' : 'Copy Result'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg
                       text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
                       font-medium transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={onNextPuzzle}
            className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            {nextLabel ? `Next: ${nextLabel}` : 'Next Puzzle'}
          </button>
        </div>

        {!isConfigured && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Leaderboard not configured yet — your time is saved locally.
          </p>
        )}
      </div>
    </div>
  )
}
