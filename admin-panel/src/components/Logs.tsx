import { useEffect, useState } from 'react'
import { fetchLogs } from '../api'

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchLogs()
        setLogs(data)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  return (
    <pre>
      {logs.join('\n')}
    </pre>
  )
}

export default Logs
