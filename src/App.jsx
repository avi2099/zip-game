import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Home from './pages/Home'
import LeaderboardPage from './pages/LeaderboardPage'
import Profile from './pages/Profile'

export default function App() {
  const { user, signIn, signOut, isConfigured } = useAuth()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Header user={user} onSignIn={signIn} onSignOut={signOut} isConfigured={isConfigured} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/leaderboard" element={<LeaderboardPage user={user} />} />
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
