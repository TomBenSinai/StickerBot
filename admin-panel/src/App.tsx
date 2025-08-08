import { useState } from 'react'
import { AppShell, ActionIcon, Button, Card, Container, Grid, Group, SegmentedControl, Stack, Text, TextInput, Title, Tooltip } from '@mantine/core'
import { useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import ControlPanel from './components/ControlPanel'
import Logs, { type LogsApi } from './components/Logs'

const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme()
  const colorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true })
  return (
    <Tooltip label={colorScheme === 'light' ? 'Switch to dark' : 'Switch to light'}>
      <ActionIcon
        variant="subtle"
        aria-label="Toggle color scheme"
        onClick={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')}
      >
        {colorScheme === 'light' ? <IconMoon size={18} /> : <IconSun size={18} />}
      </ActionIcon>
    </Tooltip>
  )
}

const App: React.FC = () => {
  const [filter, setFilter] = useState<string>('')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [logsApi, setLogsApi] = useState<LogsApi | null>(null)

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group justify="space-between" px="md" h="100%">
          <Group gap="xs">
            <Title order={3}>Sticker Bot Admin</Title>
            <Text c="dimmed">Monitor and control the bot</Text>
          </Group>
          <ColorSchemeToggle />
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
