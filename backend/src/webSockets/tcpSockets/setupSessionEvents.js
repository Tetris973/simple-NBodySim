import { RoomManager, DEFAULT_ROOM_ID } from '#src/webSockets/RoomManager.js'

/**
 * Processes session-related events like binding user IDs, joining rooms, etc.
 * This temporary solution that has access to socket of user
 *
 * @param {Object} socket - The socket of the user.
 * @param {Object} socketChannelManager - The manager responsible for handling socket-channel associations.
 */
function setupSessionEvents(socket, socketChannelManager, geckosServer) {
  socket.on('bindChannelId', (channelId) => {
    if (!channelId) {
      socket.emit('bindChannelIdError', 'Channel ID is required')
      return
    }
    // check if channel exist
    const connection = geckosServer.connections.get(channelId)
    if (!connection || !connection.channel) {
      socket.emit('bindChannelIdError', 'Channel does not exist')
      return
    }

    socketChannelManager.associateIds(socket.id, channelId)
    const ids = socketChannelManager.getIds(channelId)
    RoomManager().join(ids, DEFAULT_ROOM_ID)
    socket.emit('channelIdBinded', socket.id, channelId)
  })
}

export { setupSessionEvents }
