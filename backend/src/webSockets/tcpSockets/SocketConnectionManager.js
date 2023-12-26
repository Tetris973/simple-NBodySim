/**
 * Singleton instance of the SocketConnectionManager.
 */
let singletonInstance = null

/**
 * Returns a singleton instance of the SocketConnectionManager.
 * @param {*} socketServer - The instance of the socket.io server.
 * @returns {SocketConnectionManager} An object containing functions to manage sockets and rooms.
 */
function SocketConnectionManager(socketServer) {
  if (!singletonInstance) {
    if (!socketServer) throw new Error('Socket.io server is needed')
    singletonInstance = _SocketConnectionManager(socketServer)
  }
  return singletonInstance
}

/**
 * Manages the sockets and rooms of a socket.io server.
 *
 * @private
 * @param {Object} socketServer - The instance of the socket.io server.
 * @class
 * @returns {SocketConnectionManager} An object containing functions to manage sockets and rooms.
 */
function _SocketConnectionManager(socketServer) {
  socketServer.on('connection', (socket) => {
    _handleConnection(socket)

    socket.on('disconnect', (reason) => {
      _handleDisconnection(socket, reason)
    })
  })

  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/

  /**
   * Set of all sockets connected to the server.
   * @type {Set<string>}
   */
  const _sockets = new Set()

  /**
   * Array of functions to be called when a new socket connects.
   * @type {Function[]}
   */
  const _connectListeners = []

  /**
   * Array of functions to be called when a socket disconnects.
   * @type {Function[]}
   */
  const _disconnectListeners = []

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /**
   * Handles a new socket connection.
   * @param {*} socket - The socket that connected.
   */
  const _handleConnection = (socket) => {
    console.log(`Socket ${socket.id} connected`)
    _sockets.add(socket.id)
    _connectListeners.forEach((listener) => listener(socket.id))
  }

  /**
   * Handles a socket disconnection.
   * @param {*} socket - The socket that disconnected.
   * @param {*} reason - The reason for the disconnection.
   */
  const _handleDisconnection = (socket, reason) => {
    console.log(`Socket ${socket.id} disconnected for reason: ${reason}`)
    manager.deleteSocket(socket.id)
    _disconnectListeners.forEach((listener) => listener(socket.id, reason))
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const manager = {}

  /**
   * Deletes a socket from the server.
   * @memberof SocketConnectionManager
   * @param {string} socketId - The unique ID of the socket to be deleted.
   * @returns {boolean} True if the socket was deleted, false otherwise.
   */
  manager.deleteSocket = (socketId) => {
    const deleted = _sockets.delete(socketId)
    const socket = socketServer.sockets.sockets.get(socketId)
    if (!socket && !deleted) return false

    socket?.disconnect(true)
    return true
  }

  /**
   * Add the listener as a callback with the socketId to be called when a new socket connects.
   * @param {*} listener - The callback to be called when a new socket connects.
   */
  manager.onConnect = (listener) => {
    _connectListeners.push(listener)
  }

  /**
   * Add the listener as a callback with the socketId to be called when a socket disconnects.
   * @param {*} listener - The callback to be called when a socket disconnects.
   */
  manager.onDisconnect = (listener) => {
    _disconnectListeners.push(listener)
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Retrieves the total number of sockets managed.
   * @name SocketConnectionManager#nbSockets
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'nbSockets', {
    get: () => _sockets.size,
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current socket id's.
   * @name SocketConnectionManager#sockets
   * @type {Set<string>}
   * @readonly
   */
  Object.defineProperty(manager, 'sockets', {
    get: () => new Set(_sockets),
    enumerable: true,
  })

  return manager
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

export { SocketConnectionManager, _SocketConnectionManager }
