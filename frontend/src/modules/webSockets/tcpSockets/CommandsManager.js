let singeltonInstance = null

const CommandsManager = (socketClient) => {
  if (!singeltonInstance) {
    if (!socketClient) throw new Error('Socket.io client is needed')
    singeltonInstance = _CommandsManager(socketClient)
  }
  return singeltonInstance
}

const _CommandsManager = (socketClient) => {
  const _socket = socketClient

  _socket.on('commandSuccess', (result) => {
    console.log('command result from Client', result)
  })
  _socket.on('commandError', (result) => {
    console.log('command error from Client', result)
  })

  const manager = {}

  manager.stopSimulation = () => {
    _socket.emit('command', {
      category: 'engine',
      command: 'stop',
      data: {},
    })
  }
  manager.startSimulation = () => {
    _socket.emit('command', {
      category: 'engine',
      command: 'start',
      data: {},
    })
  }
  manager.onStartStopSimulation = (callback) => {
    _socket.on('commandSuccess', (message) => {
      if (message.action === 'stop') {
        callback(false)
      }
      if (message.action === 'start') {
        callback(true)
      }
    })
  }

  return manager
}

export { CommandsManager }
