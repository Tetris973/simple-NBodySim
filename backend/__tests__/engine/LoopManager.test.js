// Import the LoopManager module
import { LoopManager } from '#src/engine/LoopManager.js'

// Describe the test suite for LoopManager
describe('LoopManager Tests', () => {
  let loopManager
  let mockLoopAction

  // Mocking setImmediate for testing purposes
  jest.useFakeTimers()

  beforeEach(() => {
    mockLoopAction = jest.fn()
    loopManager = LoopManager(mockLoopAction)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  // Test the start method
  describe('start method', () => {
    test('should start the loop', () => {
      // INIT

      // RUN
      loopManager.start()
      jest.runOnlyPendingTimers() // Advance timers to trigger setImmediate

      // CHECK RESULTS
      expect(mockLoopAction).toHaveBeenCalled()
    })
  })

  describe('stop method', () => {
    test('should stop the loop', () => {
      // INIT
      loopManager.start()

      // RUN
      loopManager.stop()
      jest.runOnlyPendingTimers()

      // CHECK RESULTS
      expect(mockLoopAction).toHaveBeenCalledTimes(1)
    })
  })

  describe('Loop Functionality', () => {
    test('should repeatedly call loopAction', () => {
      // INIT
      loopManager.start()

      // RUN
      jest.advanceTimersByTime(100) // Advance time to simulate multiple iterations

      // CHECK RESULTS
      expect(mockLoopAction).toHaveBeenCalledTimes(102)
    })

    test('should handle errors in loopAction', () => {
      // INIT
      const error = new Error('Test Error')
      mockLoopAction.mockImplementation(() => {
        throw error
      })

      // ERROR CHECK
      expect(() => loopManager.start()).toThrow(error)
      jest.runOnlyPendingTimers()

      // CHECK RESULTS
      expect(mockLoopAction).toHaveBeenCalledTimes(1)
    })
  })
})
