class MockChannel {
  constructor(channelId) {
    this.id = channelId
    this.join = jest.fn()
    this.leave = jest.fn()
    this.close = jest.fn()
    this.onDisconnectCallback = null
    this.onDisconnect = jest.fn((callback) => {
      this.onDisconnectCallback = callback
    })
  }

  triggerDisconnect(reason) {
    if (this.onDisconnectCallback) {
      this.onDisconnectCallback(reason)
    }
  }
}

class MockConnection {
  constructor(channelId) {
    this.channel = new MockChannel(channelId)
  }
}

class MockGeckosServer {
  constructor() {
    this.connections = new Map()
    this.onConnection = jest.fn((callback) => {
      this.onConnectionCallback = callback
    })
    this.onConnectionCallback = null
  }

  triggerOnConnection(channelId) {
    const connection = new MockConnection(channelId)
    this.connections.set(channelId, connection)
    if (this.onConnectionCallback) {
      this.onConnectionCallback(connection.channel)
    }
    return connection.channel
  }

  triggerOnDisconnect(channelId, reason) {
    const channel = this.connections.get(channelId).channel
    if (channel) {
      channel.triggerDisconnect(reason)
    }
  }
}

export { MockChannel, MockGeckosServer }
