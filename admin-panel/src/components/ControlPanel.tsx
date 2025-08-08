import { useState } from 'react'
import { Button, Group, Image, Stack } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconPlayerPlay, IconQrcode } from '@tabler/icons-react'
import { requestQr, restartBot } from '../api'

const ControlPanel: React.FC = () => {
  const [qr, setQr] = useState<string>('')

  const handleRestart = async () => {
    try {
      await restartBot()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  const handleQr = async () => {
    try {
      const code = await requestQr()
      setQr(code)
      if (code) {
        modals.open({
          title: 'Scan to authenticate',
          children: <Image src={code} alt="QR" w={280} h={280} fit="contain" radius="md" />,
          centered: true,
          size: 'md',
        })
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  return (
    <Stack gap="sm">
      <Group wrap="wrap">
        <Button onClick={handleRestart} variant="filled" color="blue" leftSection={<IconPlayerPlay size={16} />}>Restart Bot</Button>
        <Button onClick={handleQr} variant="default" leftSection={<IconQrcode size={16} />}>Request QR</Button>
      </Group>
      {qr && (
        <Image src={qr} alt="QR" w={240} h={240} fit="contain" radius="md" mx="auto" />
      )}
    </Stack>
  )
}

export default ControlPanel
