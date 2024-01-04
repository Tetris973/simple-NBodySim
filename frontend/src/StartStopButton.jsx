import { useState } from 'react'
import { CommandsManager } from './modules/webSockets/tcpSockets/CommandsManager'

function StartStopButton() {
  const [isPlaying, setIsPlaying] = useState(true)
  const manager = CommandsManager()
  manager.onStartStopSimulation((isPlaying) => {
    setIsPlaying(isPlaying)
  })

  const handleButtonClick = () => {
    if (isPlaying) {
      manager.stopSimulation()
    } else {
      manager.startSimulation()
    }
  }

  // Inline styles
  const buttonStyle = {
    position: 'fixed',
    top: '2vh',
    left: '2vw',
    width: '8vw',
    height: '4vh',
    fontSize: '1.5vh',
    // Add more styles as needed
  }

  return (
    <button onClick={handleButtonClick} style={buttonStyle}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  )
}

export { StartStopButton }
