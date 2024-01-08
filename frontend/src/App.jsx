import { useEffect } from 'react'
import './App.css'
import start from './modules/sketch/sketch'
import { StartStopButton } from './StartStopButton'
import { RestartButton } from './RestartButton'
import { DtComponent } from './DtComponent'
import { TimeScaleComponent } from './TimeScaleComponent'

import { GeckosClient } from './modules/webSockets/udpSockets/GeckosClient'
import { ChannelConnectionManager } from './modules/webSockets/udpSockets/ChannelConnectionManager'
import { SocketClient } from './modules/webSockets/tcpSockets/SocketClient'
import { SocketConnectionManager } from './modules/webSockets/tcpSockets/SocketConnectionManager'
import { CommandsManager } from './modules/webSockets/tcpSockets/CommandsManager'

function App() {
  const geckosClient = GeckosClient()
  ChannelConnectionManager(geckosClient)

  const socketClient = SocketClient()
  CommandsManager(socketClient)
  SocketConnectionManager(socketClient)

  useEffect(() => {
    start()
  }, [])
  return (
    <>
      <StartStopButton />
      <RestartButton />
      <DtComponent />
      <TimeScaleComponent />
      <div id="simulationContent"></div>
    </>
  )
}

export default App
