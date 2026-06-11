import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../supabase'

export default function Profile({ user }) {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) {
      setLoading(false)
      return
    }
    fetchUserScores()
  }, [user])

  const fetchUserScores = async () => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('solved_at', { ascending: false })
      .limit(50)

    if (data) setScores(data)
    setLoading(false)
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const bestByPuzzle = {}
  for (const score of scores) {
    if (!bestByPuzzle[score.puzzle_id] || score.time_seconds < bestByPuzzle[score.puzzle_id].time_seconds) {
      bestByPuzzle[score.puzzle_id] = score
    }
  }

  const totalSolved = Object.keys(bestByPuzzle).length
  const totalGames = scores.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-8">
        {user.user_metadata?.avatar_url && (
          <img src={user.user_metadata.avatar_url} alt="" className="w-16 h-16 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {user.user_metadata?.full_name || 'Player'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalSolved}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Puzzles Solved</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalGames}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Games</div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Personal Bests</h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : Object.keys(bestByPuzzle).length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No scores yet. Go solve some puzzles!
        </p>
      ) : (
        <div className="space-y-3">
          {Object.values(bestByPuzzle)
            .sort((a, b) => (a.puzzle_id > b.puzzle_id ? 1 : -1))
            .map(best => (
              <div
                key={best.puzzle_id}
                className="flex items-center justify-between p-3 bg-white dark:bg-gray-800
                           rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <span className="font-medium text-gray-800 dark:text-white">
                  {best.puzzle_name || best.puzzle_id}
                </span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                    {formatTime(best.time_seconds)}
                  </span>
                  {best.hints_used > 0 && (
                    <span className="text-xs text-gray-400">{best.hints_used} hints</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 mt-8">Recent Games</h2>
      {scores.length === 0 ? null : (
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
    </div>
  )
}
