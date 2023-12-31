import { Worker } from 'worker_threads'

describe('SimpleEngineWorker tests', () => {
  let worker

  beforeEach(async () => {
    // INIT
    worker = new Worker('./src/engine/SimpleEngineWorker.js')
  })

  afterEach(() => {
    worker.terminate()
  })

  // Helper function for sending commands to the worker
  const sendCommand = (command, data = null) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        worker.off('message', messageHandler) // Remove listener to prevent memory leaks
        reject(new Error(`No message received for command ${command} within the expected time.`))
      }, 1000)

      const messageHandler = (message) => {
        if (message.action === command) {
          clearTimeout(timeoutId)
          worker.off('message', messageHandler) // Remove listener after receiving expected message
          resolve(message)
        } else if (message.action === 'engineData') {
          // Ignore engine data messages because managed by another test
        } else {
          clearTimeout(timeoutId)
          worker.off('message', messageHandler) // Remove listener on unexpected action
          reject(
            new Error(`Unexpected action received: ${message.action}, it should be ${command}`)
          )
        }
      }

      worker.on('message', messageHandler)
      worker.postMessage({ command, data })
    })
  }

  describe('getWorkerType command', () => {
    test('should correctly get the worker type', async () => {
      // INIT

      // RUN
      const result = await sendCommand('getWorkerType')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'getWorkerType',
        status: 'success',
        data: 'SimpleEngineWorker',
      })
    })
  })

  describe('init command', () => {
    test('should correctly initialize the engine', async () => {
      // INIT

      // RUN
      const result = await sendCommand('init')

      // CHECK RESULTS
      expect(result).toEqual({ action: 'init', status: 'success', data: null })
    })
  })

  describe('validate command', () => {
    test('should correctly initialize the engine', async () => {
      // INIT
      await sendCommand('init')
      const entities = [{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }]
      const taskId = 'exampleTask'

      await sendCommand('setTask', taskId)
      await sendCommand('setEntities', entities)

      // RUN
      const result = await sendCommand('validate')

      // CHECK RESULTS
      expect(result).toEqual({ action: 'validate', status: 'success', data: null })
    })

    test('should throw error for engine not ready', async () => {
      // INIT
      await sendCommand('init')

      // RUN
      const result = await sendCommand('validate')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'validate',
        error: 'Engine not ready: Task not set,Entities not set',
        status: 'error',
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT

      // RUN
      const result = await sendCommand('validate')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'validate',
        error: 'Can not transition from uninitialized to ready',
        status: 'error',
      })
    })
  })

  describe('setTask command', () => {
    test('should correctly set the task', async () => {
      // INIT
      await sendCommand('init')
      const taskId = 'exampleTask'

      // RUN
      const result = await sendCommand('setTask', taskId)

      // CHECK RESULTS
      expect(result).toEqual({ action: 'setTask', status: 'success', data: null })
    })

    test('should throw error for invalid task', async () => {
      // INIT
      await sendCommand('init')
      const invalidTask = 'invalidTask'

      // RUN
      const result = await sendCommand('setTask', invalidTask)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setTask',
        status: 'error',
        error: 'Task not found for ID: ' + invalidTask,
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT
      const taskId = 'exampleTask'

      // RUN
      const result = await sendCommand('setTask', taskId)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setTask',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })
  })

  describe('setEntities command', () => {
    test('should correctly set the entities', async () => {
      // INIT
      await sendCommand('init')
      const entities = [{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }]

      // RUN
      const result = await sendCommand('setEntities', entities)

      // CHECK RESULTS
      expect(result).toEqual({ action: 'setEntities', status: 'success', data: entities })
    })

    test('should set even if empty entities', async () => {
      // INIT
      await sendCommand('init')
      const entities = []

      // RUN
      const result = await sendCommand('setEntities', entities)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setEntities',
        status: 'success',
        data: entities,
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT
      const entities = [{ mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }]

      // RUN
      const result = await sendCommand('setEntities', entities)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setEntities',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })
  })

  describe('setTimeScaleFactor command', () => {
    test('should correctly set the time scale factor', async () => {
      // INIT
      await sendCommand('init')
      const timeScaleFactor = 2

      // RUN
      const result = await sendCommand('setTimeScaleFactor', timeScaleFactor)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setTimeScaleFactor',
        status: 'success',
        data: null,
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT
      const timeScaleFactor = 2

      // RUN
      const result = await sendCommand('setTimeScaleFactor', timeScaleFactor)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setTimeScaleFactor',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })

    test('should throw error for time scale factor inferior to 1', async () => {
      // INIT
      await sendCommand('init')
      const timeScaleFactor = 0.5

      // RUN
      const result = await sendCommand('setTimeScaleFactor', timeScaleFactor)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setTimeScaleFactor',
        error: 'Time scale factor must be greater than or equal to 1.',
        status: 'error',
      })
    })
  })

  describe('setDt command', () => {
    test('should correctly set the delta time', async () => {
      // INIT
      await sendCommand('init')
      const dt = 2

      // RUN
      const result = await sendCommand('setDt', dt)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setDt',
        status: 'success',
        data: null,
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT
      const dt = 2

      // RUN
      const result = await sendCommand('setDt', dt)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setDt',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })

    test('should throw error for delta time inferior or equal to 0', async () => {
      // INIT
      await sendCommand('init')
      const dt = 0

      // RUN
      const result = await sendCommand('setDt', dt)

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'setDt',
        error: 'dt must be greater than 0.',
        status: 'error',
      })
    })
  })

  describe('start command', () => {
    test('should correctly start the engine', async () => {
      // INIT
      await sendCommand('init')
      await sendCommand('setTask', 'exampleTask')
      await sendCommand('setEntities', [
        { mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      ])
      await sendCommand('validate')

      // RUN
      const result = await sendCommand('start')

      // CHECK RESULTS
      expect(result).toEqual({ action: 'start', status: 'success', data: null })
    })

    test('should throw error for engine not ready', async () => {
      // INIT
      await sendCommand('init')

      // RUN
      const result = await sendCommand('start')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'start',
        error: 'You can not execute this command in the current state: initialized',
        status: 'error',
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT

      // RUN
      const result = await sendCommand('start')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'start',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })
  })

  describe('stop command', () => {
    test('should correctly stop the engine', async () => {
      // INIT
      await sendCommand('init')
      await sendCommand('setTask', 'exampleTask')
      await sendCommand('setEntities', [
        { mass: 1, position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      ])
      await sendCommand('validate')
      await sendCommand('start')

      // RUN
      const result = await sendCommand('stop')

      // CHECK RESULTS
      expect(result).toEqual({ action: 'stop', status: 'success', data: null })
    })

    test('should throw error for engine not ready', async () => {
      // INIT
      await sendCommand('init')

      // RUN
      const result = await sendCommand('stop')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'stop',
        error: 'You can not execute this command in the current state: initialized',
        status: 'error',
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT

      // RUN
      const result = await sendCommand('stop')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'stop',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })
  })

  describe('getEngineInfos command', () => {
    test('should correctly get the engine status', async () => {
      // INIT
      await sendCommand('init')

      // RUN
      const result = await sendCommand('getEngineInfos')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'getEngineInfos',
        status: 'success',
        data: {
          currentState: 'initialized',
          lastTickTime: 0,
          meanTickTime: 0,
          tickPerSecond: 0,
          tickCount: 0,
          updateRate: 60,
          updatePerSecond: 0,
          meanUpdateTime: 0,
          timeScaleFactor: 1,
          dt: null,
        },
      })
    })

    test('should throw error for engine not initialized', async () => {
      // INIT

      // RUN
      const result = await sendCommand('getEngineInfos')

      // CHECK RESULTS
      expect(result).toEqual({
        action: 'getEngineInfos',
        error: 'You can not execute this command in the current state: uninitialized',
        status: 'error',
      })
    })
  })

  // complte test with multiple round of engine, getting the engine status, etc.
  describe('complete test', () => {
    // Function to receive and store engine data for a set amount of time
    const receiveEngineData = (durationMs) => {
      return new Promise((resolve) => {
        const engineData = []

        // Function to handle incoming messages
        const messageHandler = (message) => {
          if (message.action === 'engineData') {
            engineData.push(message.data)
          }
        }

        // Set up listener for engine data
        worker.on('message', messageHandler)

        // Wait for the specified duration, then remove listener and resolve
        setTimeout(() => {
          worker.off('message', messageHandler) // Remove listener to stop receiving data
          resolve(engineData)
        }, durationMs)
      })
    }
    test('should correctly run the engine', async () => {
      // INIT: Set up the engine and entities

      const entities = [{ mass: 1 }]
      await sendCommand('init')
      await sendCommand('setTask', 'exampleTask') // Dummy task with 10ms computation
      await sendCommand('setEntities', entities)
      await sendCommand('validate')
      await sendCommand('start')

      // RUN: Wait for 1s for the engine to run
      let receivedData = await receiveEngineData(1000)
      await sendCommand('stop')

      // CHECK RESULTS: Engine status and engine data
      // difficult to check results as the execution time is not constant
      // so we just check that at least values are not 0
      const result = await sendCommand('getEngineInfos')
      expect(result.status).toEqual('success')
      expect(result.data.lastTickTime).toBeGreaterThan(1)
      expect(result.data.tickPerSecond).toBeGreaterThan(1)
      expect(result.data.meanTickTime).toBeGreaterThan(1)
      expect(result.data.tickCount).toBeGreaterThan(1)
      expect(result.data.updateRate).toBe(60)
      expect(result.data.updatePerSecond).toBeGreaterThan(1)
      expect(result.data.meanUpdateTime).toBeGreaterThan(1)
      expect(receivedData.length).toBeGreaterThan(1)
    })
  })

  test('should throws error for unknown command', async () => {
    // INIT
    const unknownCommand = 'unknownCommand'

    // RUN
    const result = await sendCommand(unknownCommand)

    // CHECK RESULTS
    expect(result).toEqual({ action: unknownCommand, status: 'error', error: 'Unknown command' })
  })
})
