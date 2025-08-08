import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './App.css';

function App() {
  const [logs, setLogs] = useState<string[]>([]);
  const [qr, setQr] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  };

  const restartBot = async () => {
    await fetch('/api/restart', { method: 'POST' });
  };

  const fetchQr = async () => {
    const res = await fetch('/api/qr');
    const data = await res.json();
    setQr(data.qr);
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>StickerBot Admin Panel</h1>
      <section>
        <h2>Logs</h2>
        <pre className="logs">{logs.join('\n')}</pre>
      </section>
      <section>
        <h2>Controls</h2>
        <button onClick={restartBot}>Restart Bot</button>
        <button onClick={fetchQr}>Fetch QR</button>
      </section>
      {qr && (
        <section>
          <h2>QR Code</h2>
          <QRCodeSVG value={qr} />
        </section>
      )}
    </div>
  );
}

export default App;
