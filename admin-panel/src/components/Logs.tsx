import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollArea } from '@mantine/core'
import { fetchLogs } from '../api'

const POLL_INTERVAL_MS = 1000
const BOTTOM_THRESHOLD_PX = 20

export interface LogsApi {
  jumpToLatest: () => void
}

interface LogsProps {
  readonly autoScroll?: boolean
  readonly filterText?: string
  readonly onBindApi?: (api: LogsApi) => void
}

const Logs: React.FC<LogsProps> = ({ autoScroll = true, filterText = '', onBindApi }) => {
  const [logs, setLogs] = useState<string[]>([])
  const [isAutoScrollInternal, setIsAutoScrollInternal] = useState(true)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const isAutoScrollRef = useRef(true)

  const effectiveAutoScroll = autoScroll && isAutoScrollInternal

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

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onScroll = () => {
      const atBottom = evaluateIsAtBottom()
      isAutoScrollRef.current = atBottom
      setIsAutoScrollInternal(atBottom)
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
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
    if (effectiveAutoScroll) {
      scrollToBottom()
    }
  }, [logs, effectiveAutoScroll, scrollToBottom])

  const handleJumpToLatest = useCallback(() => {
    isAutoScrollRef.current = true
    setIsAutoScrollInternal(true)
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    if (!onBindApi) return
    const api: LogsApi = { jumpToLatest: handleJumpToLatest }
    onBindApi(api)
  }, [onBindApi, handleJumpToLatest])

  const filteredText = useMemo(() => {
    if (!filterText.trim()) return logs
    try {
      const re = new RegExp(filterText, 'i')
      return logs.filter((line) => re.test(line))
    } catch (_err) {
      return logs.filter((line) => line.toLowerCase().includes(filterText.toLowerCase()))
    }
  }, [logs, filterText])

  return (
    <ScrollArea h={300} viewportRef={viewportRef} style={{ background: '#0b0f17' }}>
      <pre
        style={{
          margin: 0,
          padding: '12px 16px',
          color: '#a3e635',
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 12.5,
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
        }}
      >
        {filteredText.join('\n')}
      </pre>
    </ScrollArea>
  )
}

export default Logs
