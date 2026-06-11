import { useState, useRef, useCallback } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef(null)

  const start = useCallback(() => {
    if (intervalRef.current) return
    setIsRunning(true)
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1)
    }, 1000)
  }, [])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    stop()
    setSeconds(0)
  }, [stop])

  const formatTime = useCallback((s) => {
    const mins = Math.floor(s / 60)
    const secs = s % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  return { seconds, isRunning, start, stop, reset, formatTime }
}
