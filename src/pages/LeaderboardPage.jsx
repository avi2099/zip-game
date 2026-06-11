import Leaderboard from '../components/Leaderboard'

export default function LeaderboardPage({ user }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Leaderboard
      </h1>
      <Leaderboard user={user} />
    </div>
  )
}
