/**
 * Manages the engine loop.
 * @param {Function} loopAction - A function that defines the actions to be performed during each loop iteration.
 * @returns {Object} The loop manager with methods to control the engine loop.
 */
function LoopManager(loopAction) {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/
  let _isRunning = false

  /****************************************
   *        PRIVATE FUNCTIONS             *
   ****************************************/

  /**
   * The main loop for the engine.
   */
  const runLoop = () => {
    if (!_isRunning) return

    try {
      loopAction()
    } catch (error) {
      _isRunning = false
      throw error
    }

    setImmediate(runLoop) // Schedule the next iteration of the loop
  }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const obj = {}

  /**
   * Starts the engine loop.
   */
  obj.start = () => {
    _isRunning = true
    runLoop()
  }

  /**
   * Stops the engine loop.
   */
  obj.stop = () => {
    _isRunning = false
  }

  return obj
}

export { LoopManager }
