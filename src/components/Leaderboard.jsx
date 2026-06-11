import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'
import puzzles from '../data/puzzles'

export default function Leaderboard({ user }) {
  const [selectedPuzzle, setSelectedPuzzle] = useState(puzzles[0].id)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [todayOnly, setTodayOnly] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    fetchScores()
  }, [selectedPuzzle, todayOnly])

  const fetchScores = async () => {
    setLoading(true)
    let query = supabase
      .from('scores')
      .select('*')
      .eq('puzzle_id', selectedPuzzle)
      .order('time_seconds', { ascending: true })
      .limit(10)

    if (todayOnly) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      query = query.gte('solved_at', today.toISOString())
    }

    const { data, error } = await query
    if (!error && data) setScores(data)
    setLoading(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (!isSupabaseConfigured()) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Leaderboard</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Configure Supabase to enable the leaderboard.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          See .env.example for setup instructions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {puzzles.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPuzzle(p.id)}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
              selectedPuzzle === p.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setTodayOnly(!todayOnly)}
          className={`text-sm px-3 py-1 rounded-full transition-colors ${
            todayOnly
              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
        >
          {todayOnly ? "Today's Fastest" : 'All Time'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : scores.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No scores yet. Be the first!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">#</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Player</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Time</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Hints</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, i) => (
                <tr
                  key={score.id}
                  className={`border-b border-gray-100 dark:border-gray-700/50 ${
                    user?.id === score.user_id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20'
                      : ''
                  }`}
                >
                  <td className="py-2 px-2 font-medium">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {score.avatar_url && (
                        <img src={score.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                      )}
                      <span className="text-gray-800 dark:text-gray-200">
                        {score.display_name || 'Anonymous'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-2 font-mono text-indigo-600 dark:text-indigo-400">
                    {formatTime(score.time_seconds)}
                  </td>
                  <td className="py-2 px-2 text-gray-500 dark:text-gray-400">{score.hints_used}</td>
                  <td className="py-2 px-2 text-gray-400 dark:text-gray-500">
                    {new Date(score.solved_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
