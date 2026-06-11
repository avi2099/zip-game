import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async () => {
    if (!isSupabaseConfigured()) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) return
    await supabase.auth.signOut()
  }

  return {
    session,
    user: session?.user ?? null,
    loading,
    signIn,
    signOut,
    isConfigured: isSupabaseConfigured()
  }
}
