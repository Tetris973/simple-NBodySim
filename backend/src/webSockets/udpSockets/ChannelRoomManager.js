import { RoomContext } from '#src/webSockets/RoomContext.js'

/**
 * @module ChannelRoomManager
 */
let singletonInstance = null

/**
 * The default room ID.
 * @type {string}
 * @readonly
 * @description
 * This is a default room ID that anyone can connect to, it is managed by the admin.
 */
const DEFAULT_ROOM_ID = 'default-room'

/**
 * Returns a singleton instance of the _ChannelRoomManager.
 * @param {*} geckosInstance - The instance of the geckos.io server.
 * @returns {Object} An object containing functions to manage channels and rooms.
 */
function ChannelRoomManager(geckosInstance) {
  if (!singletonInstance) {
    if (!geckosInstance) throw new Error('Geckos.io server is needed')
    singletonInstance = _ChannelRoomManager(geckosInstance)
  }
  return singletonInstance
}

/**
 * Manages the channels and rooms of a geckos.io server.
 *
 * @private
 * @param {Object} geckosInstance - The instance of the geckos.io server.
 * @returns {Object} An object containing functions to manage channels and rooms.
 */
function _ChannelRoomManager(geckosInstance) {
  geckosInstance.onConnection((channel) => {
    _handleConnection(channel)

    channel.onDisconnect((reason) => {
      _handleDisconnection(channel, reason)
    })
  })
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/

  /**
   * Map associating channel IDs with their respective room IDs.
   * @type {Map<string, string>}
   */
  const _channelToRoomMap = new Map()

  /**
   * Map associating room IDs with arrays of channel IDs.
   * @type {Map<string, string[]>}
   */
  const _roomToChannelsMap = new Map()

  /**
   * Map associating room IDs with their respective RoomContexts.
   * @type {Map<string, RoomContext>}
   * @description
   */
  const _roomContexts = new Map()

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
    _channelToRoomMap.set(channel.id, null)
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
   *
   * @param {string} channelId - The unique ID of the channel to be deleted.
   * @returns {boolean} True if the channel was deleted, false otherwise.
   * @description
   * This function will remove the channel from its associated room, if any, and then close the channel.
   */
  manager.deleteChannel = (channelId) => {
    const connection = geckosInstance.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) return false

    removeItemFromGroup(channelId, _channelToRoomMap, _roomToChannelsMap)
    channel.leave()
    channel.close()
    _channelToRoomMap.delete(channelId)
    return true
  }

  /**
   * Creates a new room with the specified ID and its associated RoomContext.
   * @param {*} roomId - The unique ID of the room.
   */
  manager.createRoom = (roomId) => {
    if (_roomToChannelsMap.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`)
    }

    _roomToChannelsMap.set(roomId, [])
    _roomContexts.set(roomId, RoomContext(roomId))
  }

  /**
   * Adds a channel to a room. If the channel is already in a room, it will be moved to the new room.
   * Do nothing if the channel does not exist.
   * @param {string} channelId - The unique ID of the channel.
   * @param {string} roomId - The unique ID of the room.
   */
  manager.joinRoom = (channelId, roomId) => {
    const connection = geckosInstance.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) return

    if (channel.roomId === roomId) return

    if (!_roomToChannelsMap.has(roomId)) {
      throw new Error(`Room ${roomId} does not exist`)
    }

    removeItemFromGroup(channelId, _channelToRoomMap, _roomToChannelsMap)
    channel.join(roomId)
    associateItemWithGroup(channelId, roomId, _channelToRoomMap, _roomToChannelsMap)
  }

  /**
   * Removes a channel from its associated room.
   * @param {string} channelId - The unique ID of the channel.
   */
  manager.quitRoom = (channelId) => {
    const connection = geckosInstance.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) return

    removeItemFromGroup(channelId, _channelToRoomMap, _roomToChannelsMap)
    _channelToRoomMap.set(channelId, null)
    channel.leave()
  }

  /**
   * Calculates and returns the number of channels present in a specified room.
   *
   * @param {string} roomId - The unique ID of the room for which the channel count is to be determined.
   * @returns {number} The number of channels currently in the specified room. Returns 0 if the room does not exist or has no channels.
   */
  manager.getNbChannelsInRoom = (roomId) => {
    const channelsInRoom = _roomToChannelsMap.get(roomId)
    return channelsInRoom ? channelsInRoom.length : 0
  }

  /**
   * Returns the context of a specified room.
   * @param {*} roomId - The unique ID of the room.
   * @returns {RoomContext} The context of the specified room or undefined if the room does not exist.
   */
  manager.getRoomContext = (roomId) => {
    return _roomContexts.get(roomId)
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
   * Retrieves the total number of rooms currently active on the server.
   * @name ChannelRoomManager#nbRooms
   * @type {number}
   * @readonly
   * @description
   * Returns the count of all rooms that have been created on the server.
   * This count includes both empty and occupied rooms.
   */
  Object.defineProperty(manager, 'nbRooms', {
    get: () => _roomToChannelsMap.size,
    enumerable: true,
  })

  /**
   * Retrieves the total number of channels connected to the server.
   * @name ChannelRoomManager#nbChannels
   * @type {number}
   * @readonly
   * @description
   * Returns the count of all channels that are currently connected to the server,
   * irrespective of their room association.
   */
  Object.defineProperty(manager, 'nbChannels', {
    get: () => _channelToRoomMap.size,
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current channel data.
   * @name ChannelRoomManager#channelsCopy
   * @type {Map<string, string>}
   * @readonly
   */
  Object.defineProperty(manager, 'channels', {
    get: () => new Map(_channelToRoomMap),
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current room-to-channels association data.
   * @name ChannelRoomManager#roomsCopy
   * @type {Map<string, string[]>}
   * @readonly
   */
  Object.defineProperty(manager, 'rooms', {
    get: () =>
      new Map(
        Array.from(_roomToChannelsMap.entries()).map(([roomId, channels]) => [
          roomId,
          [...channels],
        ])
      ),
    enumerable: true,
  })
  return manager
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

/**
 * Removes an item from its associated group.
 * @param {string} itemId - The unique ID of the item.
 * @param {Map<string, string>} itemToGroupMap - Map of item IDs to their respective group IDs.
 * @param {Map<string, string[]>} groupToItemsMap - Map of group IDs to arrays of item IDs.
 * @returns {boolean} True if the item was removed from its associated group, false otherwise.
 */
function removeItemFromGroup(itemId, itemToGroupMap, groupToItemsMap) {
  const room = itemToGroupMap.get(itemId)
  if (!room) return false

  const channelsInRoom = groupToItemsMap.get(room)
  if (!channelsInRoom) return false

  const channelIndex = channelsInRoom.indexOf(itemId)
  if (channelIndex !== -1) {
    channelsInRoom.splice(channelIndex, 1)
    return true
  }
  return false
}

/**
 * Associates an item with a new group, removing it from its previous group if necessary.
 * @param {string} itemId - The unique ID of the item.
 * @param {string} groupId - The unique ID of the group.
 * @param {Map<string, string>} itemToGroupMap - Map of item IDs to their respective group IDs.
 * @param {Map<string, string[]>} groupToItemsMap - Map of group IDs to arrays of item IDs.
 */
function associateItemWithGroup(itemId, groupId, itemToGroupMap, groupToItemsMap) {
  removeItemFromGroup(itemId, itemToGroupMap, groupToItemsMap)
  itemToGroupMap.set(itemId, groupId)
  if (!groupToItemsMap.has(groupId)) {
    groupToItemsMap.set(groupId, [])
  }
  groupToItemsMap.get(groupId).push(itemId)
}

const ChannelRoomManagerLibrary = {
  removeItemFromGroup,
  associateItemWithGroup,
}

export { ChannelRoomManager, _ChannelRoomManager, ChannelRoomManagerLibrary, DEFAULT_ROOM_ID }
