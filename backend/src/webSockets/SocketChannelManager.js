/**
 * @module SocketChannelManager
 */

let singletonInstance = null

/**
 * Factory function to create or retrieve a singleton instance of the ConnectionLinkManager.
 * @returns {Object} An object containing functions to manage ID associations.
 */
function SocketChannelManager() {
  if (!singletonInstance) {
    singletonInstance = _SocketChannelManager()
  }
  return singletonInstance
}

/**
 * Manages the associations between socket and channel IDs.
 *
 * @private
 * @returns {Object} An object containing functions to manage ID associations.
 */
function _SocketChannelManager() {
  /**
   * Map associating socket IDs with channel IDs.
   * @type {Map<string, string>}
   */
  const _socketToChannelMap = new Map()

  /**
   * Map associating channel IDs with socket IDs.
   * @type {Map<string, string>}
   */
  const _channelToSocketMap = new Map()

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  const _getUserId = (socketId, channelId) => {
    if (!socketId || !channelId) {
      throw new Error('Cannot get user ID for null ID')
    }
    const userId = `user_${socketId}_${channelId}`
    return userId
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/

  const manager = {}

  /**
   * Associates a socket ID with a channel ID.
   * @param {string} socketId - The unique ID of the socket.
   * @param {string} channelId - The unique ID of the channel.
   */
  manager.associateIds = (socketId, channelId) => {
    if (!socketId || !channelId) {
      throw new Error('Cannot associate null ID')
    }

    // Remove any existing associations
    const channelIdToDelete = _socketToChannelMap.get(socketId)
    const socketIdToDelete = _channelToSocketMap.get(channelId)
    _socketToChannelMap.delete(socketIdToDelete)
    _channelToSocketMap.delete(channelIdToDelete)

    // Associate and overwrite the IDs
    _socketToChannelMap.set(socketId, channelId)
    _channelToSocketMap.set(channelId, socketId)
  }

  /**
   * Disassociates IDs based on a provided socket or channel ID.
   * @param {string} id - The unique ID of either the socket or the channel.
   */
  manager.disassociateById = (id) => {
    const channelId = _socketToChannelMap.get(id)
    const socketId = _channelToSocketMap.get(id)

    _socketToChannelMap.delete(socketId || id)
    _channelToSocketMap.delete(channelId || id)
  }

  /**
   * Retrieves the associated channel ID for a given socket ID.
   * @param {string} socketId - The socket.io ID.
   * @returns {string|null} The associated channel ID, or null if not found.
   */
  manager.getChannelIdBySocketId = (socketId) => _socketToChannelMap.get(socketId)

  /**
   * Retrieves the associated socket.io ID for a given channel ID.
   * @param {string} channelId - The channel ID.
   * @returns {string|null} The associated socket ID, or null if not found.
   */
  manager.getSocketIdByChannelId = (channelId) => _channelToSocketMap.get(channelId)

  /**
   * Retrieves the associated user ID for a given socket.io ID.
   * @param {*} channelId - The channel ID.
   * @returns {string|undefined} The associated user ID, or undefined if not found.
   */
  manager.getUserIdByChannelId = (channelId) => {
    const socketId = _channelToSocketMap.get(channelId)
    if (!socketId) {
      return undefined
    }
    return _getUserId(socketId, channelId)
  }

  /**
   * Retrieves the associated user ID for a given channel ID.
   * @param {*} socketId - The socket.io ID.
   * @returns {string|undefined} The associated user ID, or undefined if not found.
   */
  manager.getUserIdBySocketId = (socketId) => {
    const channelId = _socketToChannelMap.get(socketId)
    if (!channelId) {
      return undefined
    }
    return _getUserId(socketId, channelId)
  }

  /**
   * Retrieves the associated user IDs for a given socket.io or channel ID.
   * @param {*} id - The socket.io or channel ID.
   * @returns {{ userID: string, socketId: string, channelId: string }|undefined} The associated user IDs or undefined
   */
  manager.getIds = (id) => {
    // check if ID exist and get the user ID
    let userId = null
    let socketId = null
    let channelId = null
    if (manager.getUserIdBySocketId(id)) {
      userId = manager.getUserIdBySocketId(id)
      channelId = manager.getChannelIdBySocketId(id)
      socketId = id
    } else if (manager.getUserIdByChannelId(id)) {
      userId = manager.getUserIdByChannelId(id)
      socketId = manager.getSocketIdByChannelId(id)
      channelId = id
    } else {
      return undefined
    }
    return { userId, socketId, channelId }
  }

  return manager
}

export { SocketChannelManager, _SocketChannelManager }
