import { createServer } from 'http'
import ioc from 'socket.io-client'
import { Server } from 'socket.io'

class SocketTestHelper {
  constructor() {
    this.httpServer = createServer()
    this.socketServer = new Server(this.httpServer)
    this.clientSockets = [] // Array to store client sockets
  }

  /**
   * Starts the HTTP and Socket servers.
   */
  startServers() {
    return new Promise((resolve) => {
      this.httpServer.listen(() => {
        resolve(this.httpServer.address().port)
      })
    })
  }

  /**
   * Connects a new client to the socket server.
   * @returns {Promise} A promise that resolves with the connected client socket.
   */
  connectNewClient() {
    return new Promise((resolve) => {
      const port = this.httpServer.address().port
      const socket = ioc(`http://localhost:${port}`)
      this.clientSockets.push(socket) // Store for cleanup

      socket.on('connect', () => {
        resolve(socket) // Resolve when connected
      })
    })
  }

  /**
   * Close connection of all client sockets.
   */
  closeAllClients() {
    this.clientSockets.forEach((socket) => socket.disconnect())
    this.clientSockets = [] // Reset the array
  }

  /**
   * Closes the HTTP and Socket servers.
   */
  closeServers() {
    this.socketServer.close()
    this.httpServer.close()
  }
}

export { SocketTestHelper }
