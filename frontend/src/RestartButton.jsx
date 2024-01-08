import { CommandsManager } from './modules/webSockets/tcpSockets/CommandsManager'

function RestartButton() {
  const manager = CommandsManager()
  manager.onRestartSimulation(() => {
    console.log('Simulation restarted')
  })

  const handleButtonClick = () => {
    manager.restartSimulation()
  }

  // Inline styles
  const buttonStyle = {
    position: 'fixed',
    top: '8vh',
    left: '2vw',
    width: '8vw',
    height: '4vh',
    fontSize: '1.5vh',
    // Add more styles as needed
  }

  return (
    <button onClick={handleButtonClick} style={buttonStyle}>
      Restart
    </button>
  )
}

export { RestartButton }
