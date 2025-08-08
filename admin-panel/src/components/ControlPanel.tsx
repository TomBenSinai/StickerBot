import { useState } from 'react'
import { requestQr, restartBot } from '../api'

const ControlPanel: React.FC = () => {
  const [qr, setQr] = useState<string>('')

  const handleRestart = async () => {
    try {
      await restartBot()
    } catch (err) {
      console.error(err)
    }
  }

  const handleQr = async () => {
    try {
      const code = await requestQr()
      setQr(code)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <button onClick={handleRestart}>Restart Bot</button>
      <button onClick={handleQr}>Request QR</button>
      {qr && (
        <div>
          <img src={qr} alt="QR" />
        </div>
      )}
    </div>
  )
}

export default ControlPanel
