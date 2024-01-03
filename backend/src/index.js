import { setupExpressApp } from './expressConfig.js'
import { createServer } from './server.js'
import { webSocketsStart } from './webSockets/webSocketsIndex.js'

async function startApplication() {
  const app = setupExpressApp()
  const httpServer = createServer(app)

  // Other initializations and server start logic
  const PORT = 3000
  httpServer.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}/index.html`)
  })

  webSocketsStart(httpServer)
}

startApplication()
