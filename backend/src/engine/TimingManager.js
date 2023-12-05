import { BoundedQueue } from '#src/utils/BoundedQueue.js'

/**
 * Creates a new instance of TimingManager. This manager is responsible for tracking
 * time between engine ticks.
 *
 * @returns {Object} The timing manager instance with methods to control engine timing.
 */
function TimingManager() {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/
  let _lastRun = null
  let _ticks = 0
  const MAX_DELTA_TIME = (1 / 30) * 1000 // Max delta time in milliseconds

  /**
   * Window of tick durations used to calculate mean tick time, tick per seconds, ...
   * The bound compute function is the sum of the durations of every tick in the window.
   * The bound is set to 1s.
   *
   * @type {BoundedQueue}
   * @private
   */
  let _tickDurationsWindow = BoundedQueue(1000, (items) => {
    return items.reduce((acc, duration) => acc + duration, 0)
  })

  /****************************************
   *          PUBLIC FUNCTIONS            *
   * **************************************/
  const manager = {}

  manager.init = (currentTime) => {
    _lastRun = currentTime
  }

  /**
   * Calculates the delta time since the last run constrained by the maximum delta time.
   * Return 0 if recordTick has not been called yet once.
   *
   * @param {number} currentTime - The current timestamp in milliseconds.
   * @returns {number} The calculated delta time in milliseconds. Returns if recordTick has not been called yet once.
   */
  manager.calculateDeltaTime = (currentTime) => {
    validateTimeInput(currentTime, _lastRun)
    if (_lastRun === null) {
      return 0 // No delta time on first call
    }
    let dt = currentTime - _lastRun
    dt = Math.min(dt, MAX_DELTA_TIME)
    return dt
  }

  /**
   * Increments the tick count, record the duration of the tick, and updates the last run time to currentTime.
   *
   * @param {number} currentTime - The current timestamp in milliseconds.
   * @throws {Error} If init has not been called before calling this function.
   */
  manager.recordTick = (currentTime) => {
    if (_lastRun === null) {
      throw new Error('You must call init before calling recordTick.')
    }
    const tickDuration = currentTime - _lastRun
    _tickDurationsWindow.enqueue(tickDuration)
    _lastRun = currentTime
    _ticks++
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * The number of ticks that have been processed by the manager.
   * @name TimingManager#ticks
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'ticks', {
    get: () => _ticks,
    enumerable: true,
  })

  /**
   * Mean time taken for recent ticks.
   * The number of ticks used to calculate the mean is equal to the update frequency.
   * @name TimingManager#meanTickTime
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'meanTickTime', {
    get: () => {
      const durations = _tickDurationsWindow.items
      const total = durations.reduce((acc, duration) => acc + duration, 0)
      return durations.length > 0 ? total / durations.length : 0
    },
    enumerable: true,
  })

  /**
   * The duration of the last processed tick in milliseconds.
   * If no ticks have been processed yet, it returns 0.
   * @name TimingManager#lastTickTime
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'lastTickTime', {
    get: () => {
      const lastTime = _tickDurationsWindow.last()
      return lastTime !== null ? lastTime : 0
    },
    enumerable: true,
  })

  /**
   * The number of ticks processed per second.
   * @name TimingManager#tickPerSecond
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'tickPerSecond', {
    get: () => {
      const nbTicks = _tickDurationsWindow.length
      return nbTicks > 0 ? nbTicks : 0
    },
    enumerable: true,
  })

  /**
   * The timestamp of the last run.
   * @name TimingManager#lastRun
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'lastRun', {
    get: () => _lastRun,
    enumerable: true,
  })

  return manager
}

/****************************************
 *          HELPER FUNCTIONS            *
 ****************************************/

const validateTimeInput = (currentTime, lastTime) => {
  if (lastTime !== null && currentTime < lastTime) {
    throw new Error(
      `Current time(${currentTime}) must be equal to or greater than the last recorded time(${lastTime}).`
    )
  }
}

export { TimingManager }
