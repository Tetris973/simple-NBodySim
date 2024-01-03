import {
  ChannelConnectionManager,
  _ChannelConnectionManager,
} from '#src/webSockets/udpSockets/ChannelConnectionManager.js'
import { MockGeckosServer } from '#tests/testUtils/geckosMock'

/**********************************************
 *         CHANNEL ROOM MANAGER TESTS         *
 **********************************************/

describe('ChannelConnectionManager tests', () => {
  let manager = null
  let mockGeckos = null

  beforeEach(() => {
    mockGeckos = new MockGeckosServer()
    manager = _ChannelConnectionManager(mockGeckos)
  })

  describe('Singleton behavior', () => {
    test('should return the same instance when called multiple times', () => {
      // INIT
      const manager = ChannelConnectionManager(mockGeckos)

      // RUN
      const manager2 = ChannelConnectionManager(mockGeckos)

      // CHECK RESULTS
      expect(manager).toBe(manager2)
    })
  })

  describe('onConnection behavior (geckos onConnection method)', () => {
    test('should add channel to manager', () => {
      // INIT
      const channelId = 'channel1'

      // RUN
      mockGeckos.triggerOnConnection(channelId)

      // CHECK RESULTS
      expect(manager.channels.size).toBe(1)
      expect(manager.channels).toContain(channelId)
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
      mockGeckos.triggerOnConnection(channelId)

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
      mockGeckos.triggerOnConnection(channelId)
      mockGeckos.triggerOnDisconnect(channelId, 'reason')

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
      mockGeckos.triggerOnConnection(channelId)

      // RUN
      mockGeckos.triggerOnDisconnect(channelId, 'reason')

      // CHECK RESULTS
      expect(manager.channels.size).toBe(0)
      expect(manager.channels).not.toContain(channelId)
    })
  })

  describe('deleteChannel Method', () => {
    test('should return false when channel does not exist', () => {
      // INIT
      const channelId = 'channel1'

      // RUN
      const result = manager.deleteChannel(channelId)

      // CHECK RESULTS
      expect(result).toBeFalsy()
    })

    test('should remove channel from manager and close channel', () => {
      // INIT
      const channelId = 'channel1'
      mockGeckos.triggerOnConnection(channelId)

      // RUN
      const result = manager.deleteChannel(channelId)

      // CHECK RESULTS
      const channel = mockGeckos.connections.get(channelId).channel
      expect(result).toBeTruthy()
      expect(manager.channels.size).toBe(0)
      expect(channel.leave).toHaveBeenCalled()
      expect(channel.close).toHaveBeenCalled()
      expect(manager.channels).not.toContain(channelId)
    })
  })

  function multipleChannels() {
    const channelId = 'channel1'
    mockGeckos.triggerOnConnection(channelId)

    const channelId_2 = 'channel2'
    mockGeckos.triggerOnConnection(channelId_2)

    const channelId_3 = 'channel3'
    mockGeckos.triggerOnConnection(channelId_3)

    return { channelId, channelId_2, channelId_3 }
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
      multipleChannels()

      // RUN
      const result = manager.nbChannels

      // CHECK RESULTS
      expect(result).toBe(3)
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
      const { channelId, channelId_2, channelId_3 } = multipleChannels()

      // RUN
      const result = manager.channels

      // CHECK RESULTS
      expect(result.size).toBe(3)
      expect(result).toContain(channelId)
      expect(result).toContain(channelId_2)
      expect(result).toContain(channelId_3)
    })
  })
})
