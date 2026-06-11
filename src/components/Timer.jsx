export default function Timer({ seconds, formatTime, isRunning }) {
  return (
    <div className={`
      font-mono text-2xl font-bold tabular-nums
      ${isRunning ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}
    `}>
      {formatTime(seconds)}
    </div>
  )
}
