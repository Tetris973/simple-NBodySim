/**
 * Singleton instance of the _ChannelConnectionManager.
 */
let singletonInstance = null

/**
 * Returns a singleton instance of the _ChannelConnectionManager.
 * @param {*} geckosServer - The instance of the geckos.io server.
 * @returns {ChannelConnectionManager} An object containing functions to manage channels and rooms.
 */
function ChannelConnectionManager(geckosServer) {
  if (!singletonInstance) {
    if (!geckosServer) throw new Error('Geckos.io server is needed')
    singletonInstance = _ChannelConnectionManager(geckosServer)
  }
  return singletonInstance
}

/**
 * Manages the channels and rooms of a geckos.io server.
 *
 * @private
 * @param {Object} geckosServer - The instance of the geckos.io server.
 * @class
 * @returns {ChannelConnectionManager} An object containing functions to manage channels and rooms.
 */
function _ChannelConnectionManager(geckosServer) {
  geckosServer.onConnection((channel) => {
    _handleConnection(channel)

    channel.onDisconnect((reason) => {
      _handleDisconnection(channel, reason)
    })
  })
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/

  /**
   * Set of all channels connected to the server.
   * @type {Set<string>}
   */
  const _channels = new Set()

  /**
   * Array of functions to be called when a new channel connects.
   * @type {Function[]}
   */
  const _connectListeners = []

  /**
   * Array of functions to be called when a channel disconnects.
   * @type {Function[]}
   */
  const _diconnectListeners = []

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /**
   * Handles a new channel connection.
   * @param {*} channel - The channel that connected.
   */
  const _handleConnection = (channel) => {
    console.log(`Channel ${channel.id} connected`)
    _channels.add(channel.id)
    _connectListeners.forEach((listener) => listener(channel.id))
  }

  /**
   * Handles a channel disconnection.
   * @param {*} channel - The channel that disconnected.
   * @param {*} reason - The reason for the disconnection.
   */
  const _handleDisconnection = (channel, reason) => {
    console.log(`Channel ${channel.id} disconnected for reason: ${reason}`)
    manager.deleteChannel(channel.id)
    _diconnectListeners.forEach((listener) => listener(channel.id, reason))
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const manager = {}

  /**
   * Deletes a channel from the server and removes its association with its room.
   * @param {string} channelId - The unique ID of the channel to be deleted.
   * @returns {boolean} True if the channel was deleted, false otherwise.
   */
  manager.deleteChannel = (channelId) => {
    const connection = geckosServer.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) return false

    channel.leave()
    channel.close()
    _channels.delete(channelId)
    return true
  }

  /**
   * Add the listener as a callback whith the channelId to be called when a new channel connects.
   * @param {*} listener - The callback to be called when a new channel connects.
   */
  manager.onConnect = (listener) => {
    _connectListeners.push(listener)
  }

  /**
   * Add the listener as a callback whith the channelId to be called when a channel disconnects.
   * @param {*} listener - The callback to be called when a channel disconnects.
   */
  manager.onDisconnect = (listener) => {
    _diconnectListeners.push(listener)
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Retrieves the total number of channels managed.
   * @name ChannelConnectionManager#nbChannels
   * @type {number}
   * @readonly
   * @description
   * Returns the count of all channels that are currently connected to the server,
   * irrespective of their room association.
   */
  Object.defineProperty(manager, 'nbChannels', {
    get: () => _channels.size,
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current channel id's.
   * @name ChannelConnectionManager#channels
   * @type {Set<string>}
   * @readonly
   */
  Object.defineProperty(manager, 'channels', {
    get: () => new Set(_channels),
    enumerable: true,
  })
  return manager
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

export { ChannelConnectionManager, _ChannelConnectionManager }
