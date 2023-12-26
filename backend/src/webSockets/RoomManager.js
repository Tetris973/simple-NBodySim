import { RoomContext } from '#src/webSockets/RoomContext.js'

/**
 * @module RoomManager
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
 * Factory function to create or retrieve a singleton instance of the RoomManager.
 * @param {Object} geckosServer - The instance of the geckos.io server.
 * @param {Object} socketServer - The instance of the socket.io.io server.
 * @returns {Object} An object containing functions to manage rooms.
 */
function RoomManager(geckosServer, socketServer) {
  if (!singletonInstance) {
    if (!geckosServer || !socketServer) {
      throw new Error('Geckos.io and socket.io servers are required')
    }
    singletonInstance = _RoomManager(geckosServer, socketServer)
  }
  return singletonInstance
}

/**
 * Manages rooms for geckos.io and socket.io.io servers along with their connection managers.
 *
 * @private
 * @param {Object} geckosServer - The instance of the geckos.io server.
 * @param {Object} socketServer - The instance of the socket.io.io server.
 * @returns {Object} An object containing functions to manage rooms.
 */
function _RoomManager(geckosServer, socketServer) {
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/

  /**
   * Map associating user IDs with their respective room IDs.
   * @type {Map<string, string>}
   */
  const _userToRoomMap = new Map()

  /**
   * Map associating room IDs with arrays of user IDs.
   * @type {Map<string, string[]>}
   */
  const _roomToUsersMap = new Map()

  /**
   * Map associating room IDs with their respective RoomContexts.
   * @type {Map<string, RoomContext>}
   */
  const _roomContexts = new Map()

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /**
   * Joins a geckos.io room.
   * @param {*} channelId - The unique ID of the geckos.io channel.
   * @param {*} roomId - The unique ID of the room.
   * @throws {Error} If the channel does not exist.
   */
  const _joinChannelRoom = (channelId, roomId) => {
    const connection = geckosServer.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) {
      throw new Error(`Channel ${channelId} does not exist`)
    }
    channel.leave()
    channel.join(roomId)
  }

  /**
   * Joins a socket.io room.
   * @param {*} socketId - The unique ID of the socket.io socket.
   * @param {*} roomId - The unique ID of the room.
   * @throws {Error} If the socket does not exist.
   */
  const _joinSocketRoom = (socketId, roomId) => {
    const socket = socketServer.sockets.sockets.get(socketId)
    if (!socket) {
      throw new Error(`Socket ${socketId} does not exist`)
    }

    // leave all rooms before joining another room
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // Don't leave the default room, which is the socket's own id
        socket.leave(room)
      }
    }
    socket.join(roomId)
  }

  /**
   * Associates a user with a room.
   * @param {*} userId - The unique ID of the user.
   * @param {*} roomId - The unique ID of the room.
   */
  const _joinManagerRoom = (userId, roomId) => {
    removeItemFromGroup(userId, _userToRoomMap, _roomToUsersMap)
    associateItemWithGroup(userId, roomId, _userToRoomMap, _roomToUsersMap)
  }

  /**
   * Removes a user from a geckos.io room.
   * @param {*} channelId - The unique ID of the geckos.io channel.
   * @throws {Error} If the channel does not exist.
   */
  const _leaveChannelRoom = (channelId) => {
    const connection = geckosServer.connections.get(channelId)
    const channel = connection ? connection.channel : undefined
    if (!channel) {
      throw new Error(`Channel ${channelId} does not exist`)
    }

    channel.leave()
  }

  /**
   * Removes a user from a socket.io room.
   * @param {*} socketId - The unique ID of the socket.io socket.
   * @throws {Error} If the socket does not exist.
   */
  const _leaveSocketRoom = (socketId) => {
    const socket = socketServer.sockets.sockets.get(socketId)
    if (!socket) {
      throw new Error(`Socket ${socketId} does not exist`)
    }

    for (const room of socket.rooms) {
      if (room !== socket.id) {
        // Don't leave the default room, which is the socket's own id
        socket.leave(room)
      }
    }
  }

  /**
   * Removes a user from a room.
   * @param {*} userId - The unique ID of the user.
   */
  const _leaveManagerRoom = (userId) => {
    removeItemFromGroup(userId, _userToRoomMap, _roomToUsersMap)
    _userToRoomMap.delete(userId)
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const manager = {}

  /**
   * Creates a new room with the specified ID and its associated RoomContext.
   * @param {string} roomId - The unique ID of the room.
   */
  manager.create = (roomId) => {
    if (_roomToUsersMap.has(roomId)) {
      throw new Error(`Room ${roomId} already exists`)
    }
    _roomToUsersMap.set(roomId, [])
    _roomContexts.set(roomId, new RoomContext(roomId))
  }

  /**
   * Adds a user to a room.
   * @param {Object} ids - The IDs of the user to add to the room.
   * @param {string} ids.userId - The unique ID of the user.
   * @param {string} ids.socketId - The unique ID of the socket.io socket.
   * @param {string} ids.channelId - The unique ID of the geckos.io channel.
   * @param {string} roomId - The unique ID of the room.
   * @throws {Error} If the room does not exist.
   * @throws {Error} If the user IDs are missing.
   * @throws {Error} If the socket.io socket does not exist.
   * @throws {Error} If the geckos.io channel does not exist.
   */
  manager.join = ({ userId, socketId, channelId }, roomId) => {
    if (!_roomToUsersMap.has(roomId)) {
      throw new Error(`Room ${roomId} does not exist`)
    }
    if (!userId || !socketId || !channelId) {
      throw new Error('User IDs are required')
    }

    _joinChannelRoom(channelId, roomId)
    _joinSocketRoom(socketId, roomId)
    _joinManagerRoom(userId, roomId)
  }

  /**
   * Removes a user from a room.
   * @param {Object} ids - The IDs of the user to add to the room.
   * @param {string} ids.userId - The unique ID of the user.
   * @param {string} ids.socketId - The unique ID of the socket.io socket.
   * @param {string} ids.channelId - The unique ID of the geckos.io channel.
   * @returns {boolean} True if the user existed and was removed from the room, false otherwise.
   * @throws {Error} If the user IDs are missing.
   * @throws {Error} If the socket.io socket does not exist.
   * @throws {Error} If the geckos.io channel does not exist.
   */
  manager.leave = ({ userId, socketId, channelId }) => {
    if (!userId || !socketId || !channelId) {
      throw new Error('User IDs are required')
    }
    _leaveChannelRoom(channelId)
    _leaveSocketRoom(socketId)
    _leaveManagerRoom(userId)
    return true
  }

  /**
   * Retrieves the context of a specified room.
   * @param {string} roomId - The unique ID of the room.
   * @returns {RoomContext} The context of the specified room or undefined if the room does not exist.
   */
  manager.getRoomContext = (roomId) => {
    return _roomContexts.get(roomId)
  }

  /**
   * Retrieves the context of the room to which a specified user belongs.
   * @param {String} userId - The unique ID of the user.
   * @returns {RoomContext} The context of the room to which the specified user belongs or undefined if the user does not exist.
   */
  manager.getRoomContextByUserId = (userId) => {
    // must be a string
    if (typeof userId !== 'string') {
      throw new Error('userId must be a string')
    }
    const roomId = _userToRoomMap.get(userId)
    return _roomContexts.get(roomId)
  }

  /**
   * Retrieves the ID of the room to which a specified user belongs.
   * @param {string} userId - The unique ID of the user.
   * @returns {string} The ID of the room to which the specified user belongs or undefined if the user does not exist.
   */
  manager.getUserRoomId = (userId) => {
    return _userToRoomMap.get(userId)
  }

  /**
   * Calculates and returns the number of users present in a specified room.
   *
   * @param {string} roomId - The unique ID of the room for which the users count is to be determined.
   * @returns {number} The number of users currently in the specified room. Returns 0 if the room does not exist or has no users.
   */
  manager.getNbUsersInRoom = (roomId) => {
    const usersInRoom = _roomToUsersMap.get(roomId)
    return usersInRoom ? usersInRoom.length : 0
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Retrieves the total number of rooms currently active on the server.
   * @name RoomManager#nbRooms
   * @type {number}
   * @readonly
   * @description
   * Returns the count of all rooms that have been created on the server.
   * This count includes both empty and occupied rooms.
   */
  Object.defineProperty(manager, 'nbRooms', {
    get: () => _roomToUsersMap.size,
    enumerable: true,
  })

  /**
   * Retrieves the total number of users connected to the server.
   * @name RoomManager#nbUsers
   * @type {number}
   * @readonly
   * @description
   * Returns the count of all users that are currently connected to the server,
   * irrespective of their room association.
   */
  Object.defineProperty(manager, 'nbUsers', {
    get: () => _userToRoomMap.size,
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current users data.
   * @name RoomManager#users
   * @type {Map<string, string>}
   * @readonly
   */
  Object.defineProperty(manager, 'users', {
    get: () => new Map(_userToRoomMap),
    enumerable: true,
  })

  /**
   * Retrieves a copy of the current room-to-users association data.
   * @name RoomManager#rooms
   * @type {Map<string, string[]>}
   * @readonly
   */
  Object.defineProperty(manager, 'rooms', {
    get: () =>
      new Map(Array.from(_roomToUsersMap.entries()).map(([roomId, users]) => [roomId, [...users]])),
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
  const group = itemToGroupMap.get(itemId)
  if (!group) return false

  const itemsInGroup = groupToItemsMap.get(group)
  if (!itemsInGroup) return false

  const itemIndex = itemsInGroup.indexOf(itemId)
  if (itemIndex !== -1) {
    itemsInGroup.splice(itemIndex, 1)
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

const RoomManagerLibrary = { removeItemFromGroup, associateItemWithGroup }

export { RoomManager, _RoomManager, RoomManagerLibrary, DEFAULT_ROOM_ID }
