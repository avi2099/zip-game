import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { usePlayer } from './hooks/usePlayer'
import Header from './components/Header'
import Home from './pages/Home'
import LeaderboardPage from './pages/LeaderboardPage'
import Profile from './pages/Profile'

export default function App() {
  const player = usePlayer()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header player={player} />
        <Routes>
          <Route path="/" element={<Home player={player} />} />
          <Route path="/leaderboard" element={<LeaderboardPage player={player} />} />
          <Route path="/profile" element={<Profile player={player} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
