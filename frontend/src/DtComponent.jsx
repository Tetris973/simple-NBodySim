import { useState, useEffect } from 'react'
import { CommandsManager } from './modules/webSockets/tcpSockets/CommandsManager'

function DtComponent() {
  const [dt, setDt] = useState(0) // Initial value of dt
  const [newDt, setNewDt] = useState(0) // Value from input field

  useEffect(() => {
    const tryEngineInfos = setInterval(() => {
      CommandsManager().getEngineInfos()
    }, 1000)
    CommandsManager().onGetEnginInfos((infos) => {
      clearInterval(tryEngineInfos)
      if (infos.dt === null) {
        setDt(0)
      } else setDt(infos.dt)
    })
  }, [])

  CommandsManager().onSetDt((dt) => {
    if (dt === null) {
      setDt(0)
    } else setDt(dt)
  })

  const handleInputChange = (event) => {
    // convert to number
    setNewDt(event.target.value)
  }

  const handleButtonClick = () => {
    if (newDt <= 0) {
      CommandsManager().setDt(null)
      return
    } else {
      CommandsManager().setDt(newDt)
    }
  }

  const buttonStyle = {
    position: 'fixed',
    top: '14vh',
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
      <h2>DT: {dt}</h2>
      <input style={inputStyle} type="number" value={newDt} onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Set dt</button>
    </div>
  )
}

export { DtComponent }
