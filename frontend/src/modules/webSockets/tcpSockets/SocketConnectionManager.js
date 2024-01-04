let singletonInstance = null

const SocketConnectionManager = (socketClient) => {
  if (!singletonInstance) {
    if (!socketClient) throw new Error('Socket.io client is needed')
    singletonInstance = _SocketConnectionManager(socketClient)
  }
  return singletonInstance
}

const _SocketConnectionManager = (socketClient) => {
  socketClient.on('connect', () => {
    console.log('Socket connected to the server!')
  })
  socketClient.on('disconnect', () => {
    console.log('Socket disconnected from the server!')
  })
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/
  let _socket = socketClient

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const manager = {}

  manager.connect = () => {
    _socket.connect()
  }

  manager.disconnect = () => {
    _socket.disconnect()
  }

  manager.bindChannelId = (channelId) => {
    _socket.emit('bindChannelId', channelId)
  }
  _socket.on('channelIdBinded', (socketId, channelId) => {
    console.log('Socket ID binded: ', socketId, channelId)
  })
  _socket.on('bindChannelIdError', (error) => {
    console.error(error)
  })
  return manager
}

export { SocketConnectionManager }
