import { BoundedDeque, AggregateOperations } from '#src/utils/BoundedDeque.js'

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
  /**
   * The timestamp of the last run.
   */
  let _lastRun = null

  /**
   * The number of ticks that have been processed by the manager.
   */
  let _ticks = 0

  /**
   * The time scale factor at which dt is scaled.
   */
  let _timeScaleFactor = 1

  /**
   * The delta time in milliseconds at which each tick is processed.
   * @type {number}
   * @default null - Each tick is processed with the last real elapsed delta time.
   */
  let _dt = null

  /**
   * The maximum delta time in milliseconds that can be used to process a tick.
   * Used when dt is computed with real elapsed time.
   * @type {number}
   * @default 1/30 * 1000
   */
  const MAX_DELTA_TIME = (1 / 30) * 1000 // Max delta time in milliseconds

  /**
   * The update rate of the engine in update per seconds.
   * @type {number}
   * @private
   * @default 60
   * @description
   * The number of time the engine updates its listeners per seconds with the last computed state.
   */
  let _updateRate = 60

  /**
   * The timestamp of the last update.
   * @type {number}
   * @private
   * @default null
   */
  let _lastUpdate = null

  /**
   * Window of tick durations used to calculate mean tick time, tick per seconds, ...
   * The bound compute function is the sum of the durations of every tick in the window.
   * The bound is set to 1s.
   *
   * @type {BoundedDeque}
   * @private
   */
  let _tickDurationsWindow = new BoundedDeque(1000, (item) => item, AggregateOperations.addition)

  /**
   * Window of update durations used to calculate mean update time, update per seconds, ...
   * The bound compute function is the sum of the durations of every update in the window.
   * The bound is set to 1s.
   *
   * @type {BoundedDeque}
   * @private
   */
  let _updateDurationsWindow = new BoundedDeque(1000, (item) => item, AggregateOperations.addition)

  /****************************************
   *          PUBLIC FUNCTIONS            *
   * **************************************/
  const manager = {}

  /**
   * Initializes the last run time to currentTime.
   * @param {*} currentTime - The current timestamp in milliseconds.
   */
  manager.init = (currentTime) => {
    _lastRun = currentTime
  }

  /**
   * Calculates the delta time since the last run constrained by the maximum delta time and scaled by the time scale factor.
   * Return 0 if recordTick has not been called yet once.
   * If dt is set to a fixed value, it returns this value.
   *
   * @param {number} currentTime - The current timestamp in milliseconds.
   * @returns {number} The calculated delta time in seconds. Returns 0 if recordTick has not been called yet once.
   */
  manager.calculateDeltaTime = (currentTime) => {
    validateTimeInput(currentTime, _lastRun)
    if (_lastRun === null) {
      return 0 // No delta time on first call
    }
    if (_dt !== null) {
      return _dt * _timeScaleFactor
    }
    let dt = currentTime - _lastRun
    dt = Math.min(dt, MAX_DELTA_TIME)
    return (dt * _timeScaleFactor) / 1000 // Convert to seconds
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
    _tickDurationsWindow.pushFront(tickDuration)
    _lastRun = currentTime
    _ticks++
  }

  /**
   * Determine if an update is needed based on the current time.
   * @param {*} currentTime - The current timestamp in milliseconds.
   * @returns {boolean} True if an update is needed, false otherwise.
   */
  manager.isUpdateNeeded = (currentTime) => {
    validateTimeInput(currentTime, _lastUpdate)
    if (_lastUpdate === null) {
      return true
    }
    const dt = currentTime - _lastUpdate
    return dt >= 1000 / _updateRate
  }

  /**
   * Records an update.
   * @param {*} currentTime - The lastUpdate timestamp in milliseconds.
   */
  manager.recordUpdate = (currentTime) => {
    const updateDuration = currentTime - _lastUpdate
    _updateDurationsWindow.pushFront(updateDuration)
    _lastUpdate = currentTime
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
   * Mean time taken to process a tick for the last second of ticks.
   * @name TimingManager#meanTickTime
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'meanTickTime', {
    get: () => {
      const total = _tickDurationsWindow.aggregate
      return _tickDurationsWindow.size() > 0 ? total / _tickDurationsWindow.size() : 0
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
      const lastTime = _tickDurationsWindow.front()
      return lastTime ? lastTime : 0
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

  /**
   * The update rate of the engine in update per seconds.
   * @name TimingManager#updateRate
   * @type {number}
   * @default 60
   * @readonly
   */
  Object.defineProperty(manager, 'updateRate', {
    get: () => _updateRate,
    enumerable: true,
  })

  /**
   * The real number of updates sent per second.
   * @name TimingManager#updatePerSecond
   * @type {number}
   * @readonly
   */
  Object.defineProperty(manager, 'updatePerSecond', {
    get: () => {
      const nbUpdates = _updateDurationsWindow.length
      return nbUpdates > 0 ? nbUpdates : 0
    },
  })

  /**
   * Mean time taken to process an update for the last second of updates.
   *
   */
  Object.defineProperty(manager, 'meanUpdateTime', {
    get: () => {
      const total = _updateDurationsWindow.aggregate
      return _updateDurationsWindow.size() > 0 ? total / _updateDurationsWindow.size() : 0
    },
    enumerable: true,
  })

  /**
   * The time scale factor at which the engine is running.
   * @name TimingManager#timeScaleFactor
   * @type {number}
   * @default 1
   * @description
   * The time scale factor is used to scale the delta time returned by the manager.
   */
  Object.defineProperty(manager, 'timeScaleFactor', {
    get: () => _timeScaleFactor,
    set: (value) => {
      if (value < 1) {
        throw new Error('Time scale factor must be greater than or equal to 1.')
      }
      _timeScaleFactor = value
    },
    enumerable: true,
  })

  /**
   * The delta time in seconds at which each tick is processed.
   * @property {number} dt
   * @name TimingManager#dt
   * @type {number}
   * @default null - Each tick is processed with the last real elapsed delta time.
   * @description
   */
  Object.defineProperty(manager, 'dt', {
    get: () => _dt,
    set: (value) => {
      if (value !== null && value <= 0) {
        throw new Error('dt must be greater than 0.')
      }
      _dt = value
    },
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
