import { useState, useCallback } from 'react'
import { isSupabaseConfigured } from '../supabase'

// No login: a player is just a display name plus a random id kept in
// localStorage. The id lets us highlight "your" rows on the leaderboard
// and show your own past scores, without any account or auth.

const NAME_KEY = 'zip-player-name'
const ID_KEY = 'zip-player-id'

function getOrCreateId() {
  try {
    let id = localStorage.getItem(ID_KEY)
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `p_${Date.now()}_${Math.random().toString(36).slice(2)}`)
      localStorage.setItem(ID_KEY, id)
    }
    return id
  } catch {
    return 'anon'
  }
}

export function usePlayer() {
  const [playerId] = useState(getOrCreateId)
  const [name, setNameState] = useState(() => {
    try { return localStorage.getItem(NAME_KEY) || '' } catch { return '' }
  })

  const setName = useCallback((newName) => {
    const clean = (newName || '').trim().slice(0, 20)
    setNameState(clean)
    try { localStorage.setItem(NAME_KEY, clean) } catch { /* private mode */ }
  }, [])

  return {
    playerId,
    name,
    setName,
    isConfigured: isSupabaseConfigured(),
  }
}
