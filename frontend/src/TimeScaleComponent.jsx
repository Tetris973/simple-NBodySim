import { useState, useEffect } from 'react'
import { CommandsManager } from './modules/webSockets/tcpSockets/CommandsManager'

function TimeScaleComponent() {
  const [timeScale, setTimeScale] = useState(0) // Initial value of dt
  const [newTimeScale, setNewTimeScale] = useState(0) // Value from input field

  useEffect(() => {
    const tryEngineInfos = setInterval(() => {
      CommandsManager().getEngineInfos()
    }, 1000)
    CommandsManager().onGetEnginInfos((infos) => {
      clearInterval(tryEngineInfos)
      setTimeScale(infos.timeScaleFactor)
    })
  }, [])

  CommandsManager().onSetTimeScale((dt) => {
    setTimeScale(dt)
  })

  const handleInputChange = (event) => {
    setNewTimeScale(event.target.value)
  }

  const handleButtonClick = () => {
    CommandsManager().setTimeScale(newTimeScale)
  }

  const buttonStyle = {
    position: 'fixed',
    top: '28vh',
    left: '2vw',
    width: '8vw',
    height: '4vh',
    fontSize: '1.5vh',
    // Add more styles as needed
  }

  const inputStyle = {
    width: '4vw', // Increase width
    height: '1.5vh', // Increase height
    fontSize: '1.5vh', // Increase font size
    // Add more styles as needed
  }

  return (
    <div style={buttonStyle}>
      <h2>TimeScale: {timeScale}</h2>
      <input style={inputStyle} type="number" value={newTimeScale} onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Set timeScale</button>
    </div>
  )
}

export { TimeScaleComponent }
