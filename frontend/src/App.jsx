import { useEffect } from 'react'
import './App.css'
import start from './modules/sketch/sketch'

function App() {
  useEffect(() => {
    start()
  }, [])
  return (
    <>
      <div id="simulationContent"></div>
    </>
  )
}

export default App
