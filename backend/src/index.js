import { setupExpressApp } from './expressConfig.js'
import { createServer } from './server.js'
import { GeckosServer } from './webSockets/udpSockets/GeckosServer.js'
import { ChannelRoomManager } from './webSockets/udpSockets/ChannelRoomManager.js'
import { setupRoom } from './simulationConfig.js'

async function startApplication() {
  const app = setupExpressApp()
  const server = createServer(app)
  ChannelRoomManager(GeckosServer(server))

  // Other initializations and server start logic
  const PORT = 3000
  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/index.html`)
  })

  setupRoom()
}

startApplication()
