import { engineCommands } from '#src/webSockets/tcpSockets/engineCommands.js'

describe('engineCommands tests', () => {
  describe('stop command', () => {
    // should stop the engine and with the promise return in data atribute, it should do another process when the engine is stopped
    test('should stop the engine and return success object', async () => {
      // INIT
      const promise = Promise.resolve('stopped')
      const context = {
        roomContext: {
          engineController: {
            stop: jest.fn(() => promise),
          },
        },
      }

      // RUN
      const result = await engineCommands.stop(context)

      // CHECK RESULTS
      expect(result).toEqual({ action: 'stop', status: 'success', data: 'stopped' })
    })

    test('should stop the engine and return error object', async () => {
      // INIT
      const promise = Promise.reject(new Error('error message'))
      const context = {
        roomContext: {
          engineController: {
            stop: jest.fn(() => promise),
          },
        },
      }

      // RUN
      const result = await engineCommands.stop(context)

      // CHECK RESULTS
      expect(result).toEqual({ action: 'stop', status: 'error', error: 'error message' })
    })

    test('should return error object if roomContext is not defined', async () => {
      // INIT
      const context = {}
      let result

      // RUN
      try {
        await engineCommands.stop(context)
      } catch (error) {
        result = error
      }

      // CHECK RESULTS
      expect(result.message).toBe('Missing roomContext in context for "stop" command')
    })
  })
})
