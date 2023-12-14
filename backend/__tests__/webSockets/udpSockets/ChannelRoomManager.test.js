import {
  ChannelRoomManager,
  _ChannelRoomManager,
  ChannelRoomManagerLibrary,
} from '#src/webSockets/udpSockets/ChannelRoomManager.js'

/**********************************************
 *         CHANNEL ROOM MANAGER TESTS         *
 **********************************************/

describe('ChannelRoomManager tests', () => {
  let manager = null
  let geckosInstance = null
  let triggerOnConnection = null // Function to trigger onConnection
  let triggerOnDisconnect = null

  // Create mock functions for channel methods
  const createMockConnection = (channelId) => {
    let onDisconnectCallback = null
    return {
      channel: {
        id: channelId,
        join: jest.fn(),
        leave: jest.fn(),
        close: jest.fn(),
        onDisconnect: jest.fn((callback) => {
          onDisconnectCallback = callback
        }),
        _triggerDisconnect: (reason) => onDisconnectCallback && onDisconnectCallback(reason),
      },
    }
  }

  beforeEach(() => {
    let onConnectionCallback = null // Store the callback

    // Mock onConnection method to store the callback
    geckosInstance = {
      connections: new Map(),
      onConnection: jest.fn((callback) => {
        onConnectionCallback = callback
      }),
    }

    manager = _ChannelRoomManager(geckosInstance)

    // Function to trigger the onConnection process
    triggerOnConnection = (channelId) => {
      const connection = createMockConnection(channelId)
      geckosInstance.connections.set(channelId, connection)
      if (onConnectionCallback) {
        onConnectionCallback(connection.channel)
      }
    }

    // Function to trigger the onDisconnect process
    triggerOnDisconnect = (channelId, reason) => {
      const channel = geckosInstance.connections.get(channelId).channel
      if (channel) {
        channel._triggerDisconnect(reason)
      }
    }
  })

  describe('Singleton behavior', () => {
    test('should return the same instance when called multiple times', () => {
      // INIT
      const manager = ChannelRoomManager(geckosInstance)

      // RUN
      const manager2 = ChannelRoomManager(geckosInstance)

      // CHECK RESULTS
      expect(manager).toBe(manager2)
    })
  })

  describe('onConnection behavior (geckos onConnection method)', () => {
    test('should add channel to manager', () => {
      // INIT
      const channelId = 'channel1'

      // RUN
      triggerOnConnection(channelId)

      // CHECK RESULTS
      expect(manager.channels.size).toBe(1)
      expect(manager.channels.get(channelId)).toBeNull()
    })
  })

  describe('onConnection method', () => {
    test('should call all listeners', () => {
      // INIT
      const channelId = 'channel1'
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      manager.onConnect(listener1)
      manager.onConnect(listener2)

      // RUN
      triggerOnConnection(channelId)

      // CHECK RESULTS
      expect(listener1).toHaveBeenCalledWith(channelId)
      expect(listener2).toHaveBeenCalledWith(channelId)
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('onDisconnect method', () => {
    test('should call all listeners', () => {
      // INIT
      const channelId = 'channel1'
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      manager.onDisconnect(listener1)
      manager.onDisconnect(listener2)

      // RUN
      triggerOnConnection(channelId)
      triggerOnDisconnect(channelId, 'reason')

      // CHECK RESULTS
      expect(listener1).toHaveBeenCalledWith(channelId, 'reason')
      expect(listener2).toHaveBeenCalledWith(channelId, 'reason')
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('onDisconnect behavior (channel onDisconnect method)', () => {
    test('should remove channel from manager', () => {
      // INIT
      const channelId = 'channel1'
      triggerOnConnection(channelId)

      // RUN
      triggerOnDisconnect(channelId, 'reason')

      // CHECK RESULTS
      expect(manager.channels.size).toBe(0)
      expect(manager.channels.get(channelId)).toBeUndefined()
    })

    test('should remove channel from its room', () => {
      // INIT
      const channelId = 'channel1'
      const roomId = 'room1'
      triggerOnConnection(channelId)
      manager.createRoom(roomId)
      manager.joinRoom(channelId, roomId)

      // RUN
      triggerOnDisconnect(channelId, 'reason')

      // CHECK RESULTS
      expect(manager.channels.size).toBe(0)
      expect(manager.channels.get(channelId)).toBeUndefined()
      expect(manager.rooms.get(roomId)).toEqual([])
    })
  })

  describe('deleteChannel Method', () => {
    test('should return false when channel does not exist', () => {
      // INIT
      const channelId = 'channel1'

      // RUN
      const result = manager.deleteChannel(channelId)

      // CHECK RESULTS
      expect(result).toBe(false)
    })

    test('should remove channel from manager and close channel, channel in a room', () => {
      // INIT
      const channelId = 'channel1'
      const roomId = 'room1'
      triggerOnConnection(channelId)
      manager.createRoom(roomId)
      manager.joinRoom(channelId, roomId)

      expect(manager.channels.size).toBe(1)
      expect(manager.channels.get(channelId)).toBe(roomId)

      // RUN
      const result = manager.deleteChannel(channelId)

      // CHECK RESULTS
      const channel = geckosInstance.connections.get(channelId).channel
      expect(result).toBe(true)
      expect(manager.channels.size).toBe(0)
      expect(channel.leave).toHaveBeenCalled()
      expect(channel.close).toHaveBeenCalled()
      expect(manager.channels.get(channelId)).toBeUndefined()
      expect(manager.rooms.get(roomId)).toEqual([])
    })

    test('should remove channel from manager and close channel, channel not in a room', () => {
      // INIT
      const channelId = 'channel1'
      triggerOnConnection(channelId)

      expect(manager.channels.size).toBe(1)
      expect(manager.channels.get(channelId)).toBeNull()

      // RUN
      const result = manager.deleteChannel(channelId)

      // CHECK RESULTS
      const channel = geckosInstance.connections.get(channelId).channel
      expect(result).toBe(true)
      expect(manager.channels.size).toBe(0)
      expect(channel.leave).toHaveBeenCalled()
      expect(channel.close).toHaveBeenCalled()
      expect(manager.channels.get(channelId)).toBeUndefined()
    })

    describe('createRoom Method', () => {
      test('should throw an error when room already exists', () => {
        // INIT
        const roomId = 'room1'
        manager.createRoom(roomId)

        // ERROR CHECK
        expect(() => manager.createRoom(roomId)).toThrow('Room room1 already exists')
      })

      test('should create a new room', () => {
        // INIT
        const roomId = 'room1'

        // RUN
        manager.createRoom(roomId)

        // CHECK RESULTS
        expect(manager.rooms.size).toBe(1)
        expect(manager.rooms.get(roomId)).toEqual([])
        expect(manager.getRoomContext(roomId).roomId).toBe(roomId)
      })
    })

    describe('joinRoom Method', () => {
      test('should do nothing when channel does not exist', () => {
        // INIT
        const channelId = 'channel1'
        const roomId = 'room1'

        // RUN
        manager.joinRoom(channelId, roomId)

        // CHECK RESULTS
        expect(manager.channels.size).toBe(0)
        expect(manager.rooms.size).toBe(0)
      })

      test('should remove channel from its current room and add it to the new room', () => {
        // INIT
        const channelId = 'channel1'
        const roomId = 'room1'
        const roomId_2 = 'room2'
        triggerOnConnection(channelId)
        manager.createRoom(roomId)
        manager.createRoom(roomId_2)
        manager.joinRoom(channelId, roomId)

        expect(manager.channels.size).toBe(1)
        expect(manager.channels.get(channelId)).toBe(roomId)
        expect(manager.rooms.get(roomId)).toEqual([channelId])

        // RUN
        manager.joinRoom(channelId, roomId_2)

        // CHECK RESULTS
        const channel = geckosInstance.connections.get(channelId).channel
        expect(channel.join).toHaveBeenCalledWith(roomId_2)
        expect(manager.channels.size).toBe(1)
        expect(manager.channels.get(channelId)).toBe(roomId_2)
        expect(manager.rooms.get(roomId)).toEqual([])
        expect(manager.rooms.get(roomId_2)).toEqual([channelId])
      })

      test('should throw an error when room does not exist', () => {
        // INIT
        const channelId = 'channel1'
        const roomId = 'room1'
        triggerOnConnection(channelId)

        // ERROR CHECK
        expect(() => manager.joinRoom(channelId, roomId)).toThrow('Room room1 does not exist')
      })
    })

    describe('quitRoom Method', () => {
      test('should do nothing when channel does not exist', () => {
        // INIT
        const channelId = 'channel1'

        // RUN
        manager.quitRoom(channelId)

        // CHECK RESULTS
        expect(manager.channels.size).toBe(0)
        expect(manager.rooms.size).toBe(0)
      })

      test('should remove channel from its current room', () => {
        // INIT
        const channelId = 'channel1'
        const roomId = 'room1'
        triggerOnConnection(channelId)
        manager.createRoom(roomId)
        manager.joinRoom(channelId, roomId)

        expect(manager.channels.size).toBe(1)
        expect(manager.channels.get(channelId)).toBe(roomId)
        expect(manager.rooms.get(roomId)).toEqual([channelId])

        // RUN
        manager.quitRoom(channelId)

        // CHECK RESULTS
        const channel = geckosInstance.connections.get(channelId).channel
        expect(channel.leave).toHaveBeenCalled()
        expect(manager.channels.size).toBe(1)
        expect(manager.channels.get(channelId)).toBeNull()
        expect(manager.rooms.get(roomId)).toEqual([])
      })
    })
  })

  describe('getNbchannelsInRoom method', () => {
    test('should return 0 when room does not exist', () => {
      // INIT
      const roomId = 'room1'

      // RUN
      const result = manager.getNbChannelsInRoom(roomId)

      // CHECK RESULTS
      expect(result).toBe(0)
    })

    test('should return 0 when room is empty', () => {
      // INIT
      const channelId = 'channel1'
      const roomId = 'room1'
      triggerOnConnection(channelId)
      manager.createRoom(roomId)

      manager.joinRoom(channelId, roomId) // to create the room
      manager.quitRoom(channelId)

      // RUN
      const result = manager.getNbChannelsInRoom(roomId)

      // CHECK RESULTS
      expect(result).toBe(0)
    })

    test('should return 1 when room has 1 channel', () => {
      // INIT
      const roomId = 'room1'
      const roomId_2 = 'room2'

      const channelId = 'channel1'
      triggerOnConnection(channelId)
      manager.createRoom(roomId)
      manager.joinRoom(channelId, roomId)

      const channelId_2 = 'channel2'
      triggerOnConnection(channelId_2)
      manager.createRoom(roomId_2)
      manager.joinRoom('channel2', roomId_2)

      // RUN
      const result = manager.getNbChannelsInRoom(roomId)

      // CHECK RESULTS
      expect(result).toBe(1)
    })
  })

  function multipleChannelsInMultipleRoomsSetup() {
    const channelId = 'channel1'
    const roomId = 'room1'
    triggerOnConnection(channelId)
    manager.createRoom(roomId)

    const channelId_2 = 'channel2'
    triggerOnConnection(channelId_2)

    const roomId_2 = 'room2'
    const channelId_3 = 'channel3'
    triggerOnConnection(channelId_3)
    manager.createRoom(roomId_2)

    manager.joinRoom(channelId, roomId)
    manager.joinRoom(channelId_2, roomId)
    manager.joinRoom(channelId_3, roomId_2)

    return { channelId, channelId_2, channelId_3, roomId, roomId_2 }
  }

  describe('nbChannels property', () => {
    test('should return 0 when no channels exist', () => {
      // INIT

      // RUN
      const result = manager.nbChannels

      // CHECK RESULTS
      expect(result).toBe(0)
    })

    test('should return correct number with channels in multiple rooms', () => {
      // INIT
      multipleChannelsInMultipleRoomsSetup()

      // RUN
      const result = manager.nbChannels

      // CHECK RESULTS
      expect(result).toBe(3)
    })
  })

  describe('nbRooms property', () => {
    test('should return 0 when no rooms exist', () => {
      // INIT

      // RUN
      const result = manager.nbRooms

      // CHECK RESULTS
      expect(result).toBe(0)
    })

    test('should return correct number with channels in multiple rooms', () => {
      // INIT
      multipleChannelsInMultipleRoomsSetup()

      // RUN
      const result = manager.nbRooms

      // CHECK RESULTS
      expect(result).toBe(2)
    })
  })

  describe('rooms property', () => {
    test('should return empty map when no rooms exist', () => {
      // INIT

      // RUN
      const result = manager.rooms

      // CHECK RESULTS
      expect(result.size).toBe(0)
    })

    test('should return correct map with channels in multiple rooms', () => {
      // INIT
      const { channelId, channelId_2, channelId_3, roomId, roomId_2 } =
        multipleChannelsInMultipleRoomsSetup()

      // RUN
      const result = manager.rooms

      // CHECK RESULTS
      expect(result.size).toBe(2)
      expect(result.get(roomId)).toEqual([channelId, channelId_2])
      expect(result.get(roomId_2)).toEqual([channelId_3])
    })
  })

  describe('channels property', () => {
    test('should return empty map when no channels exist', () => {
      // INIT

      // RUN
      const result = manager.channels

      // CHECK RESULTS
      expect(result.size).toBe(0)
    })

    test('should return correct map with channels in multiple rooms', () => {
      // INIT
      const { channelId, channelId_2, channelId_3, roomId, roomId_2 } =
        multipleChannelsInMultipleRoomsSetup()

      // RUN
      const result = manager.channels

      // CHECK RESULTS
      expect(result.size).toBe(3)
      expect(result.get(channelId)).toBe(roomId)
      expect(result.get(channelId_2)).toBe(roomId)
      expect(result.get(channelId_3)).toBe(roomId_2)
    })
  })
})

/**********************************************
 *     CHANNEL ROOM MANAGER LIBRARY TESTS     *
 **********************************************/

describe('ChannelRoomManagerLibrary tests', () => {
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
      const result = ChannelRoomManagerLibrary.removeItemFromGroup(
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
      const result = ChannelRoomManagerLibrary.removeItemFromGroup(
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
      const result = ChannelRoomManagerLibrary.removeItemFromGroup(
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
      const result = ChannelRoomManagerLibrary.removeItemFromGroup(
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
      ChannelRoomManagerLibrary.associateItemWithGroup(
        'item1',
        'group2',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group2')
      expect(groupToItemsMap.get('group1')).toEqual([])
      expect(groupToItemsMap.get('group2')).toEqual(['item1'])
    })
    test('should associate item with group, group does not exist', () => {
      // INIT

      // RUN
      ChannelRoomManagerLibrary.associateItemWithGroup(
        'item1',
        'group1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group1')
      expect(groupToItemsMap.get('group1')).toEqual(['item1'])
    })

    test('should associate item with group, group exists, item does not exist', () => {
      // INIT
      groupToItemsMap.set('group1', ['item2'])

      // RUN
      ChannelRoomManagerLibrary.associateItemWithGroup(
        'item1',
        'group1',
        itemToGroupMap,
        groupToItemsMap
      )

      // CHECK RESULTS
      expect(itemToGroupMap.get('item1')).toBe('group1')
      expect(groupToItemsMap.get('group1')).toEqual(['item2', 'item1'])
    })
  })
})
