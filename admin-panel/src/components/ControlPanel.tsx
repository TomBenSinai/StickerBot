import { useEffect, useState } from 'react'
import { Button, Group, Image, Stack } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'
import { IconPlayerPlay, IconQrcode } from '@tabler/icons-react'
import { connectEvents, type BotStatus } from '../api'
import { requestQr, restartBot, resetAuthAndRestart } from '../api'

const ControlPanel: React.FC = () => {
  const [qr, setQr] = useState<string>('')
  const [modalId, setModalId] = useState<string | null>(null)

  useEffect(() => {
    const es = connectEvents({
      onStatus: (s: BotStatus) => {
        if (s.state === 'ready' && modalId) {
          modals.close(modalId)
          setModalId(null)
        }
      },
      onQr: (dataUrl: string) => {
        setQr(dataUrl)
        if (!modalId) {
          const id = modals.open({
            title: 'Scan to authenticate',
            children: <Image src={dataUrl} alt="QR" w={280} h={280} fit="contain" radius="md" />,
            centered: true,
            size: 'md',
            onClose: () => setModalId(null),
          })
          setModalId(id)
        }
      },
    })
    return () => es.close()
  }, [modalId])

  const handleRestart = async () => {
    try {
      await restartBot()
      notifications.show({ color: 'green', message: 'Bot restarting...' })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      notifications.show({ color: 'red', message: 'Failed to restart bot' })
    }
  }

  const handleQr = async () => {
    try {
      const code = await requestQr()
      setQr(code)
      if (code) {
        const id = modals.open({
          title: 'Scan to authenticate',
          children: <Image src={code} alt="QR" w={280} h={280} fit="contain" radius="md" />,
          centered: true,
          size: 'md',
          onClose: () => setModalId(null),
        })
        setModalId(id)
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  const handleResetAuth = () => {
    modals.openConfirmModal({
      title: 'Reset authentication and restart?',
      children: 'This will delete the .wwebjs_auth folder and restart the bot. You will need to scan a new QR code.',
      labels: { confirm: 'Reset & restart', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: async () => {
        try {
          await resetAuthAndRestart()
          notifications.show({ color: 'green', message: 'Auth reset. Bot restarting...' })
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err)
          notifications.show({ color: 'red', message: 'Failed to reset auth' })
        }
      },
    })
  }

  return (
    <Stack gap="sm">
      <Group wrap="wrap">
        <Button onClick={handleRestart} variant="filled" color="blue" leftSection={<IconPlayerPlay size={16} />}>Restart Bot</Button>
        <Button onClick={handleQr} variant="default" leftSection={<IconQrcode size={16} />}>Request QR</Button>
        <Button onClick={handleResetAuth} variant="outline" color="red">Reset Auth & Restart</Button>
      </Group>
      {qr && (
        <Image src={qr} alt="QR" w={240} h={240} fit="contain" radius="md" mx="auto" />
      )}
    </Stack>
  )
}

export default ControlPanel
