import { _SocketChannelManager } from '#src/webSockets/SocketChannelManager.js'

describe('SocketChannelManager tests', () => {
  let manager = null

  beforeEach(() => {
    manager = _SocketChannelManager()
  })

  describe('associateIds tests', () => {
    test('should associate a socket.io ID with a geckos.io ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      // RUN
      manager.associateIds(socketId, channelId)

      // CHECK RESULTS
      expect(manager.getChannelIdBySocketId(socketId)).toBe(channelId)
      expect(manager.getSocketIdByChannelId(channelId)).toBe(socketId)
    })

    test('should overwrite an existing association (unique association)', () => {
      // INIT
      const socketId = 'socketId'
      const oldchannelId = 'oldchannelId'
      const newChannelId = 'newChannelId'

      const oldSocketId = 'oldSocketId'
      const channelId = 'channelId'
      const newSocketId = 'newSocketId'

      // RUN
      manager.associateIds(socketId, oldchannelId)
      manager.associateIds(socketId, newChannelId)

      manager.associateIds(oldSocketId, channelId)
      manager.associateIds(newSocketId, channelId)

      // CHECK RESULTS
      expect(manager.getChannelIdBySocketId(socketId)).toBe(newChannelId)
      expect(manager.getSocketIdByChannelId(oldchannelId)).toBeUndefined()
      expect(manager.getSocketIdByChannelId(newChannelId)).toBe(socketId)

      expect(manager.getChannelIdBySocketId(oldSocketId)).toBeUndefined()
      expect(manager.getChannelIdBySocketId(newSocketId)).toBe(channelId)
    })

    test('should thow null is provided for either ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      // RUN
      expect(() => manager.associateIds(null, channelId)).toThrow()
      expect(() => manager.associateIds(socketId, null)).toThrow()
      expect(() => manager.associateIds(null, null)).toThrow()
    })
  })

  describe('disassociateById tests', () => {
    test('should disassociate by socket.io ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      manager.associateIds(socketId, channelId)

      // RUN
      manager.disassociateById(socketId)

      // CHECK RESULTS
      expect(manager.getChannelIdBySocketId(socketId)).toBeUndefined()
      expect(manager.getSocketIdByChannelId(channelId)).toBeUndefined()
    })

    test('should disassociate by geckos.io ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      manager.associateIds(socketId, channelId)

      // RUN
      manager.disassociateById(channelId)

      // CHECK RESULTS
      expect(manager.getChannelIdBySocketId(socketId)).toBeUndefined()
      expect(manager.getSocketIdByChannelId(channelId)).toBeUndefined()
    })
  })
  describe('getChannelIdBySocketId tests', () => {
    test('should return the associated geckos.io ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getChannelIdBySocketId(socketId)

      // CHECK RESULTS
      expect(result).toBe(channelId)
    })

    test('should return undefined if no association exists', () => {
      // INIT
      const socketId = 'socketId'

      // RUN
      const result = manager.getChannelIdBySocketId(socketId)

      // CHECK RESULTS
      expect(result).toBeUndefined()
    })
  })

  describe('getSocketIdByChannelId tests', () => {
    test('should return the associated socket.io ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getSocketIdByChannelId(channelId)

      // CHECK RESULTS
      expect(result).toBe(socketId)
    })

    test('should return undefined if no association exists', () => {
      // INIT
      const channelId = 'channelId'

      // RUN
      const result = manager.getSocketIdByChannelId(channelId)

      // CHECK RESULTS
      expect(result).toBeUndefined()
    })
  })

  describe('getUserIdByChannelId tests', () => {
    test('should return the associated user ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'
      const userId = `user_${socketId}_${channelId}`

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getUserIdByChannelId(channelId)

      // CHECK RESULTS
      expect(result).toBe(userId)
    })

    test('should return undefined if no association exists', () => {
      // INIT
      const channelId = 'channelId'
      const socketId = 'socketId'

      // RUN
      const result = manager.getUserIdByChannelId(channelId)
      const result2 = manager.getUserIdByChannelId(socketId)

      // CHECK RESULTS
      expect(result).toBeUndefined()
      expect(result2).toBeUndefined()
    })
  })

  describe('getUserIdBySocketId tests', () => {
    test('should return the associated user ID', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'
      const userId = `user_${socketId}_${channelId}`

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getUserIdBySocketId(socketId)

      // CHECK RESULTS
      expect(result).toBe(userId)
    })

    test('should return undefined if no association exists', () => {
      // INIT
      const socketId = 'socketId'

      // RUN
      const result = manager.getUserIdBySocketId(socketId)

      // CHECK RESULTS
      expect(result).toBeUndefined()
    })
  })

  describe('getIds tests', () => {
    test('should return the associated user ID, from socketId', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'
      const userId = `user_${socketId}_${channelId}`

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getIds(socketId)

      // CHECK RESULTS
      expect(result).toEqual({ userId, socketId, channelId: channelId })
    })

    test('should return the associated user ID, from channelId', () => {
      // INIT
      const socketId = 'socketId'
      const channelId = 'channelId'
      const userId = `user_${socketId}_${channelId}`

      manager.associateIds(socketId, channelId)

      // RUN
      const result = manager.getIds(channelId)

      // CHECK RESULTS
      expect(result).toEqual({ userId, socketId, channelId: channelId })
    })

    test('should return undefined if no association exists', () => {
      // INIT
      const socketId = 'socketId'

      // RUN
      const result = manager.getIds(socketId)

      // CHECK RESULTS
      expect(result).toBeUndefined()
    })
  })
})
