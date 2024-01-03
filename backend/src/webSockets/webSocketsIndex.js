import { SocketServer } from './tcpSockets/SocketServer.js'
import { GeckosServer } from './udpSockets/GeckosServer.js'
import { SocketConnectionManager } from './tcpSockets/SocketConnectionManager.js'
import { ChannelConnectionManager } from './udpSockets/ChannelConnectionManager.js'
import { SocketChannelManager } from './SocketChannelManager.js'
import { RoomManager } from './RoomManager.js'
import { setupRoom } from '#src/simulationConfig.js'
import { CommandProcessor, COMMAND_SETS } from './tcpSockets/CommandProcessor.js'
import { ResponseProcessor } from './tcpSockets/ReponseProcessor.js'

const webSocketsStart = (httpServer) => {
  const socketServer = SocketServer(httpServer)
  const geckosServer = GeckosServer(httpServer)

  const socketConnectionManager = SocketConnectionManager(socketServer)
  const channelConnectionManager = ChannelConnectionManager(geckosServer)

  const roomManager = RoomManager(geckosServer, socketServer)
  const socketChannelManager = SocketChannelManager()
  const processCommand = CommandProcessor(roomManager, COMMAND_SETS)
  const processResponse = ResponseProcessor()
  // Register connection callback
  socketConnectionManager.onConnect((socketId) => {
    const socket = socketServer.sockets.sockets.get(socketId)

    socket.on('command', (message) => {
      const userIds = socketChannelManager.getIds(socketId)
      const { category, command, data } = message

      processCommand(category, command, userIds, data).then((result) => {
        console.log('command result', result)
        const { eventName, message, to } = processResponse(result)
        console.log(
          '[command result]',
          `\neventName: ${eventName}`,
          `\nmessage: ${message}`,
          `\nto: ${to}`
        )
        socket.emit(eventName, message)
      })
    })
  })

  setupRoom(roomManager, channelConnectionManager, socketConnectionManager, socketChannelManager)
}

export { webSocketsStart }
