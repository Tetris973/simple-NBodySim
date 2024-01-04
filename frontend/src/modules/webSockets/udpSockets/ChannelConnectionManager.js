let singletonInstance = null

/**
 * Factory function to create or retrieve a singleton geckos.io connection manager instance.
 * @param {*} geckosClient - The geckos.io client instance.
 * @returns The geckos.io connection manager instance.
 */
function ChannelConnectionManager(geckosClient) {
  if (!singletonInstance) {
    if (!geckosClient) {
      throw new Error('Geckos.io client is needed')
    }
    singletonInstance = new _ChannelConnectionManager(geckosClient)
  }
  return singletonInstance
}

function _ChannelConnectionManager(geckosClient) {
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/
  let _channel = geckosClient
  let _dataCallback = null
  let _dataEventName = 'simulationData'
  let _connectionListener = null

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /**
   * Handles a connection to the server.
   */
  const _handleConnection = () => {
    console.log('Channel connected to the server!')
    _channel.on(_dataEventName, (data) => {
      _dataCallback(data)
    })
    if (_connectionListener) {
      _connectionListener(_channel.id)
    }
  }

  /**
   * Handles a disconnection from the server.
   */
  const _handleDisconnection = () => {
    console.log('Channel disconnected from the server!')
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const manager = {}

  manager.connect = () => {
    _channel.onConnect((error) => {
      if (error) {
        console.error(error.message)
        return
      }
      _handleConnection()
    })
    _channel.onDisconnect(_handleDisconnection)
  }

  manager.disconnect = () => {
    console.log('Client is disconnecting from the server.')
    _channel.close()
  }

  manager.setDataCallback = (callback) => {
    _dataCallback = callback
  }

  manager.setConnectionListener = (listener) => {
    _connectionListener = listener
  }

  return manager
}

export { ChannelConnectionManager }
