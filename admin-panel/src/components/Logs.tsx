import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchLogs } from '../api'

const POLL_INTERVAL_MS = 1000
const BOTTOM_THRESHOLD_PX = 20

const Logs: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([])
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const isAutoScrollRef = useRef(true)

  const scrollToBottom = useCallback(() => {
    const el = viewportRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  const evaluateIsAtBottom = useCallback(() => {
    const el = viewportRef.current
    if (!el) return true
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight)
    return distanceFromBottom <= BOTTOM_THRESHOLD_PX
  }, [])

  const handleScroll = useCallback(() => {
    const atBottom = evaluateIsAtBottom()
    isAutoScrollRef.current = atBottom
    setIsAutoScroll(atBottom)
  }, [evaluateIsAtBottom])

  useEffect(() => {
    let isMounted = true

    const tick = async () => {
      try {
        const data = await fetchLogs()
        if (!isMounted) return
        setLogs(data)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err)
      }
    }

    // initial load quickly
    void tick()

    const id = setInterval(() => {
      void tick()
    }, POLL_INTERVAL_MS)

    return () => {
      isMounted = false
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (isAutoScrollRef.current) {
      scrollToBottom()
    }
  }, [logs, scrollToBottom])

  const handleJumpToLatest = () => {
    isAutoScrollRef.current = true
    setIsAutoScroll(true)
    scrollToBottom()
  }

  return (
    <section className="card logsCard">
      <div className="logsHeader">
        <h2>Logs</h2>
        {!isAutoScroll && (
          <button className="secondary" onClick={handleJumpToLatest}>
            Jump to latest
          </button>
        )}
      </div>
      <div
        className="logsViewport"
        ref={viewportRef}
        onScroll={handleScroll}
        aria-label="Logs viewport"
      >
        <pre className="logsPre">{logs.join('\n')}</pre>
      </div>
    </section>
  )
}

export default Logs
