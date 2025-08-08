import './App.css'
import ControlPanel from './components/ControlPanel'
import Logs from './components/Logs'

const App: React.FC = () => (
  <div>
    <h1>Sticker Bot Admin</h1>
    <ControlPanel />
    <Logs />
  </div>
)

export default App
