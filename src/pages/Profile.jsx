import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'
import { loadProgress } from '../data/levels'

export default function Profile({ player }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [progress] = useState(loadProgress)
  const [nameDraft, setNameDraft] = useState(player.name)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    fetchMyScores()
  }, [player.playerId])

  const fetchMyScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('player_id', player.playerId)
      .order('solved_at', { ascending: false })
      .limit(50)

    if (data) setScores(data)
    setLoading(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  // Best times come from local progress (works with or without Supabase)
  const localBests = Object.entries(progress.best)
    .map(([id, time]) => ({ id, time }))
    .sort((a, b) => (a.id > b.id ? 1 : -1))

  const totalSolved = localBests.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Stats</h1>

      {/* Name editor */}
      <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
          Display name (shown on the leaderboard)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            placeholder="Enter a name"
            maxLength={20}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
                       bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                       focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={() => player.setName(nameDraft)}
            disabled={nameDraft.trim() === player.name}
            className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg
                       font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalSolved}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Puzzles Solved</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {Math.max(progress.unlocked - 1, 0)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Levels Cleared</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Best Times</h2>
      {localBests.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No times yet. Go solve some puzzles!
        </p>
      ) : (
        <div className="space-y-3">
          {localBests.map(({ id, time }) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800
                         rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <span className="font-medium text-gray-800 dark:text-white">
                {id.startsWith('daily_') ? `Daily ${id.replace('daily_', '')}` :
                 id.startsWith('level_') ? `Level ${id.replace('level_', '')}` : id}
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {formatTime(time)}
              </span>
            </div>
          ))}
        </div>
      )}

      {isSupabaseConfigured() && (
        <>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 mt-8">
            Your Leaderboard Entries
          </h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : scores.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No scores posted yet.
            </p>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 10).map(score => (
                <div
                  key={score.id}
                  className="flex items-center justify-between p-2 text-sm
                             border-b border-gray-100 dark:border-gray-700/50"
                >
                  <span className="text-gray-700 dark:text-gray-200">{score.puzzle_name || score.puzzle_id}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {formatTime(score.time_seconds)}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(score.solved_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
