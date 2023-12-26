import { RoomManager, _RoomManager, RoomManagerLibrary } from '#src/webSockets/RoomManager.js'
import { SocketChannelManager } from '#src/webSockets/SocketChannelManager.js'
import { MockGeckosServer } from '#tests/testUtils/geckosMock.js'
import { SocketTestHelper } from '#tests/testUtils/SocketTestHelper.js'

describe('RoomManager tests', () => {
  let manager = null
  let mockGeckos = null
  let socketChannelManager = null
  let socketTestHelper = null

  beforeAll(async () => {
    socketTestHelper = new SocketTestHelper()
    await socketTestHelper.startServers()
  })

  beforeEach(() => {
    socketChannelManager = SocketChannelManager()
    mockGeckos = new MockGeckosServer()

    manager = new _RoomManager(mockGeckos, socketTestHelper.socketServer)
  })

  afterEach(() => {
    socketTestHelper.closeAllClients()
  })

  afterAll(() => {
    socketTestHelper.closeServers()
  })

  /**
   * Create 2 rooms, 3 users.
   * User 1 and 2 are in room 1.
   * User 3 is in room 2.
   */
  async function multipleUsersInMultipleRoomsSetup() {
    const roomId_1 = 'room1'
    manager.create(roomId_1)

    const roomId_2 = 'room2'
    manager.create(roomId_2)

    const channel_1 = mockGeckos.triggerOnConnection('channel1')
    const socket_1 = await socketTestHelper.connectNewClient()
    socketChannelManager.associateIds(socket_1.id, channel_1.id)

    const channel_2 = mockGeckos.triggerOnConnection('channel2')
    const socket_2 = await socketTestHelper.connectNewClient()
    socketChannelManager.associateIds(socket_2.id, channel_2.id)

    const channel_3 = mockGeckos.triggerOnConnection('channel3')
    const socket_3 = await socketTestHelper.connectNewClient()
    socketChannelManager.associateIds(socket_3.id, channel_3.id)

    manager.join(socketChannelManager.getIds(channel_1.id), roomId_1)
    manager.join(socketChannelManager.getIds(channel_2.id), roomId_1)
    manager.join(socketChannelManager.getIds(channel_3.id), roomId_2)

    return { socket_1, socket_2, socket_3, channel_1, channel_2, channel_3, roomId_1, roomId_2 }
  }

  describe('Singleton behavior', () => {
    test('RoomManagerLibrary is a singleton', () => {
      // INIT
      const manager = RoomManager(mockGeckos, socketTestHelper.socketServer)

      // RUN
      const manager2 = RoomManager(mockGeckos, socketTestHelper.socketServer)

      // CHECK RESULTS
      expect(manager).toBe(manager2)
    })
  })

  describe('createRoom Method', () => {
    test('should create a new room', () => {
      // INIT
      const roomId = 'room1'

      // RUN
      manager.create(roomId)

      // CHECK RESULTS
      expect(manager.rooms.size).toBe(1)
      expect(manager.rooms.get(roomId)).toEqual([])
      expect(manager.getRoomContext(roomId).roomId).toBe(roomId)
    })
    test('should throw an error when room already exists', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)

      // ERROR CHECK
      expect(() => manager.create(roomId)).toThrow('Room room1 already exists')
    })
  })

  describe('join method', () => {
    test('should join a room', async () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socket = await socketTestHelper.connectNewClient()

      socketChannelManager.associateIds(socket.id, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // RUN
      manager.join(ids, roomId)

      // CHECK RESULTS
      expect(manager.rooms.get(roomId)).toEqual([ids.userId])
      expect(socketTestHelper.socketServer.sockets.sockets.get(socket.id).rooms).toEqual(
        new Set([socket.id, roomId])
      )
    })

    test('should switch room if already in one', async () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const roomId2 = 'room2'
      manager.create(roomId2)

      const channel = mockGeckos.triggerOnConnection('channel1')
      const socket = await socketTestHelper.connectNewClient()
      socketChannelManager.associateIds(socket.id, channel.id)
      const ids = socketChannelManager.getIds(channel.id)
      manager.join(ids, roomId)

      // RUN
      manager.join(ids, roomId2)

      // CHECK RESULTS
      expect(manager.rooms.get(roomId)).toEqual([])
      expect(manager.rooms.get('room2')).toEqual([ids.userId])
      expect(socketTestHelper.socketServer.sockets.sockets.get(socket.id).rooms).toEqual(
        new Set([socket.id, roomId2])
      )
    })

    test('should throw an error when room does not exist', () => {
      // INIT
      const roomId = 'room1'
      socketChannelManager.associateIds('socketId', 'channelId')
      const ids = socketChannelManager.getIds('channelId')

      // ERROR CHECK
      expect(() => manager.join(ids, roomId)).toThrow('Room room1 does not exist')
    })

    test('should throw an error when every ids are not given', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      let ids = null

      // ERROR CHECK
      ids = { userId: 'userId' }
      expect(() => manager.join(ids, roomId)).toThrow('User IDs are required')

      ids = { userId: 'userId', socketId: 'socketId' }
      expect(() => manager.join(ids, roomId)).toThrow('User IDs are required')

      ids = { userId: 'userId', channelId: 'channelId' }
      expect(() => manager.join(ids, roomId)).toThrow('User IDs are required')

      ids = { socketId: 'socketId', channelId: 'channelId' }
      expect(() => manager.join(ids, roomId)).toThrow('User IDs are required')
    })

    test('should throw an error when socket does not exist', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socketId = 'socketId'

      socketChannelManager.associateIds(socketId, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // ERROR CHECK
      expect(() => manager.join(ids, roomId)).toThrow(`Socket ${socketId} does not exist`)
    })

    test('should throw an error when channel does not exist', async () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const socket = await socketTestHelper.connectNewClient()
      const channelId = 'channelId'

      socketChannelManager.associateIds(socket.id, channelId)
      const ids = socketChannelManager.getIds(channelId)

      // ERROR CHECK
      expect(() => manager.join(ids, roomId)).toThrow(`Channel ${channelId} does not exist`)
    })
  })

  describe('leave method', () => {
    test('should leave the unique room the user is in', async () => {
      // INIT
      const { socket_1, socket_2, channel_1, channel_2, channel_3, roomId_1, roomId_2 } =
        await multipleUsersInMultipleRoomsSetup()

      const ids_1 = socketChannelManager.getIds(channel_1.id)
      const ids_2 = socketChannelManager.getIds(channel_2.id)
      const ids_3 = socketChannelManager.getIds(channel_3.id)

      // RUN
      manager.leave(ids_1)

      //CHECK RESULTS
      expect(manager.rooms.get(roomId_1)).toEqual([ids_2.userId])
      expect(socketTestHelper.socketServer.sockets.sockets.get(socket_1.id).rooms).toEqual(
        new Set([socket_1.id])
      )
      expect(socketTestHelper.socketServer.sockets.sockets.get(socket_2.id).rooms).toEqual(
        new Set([socket_2.id, roomId_1])
      )
      expect(manager.getNbUsersInRoom(roomId_1)).toBe(1)
      expect(manager.users).toEqual(
        new Map([
          [ids_2.userId, roomId_1],
          [ids_3.userId, roomId_2],
        ])
      )
    })

    test('should do nothing if user is not in a room', async () => {
      // INIT
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socket = await socketTestHelper.connectNewClient()

      socketChannelManager.associateIds(socket.id, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // RUN
      manager.leave(ids)

      // CHECK RESULTS
      expect(manager.rooms.size).toBe(0)
      expect(manager.users.size).toBe(0)
    })

    test('should throw an error when every ids are not given', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      let ids = null

      // ERROR CHECK
      ids = { userId: 'userId' }
      expect(() => manager.leave(ids, roomId)).toThrow('User IDs are required')

      ids = { userId: 'userId', socketId: 'socketId' }
      expect(() => manager.leave(ids, roomId)).toThrow('User IDs are required')

      ids = { userId: 'userId', channelId: 'channelId' }
      expect(() => manager.leave(ids, roomId)).toThrow('User IDs are required')

      ids = { socketId: 'socketId', channelId: 'channelId' }
      expect(() => manager.leave(ids, roomId)).toThrow('User IDs are required')
    })

    test('should throw an error when socket does not exist', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socketId = 'socketId'

      socketChannelManager.associateIds(socketId, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // ERROR CHECK
      expect(() => manager.leave(ids, roomId)).toThrow(`Socket ${socketId} does not exist`)
    })

    test('should throw an error when channel does not exist', async () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)
      const socket = await socketTestHelper.connectNewClient()
      const channelId = 'channelId'

      socketChannelManager.associateIds(socket.id, channelId)
      const ids = socketChannelManager.getIds(channelId)

      // ERROR CHECK
      expect(() => manager.leave(ids, roomId)).toThrow(`Channel ${channelId} does not exist`)
    })
  })

  describe('getRoomContext method', () => {
    test('should return the room context', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)

      // RUN
      const context = manager.getRoomContext(roomId)

      // CHECK RESULTS
      expect(context.roomId).toBe(roomId)
    })

    test('should be undefined when romm does not exist', () => {
      // INIT
      const roomId = 'room1'

      // ERROR CHECK
      expect(manager.getRoomContext(roomId)).toBeUndefined()
    })
  })

  describe('getRoomContextByUserId method', () => {
    test('should return the room context', async () => {
      // INIT
      const { channel_1, channel_2, channel_3, roomId_1, roomId_2 } =
        await multipleUsersInMultipleRoomsSetup()

      const ids_1 = socketChannelManager.getIds(channel_1.id)
      const ids_2 = socketChannelManager.getIds(channel_2.id)
      const ids_3 = socketChannelManager.getIds(channel_3.id)

      // RUN
      const context_1 = manager.getRoomContextByUserId(ids_1.userId)
      const context_2 = manager.getRoomContextByUserId(ids_2.userId)
      const context_3 = manager.getRoomContextByUserId(ids_3.userId)

      // CHECK RESULTS
      expect(context_1.roomId).toBe(roomId_1)
      expect(context_2.roomId).toBe(roomId_1)
      expect(context_3.roomId).toBe(roomId_2)
    })

    test('should be undefined when user is not in a room', async () => {
      // INIT
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socket = await socketTestHelper.connectNewClient()

      socketChannelManager.associateIds(socket.id, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // RUN
      const context = manager.getRoomContextByUserId(ids.userId)

      // CHECK RESULTS
      expect(context).toBeUndefined()
    })
  })

  describe('getUserRoomId method', () => {
    test('should return the room id of the user', async () => {
      // INIT
      const { channel_1, channel_2, channel_3, roomId_1, roomId_2 } =
        await multipleUsersInMultipleRoomsSetup()

      const ids_1 = socketChannelManager.getIds(channel_1.id)
      const ids_2 = socketChannelManager.getIds(channel_2.id)
      const ids_3 = socketChannelManager.getIds(channel_3.id)

      // RUN
      const roomId_1_result = manager.getUserRoomId(ids_1.userId)
      const roomId_2_result = manager.getUserRoomId(ids_2.userId)
      const roomId_3_result = manager.getUserRoomId(ids_3.userId)

      // CHECK RESULTS
      expect(roomId_1_result).toBe(roomId_1)
      expect(roomId_2_result).toBe(roomId_1)
      expect(roomId_3_result).toBe(roomId_2)
    })

    test('should return undefined when user is not in a room', async () => {
      // INIT
      const channel = mockGeckos.triggerOnConnection('channel1')
      const socket = await socketTestHelper.connectNewClient()

      socketChannelManager.associateIds(socket.id, channel.id)
      const ids = socketChannelManager.getIds(channel.id)

      // RUN
      const result = manager.getUserRoomId(ids)

      // CHECK RESULTS
      expect(result).toBeUndefined()
    })
  })

  describe('getNbUsersInRoom method', () => {
    test('should return the number of users in the room', async () => {
      // INIT
      const userChannelSetup = await multipleUsersInMultipleRoomsSetup()

      // RUN
      const nbUsersRoom1 = manager.getNbUsersInRoom(userChannelSetup.roomId_1)
      const nbUsersRoom2 = manager.getNbUsersInRoom(userChannelSetup.roomId_2)

      // CHECK RESULTS
      expect(nbUsersRoom1).toBe(2)
      expect(nbUsersRoom2).toBe(1)
    })

    test('should return 0 when room does not exist', () => {
      // INIT
      const roomId = 'room1'

      // RUN
      const nbUsers = manager.getNbUsersInRoom(roomId)

      // CHECK RESULTS
      expect(nbUsers).toBe(0)
    })

    test('should return 0 when room is empty', () => {
      // INIT
      const roomId = 'room1'
      manager.create(roomId)

      // RUN
      const nbUsers = manager.getNbUsersInRoom(roomId)

      // CHECK RESULTS
      expect(nbUsers).toBe(0)
    })
  })

  describe('nbRooms property', () => {
    test('should return 0 when no room exist', () => {
      // INIT

      // CHECK RESULTS
      expect(manager.nbRooms).toBe(0)
    })

    test('should return correct number with multiples users and rooms', async () => {
      // INIT
      await multipleUsersInMultipleRoomsSetup()

      // CHECK RESULTS
      expect(manager.nbRooms).toBe(2)
    })
  })

  describe('nbUsers property', () => {
    test('should return 0 when no user exist', () => {
      // INIT

      // CHECK RESULTS
      expect(manager.nbUsers).toBe(0)
    })

    test('should return correct number with multiples users and rooms', async () => {
      // INIT
      await multipleUsersInMultipleRoomsSetup()

      // CHECK RESULTS
      expect(manager.nbUsers).toBe(3)
    })
  })

  describe('rooms property', () => {
    test('should return empty map when no room exist', () => {
      // INIT

      // CHECK RESULTS
      expect(manager.rooms).toEqual(new Map())
    })

    test('should return correct map with multiples users and rooms', async () => {
      // INIT
      const userChannelSetup = await multipleUsersInMultipleRoomsSetup()

      const ids_1 = socketChannelManager.getIds(userChannelSetup.channel_1.id)
      const ids_2 = socketChannelManager.getIds(userChannelSetup.channel_2.id)
      const ids_3 = socketChannelManager.getIds(userChannelSetup.channel_3.id)

      // CHECK RESULTS
      expect(manager.rooms).toEqual(
        new Map([
          [userChannelSetup.roomId_1, [ids_1.userId, ids_2.userId]],
          [userChannelSetup.roomId_2, [ids_3.userId]],
        ])
      )
    })
  })
})

/**********************************************
 *     CHANNEL ROOM MANAGER LIBRARY TESTS     *
 **********************************************/

describe('RoomManagerLibrary tests', () => {
  let itemToGroupMap = null
  let groupToItemsMap = null

  beforeEach(() => {
    itemToGroupMap = new Map()
    groupToItemsMap = new Map()
  })

  describe('removeItemFromGroup Method', () => {
    test('should return false when maps are empty', () => {
      // INIT

      // RUN
      const result = RoomManagerLibrary.removeItemFromGroup(
        'item1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(result).toBe(false)
    })

    test('should return false when group to remove item from does not exist', () => {
      // INIT
      itemToGroupMap.set('item1', 'group1')

      // RUN
      const result = RoomManagerLibrary.removeItemFromGroup(
        'item1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(result).toBe(false)
    })

    test('should return false when item is not in its group', () => {
      // INIT

      itemToGroupMap.set('item1', 'group1')
      itemToGroupMap.set('item2', 'group1')
      groupToItemsMap.set('group1', ['item2'])

      // RUN
      const result = RoomManagerLibrary.removeItemFromGroup(
        'item1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(result).toBe(false)
    })

    test('should remove item from its group and return true', () => {
      // INIT
      itemToGroupMap.set('item1', 'group1')
      itemToGroupMap.set('item2', 'group1')

      groupToItemsMap.set('group1', ['item1', 'item2'])

      // RUN
      const result = RoomManagerLibrary.removeItemFromGroup(
        'item1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(result).toBe(true)
      expect(groupToItemsMap.get('group1')).toEqual(['item2'])
    })
  })

  describe('associateItemWithGroup Method', () => {
    test('should associate item with unique group, group and item exist', () => {
      // INIT
      itemToGroupMap.set('item1', 'group1')
      groupToItemsMap.set('group1', ['item1'])
      groupToItemsMap.set('group2', [])

      // RUN
      RoomManagerLibrary.associateItemWithGroup('item1', 'group2', itemToGroupMap, groupToItemsMap)

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group2')
      expect(groupToItemsMap.get('group1')).toEqual([])
      expect(groupToItemsMap.get('group2')).toEqual(['item1'])
    })
    test('should associate item with group, group does not exist', () => {
      // INIT

      // RUN
      RoomManagerLibrary.associateItemWithGroup('item1', 'group1', itemToGroupMap, groupToItemsMap)

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group1')
      expect(groupToItemsMap.get('group1')).toEqual(['item1'])
    })

    test('should associate item with group, group exists, item does not exist', () => {
      // INIT
      groupToItemsMap.set('group1', ['item2'])

      // RUN
      RoomManagerLibrary.associateItemWithGroup('item1', 'group1', itemToGroupMap, groupToItemsMap)

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group1')
      expect(groupToItemsMap.get('group1')).toEqual(['item2', 'item1'])
    })
  })
})
