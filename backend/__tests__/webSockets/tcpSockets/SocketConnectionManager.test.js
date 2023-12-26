import {
  SocketConnectionManager,
  _SocketConnectionManager,
} from '#src/webSockets/tcpSockets/SocketConnectionManager'

import { SocketTestHelper } from '#tests/testUtils/SocketTestHelper.js'

describe('SocketConnectionManager tests', () => {
  let manager = null
  let socketTestHelper = null

  beforeAll(async () => {
    socketTestHelper = new SocketTestHelper()
    await socketTestHelper.startServers()
  })

  beforeEach(() => {
    manager = _SocketConnectionManager(socketTestHelper.socketServer)
  })

  afterEach(() => {
    socketTestHelper.closeAllClients()
  })

  afterAll(() => {
    socketTestHelper.closeServers()
  })

  describe('Singleton behavior', () => {
    test('should return the same instance when called multiple times', () => {
      // INIT
      const manager = SocketConnectionManager(socketTestHelper.socketServer)

      // RUN
      const manager2 = SocketConnectionManager()

      // CHECK RESULTS
      expect(manager).toBe(manager2)
    })
  })

  describe('onConnection behavior (socket.io onConnection method)', () => {
    test('should add socket to manager', async () => {
      // INIT

      // RUN
      const socket = await socketTestHelper.connectNewClient()

      // CHECK RESULTS
      expect(manager.sockets.size).toBe(1)
      expect(manager.sockets).toContain(socket.id)
    })
  })

  describe('onConnection method', () => {
    test('should call all listeners', async () => {
      // INIT
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      manager.onConnect(listener1)
      manager.onConnect(listener2)

      // RUN
      const socket = await socketTestHelper.connectNewClient()

      // CHECK RESULTS
      expect(listener1).toHaveBeenCalledWith(socket.id)
      expect(listener2).toHaveBeenCalledWith(socket.id)
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('onDisconnect method', () => {
    test('should call all listeners', async () => {
      // INIT
      const listener1 = jest.fn()
      const listener2 = jest.fn()
      const socket = await socketTestHelper.connectNewClient()

      // RUN
      manager.onDisconnect(listener1)
      manager.onDisconnect(listener2)
      socketTestHelper.socketServer.sockets.sockets.get(socket.id).disconnect(true)

      // CHECK RESULTS
      expect(listener1).toHaveBeenCalledWith(socket.id, 'server namespace disconnect')
      expect(listener2).toHaveBeenCalledWith(socket.id, 'server namespace disconnect')
      expect(listener1).toHaveBeenCalledTimes(1)
      expect(listener2).toHaveBeenCalledTimes(1)
    })
  })

  describe('onDisconnect behavior (socket.io onDisconnect method)', () => {
    test('should remove socket from manager', async () => {
      // INIT
      const socket = await socketTestHelper.connectNewClient()

      // RUN
      socketTestHelper.socketServer.sockets.sockets.get(socket.id).disconnect(true)

      // CHECK RESULTS
      expect(manager.sockets.size).toBe(0)
      expect(manager.sockets).not.toContain(socket.id)
    })
  })

  describe('deleteSocket method', () => {
    test('should return false when socket was not present', async () => {
      // INIT
      const socketId = 'socket1'

      // RUN
      const deleted = manager.deleteSocket(socketId)

      // CHECK RESULTS
      expect(deleted).toBe(false)
      expect(manager.sockets.size).toBe(0)
      expect(manager.sockets).not.toContain(socketId)
    })

    test('should remove socket from manager and return true', async () => {
      // INIT
      const socket = await socketTestHelper.connectNewClient()
      const clientDisconnect = new Promise((resolve) => {
        socket.on('disconnect', () => {
          resolve()
        })
      })

      // RUN
      const deleted = manager.deleteSocket(socket.id)
      await clientDisconnect

      // CHECK RESULTS
      expect(deleted).toBe(true)
      expect(manager.sockets.size).toBe(0)
      expect(manager.sockets).not.toContain(socket.id)
      expect(socketTestHelper.socketServer.sockets.sockets.get(socket.id)).toBeUndefined()
      expect(socket.connected).toBe(false)
    })
  })

  function multipleSockets(nbSockets) {
    const sockets = []
    for (let i = 0; i < nbSockets; i++) {
      sockets.push(socketTestHelper.connectNewClient())
    }
    return Promise.all(sockets)
  }

  describe('nbSockets property', () => {
    test('should return 0 when no sockets are present', () => {
      // INIT

      // RUN
      const nbSocketsInManager = manager.nbSockets

      // CHECK RESULTS
      expect(nbSocketsInManager).toBe(0)
    })
    test('should return the number of sockets', async () => {
      // INIT
      const nbSockets = 10
      await multipleSockets(nbSockets)

      // RUN
      const nbSocketsInManager = manager.nbSockets

      // CHECK RESULTS
      expect(nbSocketsInManager).toBe(nbSockets)
    })
  })

  describe('sockets property', () => {
    test('should return an empty set when no sockets are present', () => {
      // INIT

      // RUN
      const result = manager.sockets

      // CHECK RESULTS
      expect(result.size).toBe(0)
    })
    test('should return a set with the socket ids', async () => {
      // INIT
      const nbSockets = 10
      const sockets = await multipleSockets(nbSockets)

      // RUN
      const result = manager.sockets

      // CHECK RESULTS
      expect(result.size).toBe(nbSockets)
      sockets.forEach((socket) => expect(result).toContain(socket.id))
    })
  })
})
