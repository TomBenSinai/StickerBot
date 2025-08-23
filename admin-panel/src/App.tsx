import { useEffect, useState } from 'react'
import { AppShell, Button, Card, Container, Grid, Group, SegmentedControl, Stack, Text, TextInput, Title, useMantineTheme, rgba } from '@mantine/core'
import { useComputedColorScheme } from '@mantine/core'
import ControlPanel from './components/ControlPanel'
import Logs, { type LogsApi } from './components/Logs'
import { connectEvents, type BotStatus } from './api'
import ColorSchemeToggle from './components/ColorSchemeToggle'
import { statusColor } from './utils/status'

const App: React.FC = () => {
  const [filter, setFilter] = useState<string>('')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [logsApi, setLogsApi] = useState<LogsApi | null>(null)
  const [status, setStatus] = useState<BotStatus | null>(null)
  const [stickerCount, setStickerCount] = useState<number>(0)
  const theme = useMantineTheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })

  useEffect(() => {
    const es = connectEvents({
      onStatus: (s) => setStatus(s),
      onStickerCount: (c) => setStickerCount(c),
    })
    return () => es.close()
  }, [])

  const paletteKey = statusColor(status?.state ?? 'unknown') as keyof typeof theme.colors
  const basePalette = theme.colors[paletteKey] || theme.colors.gray
  const baseShade = basePalette[6]
  const isDark = colorScheme === 'dark'

  const bgColor = rgba(baseShade, isDark ? 0.14 : 0.08)
  const borderColor = rgba(baseShade, isDark ? 0.28 : 0.18)
  const titleColor = isDark ? basePalette[3] : basePalette[7]

  const statusLabel = (status?.state ?? 'unknown').replaceAll('-', ' ').toUpperCase()
  const sinceText = status?.since ? new Date(status.since).toLocaleString() : ''

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="space-between" px="md" h="100%">
          <Group gap="xs">
            <Title order={3}>Sticker Bot Admin</Title>
            <Text c="dimmed">Monitor and control the bot</Text>
          </Group>
          <Group gap="sm">
            <ColorSchemeToggle />
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg">
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" padding="md">
                <Group justify="space-between" mb="sm">
                  <Title order={4}>Controls</Title>
                </Group>
                <Stack>
                  <ControlPanel />
                </Stack>
              </Card>
              <Card radius="md" padding="lg" mt="md" withBorder style={{ background: bgColor, borderColor }}>
                <Stack gap={2}>
                  <Title order={2} c={titleColor}>{statusLabel}</Title>
                  {sinceText && (
                    <Text size="sm" c="dimmed">since {sinceText}</Text>
                  )}
                  <Text size="sm" c="dimmed">Stickers made: {stickerCount}</Text>
                </Stack>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder radius="md" padding="md">
                <Group justify="space-between" mb="sm">
                  <Title order={4}>Logs</Title>
                  <Group>
                    <Button variant="light" onClick={() => logsApi?.jumpToLatest()}>Jump to latest</Button>
                  </Group>
                </Group>
                <Stack gap="sm">
                  <Group justify="space-between" wrap="wrap">
                    <TextInput
                      value={filter}
                      onChange={(e) => setFilter(e.currentTarget.value)}
                      placeholder="Filter logs (regex supported)"
                      aria-label="Filter logs"
                      w={{ base: '100%', sm: '60%' }}
                    />
                    <SegmentedControl
                      value={autoScroll ? 'on' : 'off'}
                      onChange={(val) => setAutoScroll(val === 'on')}
                      data={[
                        { label: 'Auto-scroll', value: 'on' },
                        { label: 'Paused', value: 'off' },
                      ]}
                    />
                  </Group>
                  <Logs autoScroll={autoScroll} filterText={filter} onBindApi={setLogsApi} />
                  <Text size="xs" c="dimmed">Showing last 100 entries</Text>
                </Stack>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}

export default App
