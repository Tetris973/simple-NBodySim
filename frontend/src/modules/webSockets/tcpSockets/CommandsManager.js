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

  manager.restartSimulation = () => {
    _socket.emit('command', {
      category: 'engine',
      command: 'restart',
      data: {},
    })
  }
  manager.onRestartSimulation = (callback) => {
    _socket.on('commandSuccess', (message) => {
      if (message.action === 'restart') {
        callback()
      }
    })
  }

  manager.setDt = (dt) => {
    _socket.emit('command', {
      category: 'engine',
      command: 'setDt',
      data: dt,
    })
  }
  manager.onSetDt = (callback) => {
    _socket.on('commandSuccess', (message) => {
      if (message.action === 'setDt') {
        callback(message.data.dt)
      }
    })
  }

  manager.setTimeScale = (timeScale) => {
    _socket.emit('command', {
      category: 'engine',
      command: 'setTimeScale',
      data: timeScale,
    })
  }
  manager.onSetTimeScale = (callback) => {
    _socket.on('commandSuccess', (message) => {
      if (message.action === 'setTimeScale') {
        callback(message.data.timeScale)
      }
    })
  }

  manager.getEngineInfos = () => {
    _socket.emit('command', {
      category: 'engine',
      command: 'getInfos',
      data: {},
    })
  }
  manager.onGetEnginInfos = (callback) => {
    _socket.on('commandSuccess', (message) => {
      if (message.action === 'getInfos') {
        callback(message.data)
      }
    })
  }

  return manager
}

export { CommandsManager }
