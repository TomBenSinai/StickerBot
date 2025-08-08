import './App.css'
import ControlPanel from './components/ControlPanel'
import Logs from './components/Logs'

const App: React.FC = () => (
  <div className="container">
    <header className="header">
      <h1>Sticker Bot Admin</h1>
    </header>
    <main className="main">
      <section className="card">
        <h2>Controls</h2>
        <ControlPanel />
      </section>
      <Logs />
    </main>
  </div>
)

export default App
