let singletonInstance = null

/**
 * Factory function to create or retrieve a singleton geckos.io connection manager instance.
 * @param {*} geckosClient - The geckos.io client instance.
 * @returns The geckos.io connection manager instance.
 */
function GeckosConnectionManager(geckosClient) {
  if (!singletonInstance) {
    if (!geckosClient) {
      throw new Error('Geckos.io client is needed')
    }
    singletonInstance = new _GeckosConnectionManager(geckosClient)
  }
  return singletonInstance
}

function _GeckosConnectionManager(geckosClient) {
  /****************************************
   *         PRIVATE VARIABLES            *
   ****************************************/
  let _channel = geckosClient
  let _dataCallback = null
  let _dataEventName = 'simulationData'

  /****************************************
   *         PRIVATE FUNCTIONS            *
   ****************************************/

  /**
   * Handles a connection to the server.
   */
  const _handleConnection = () => {
    console.log('You are connected to the server!')
    _channel.on(_dataEventName, (data) => {
      _dataCallback(data)
    })
  }

  /**
   * Handles a disconnection from the server.
   */
  const _handleDisconnection = () => {
    console.log('You were disconnected from the server!')
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

  return manager
}

export { GeckosConnectionManager }
