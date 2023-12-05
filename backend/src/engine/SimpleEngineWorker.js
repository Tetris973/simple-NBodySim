import { parentPort } from 'worker_threads'
import { SimpleEngine } from './SimpleEngine.js'
import { TimingManager } from './TimingManager.js'
import { LoopManager } from './LoopManager.js'
import { StateManager } from '#src/utils/StateManager.js'

/**
 * @typedef {Object} CommandResponse
 * @property {string} action - The action or command that was executed.
 * @property {string} status - The status of the command execution, typically 'success' or 'error'.
 * @property {*} [data] - Additional data related to the command response. This is optional and can be any type, depending on the command.
 * @property {string} [error] - An error message, present if the status is 'error'. This is optional.
 */

/****************************************
 *          INIT STATE MANAGER          *
 ****************************************/

/**
 * Enumeration for Worker States.
 */
const WorkerState = Object.freeze({
  UNINITIALIZED: Symbol('uninitialized'),
  INITIALIZED: Symbol('initialized'),
  READY: Symbol('ready'),
  ERROR: Symbol('error'),
})

/**
 * Define valid state transitions for the worker.
 */
const transitions = new Map([
  [WorkerState.UNINITIALIZED, [WorkerState.INITIALIZED]],
  [WorkerState.INITIALIZED, [WorkerState.READY]],
  [WorkerState.READY, [WorkerState.INITIALIZED, WorkerState.READY]],
  [WorkerState.ERROR, [WorkerState.INITIALIZED]],
  [null, [WorkerState.ERROR]],
])

/**
 * Manages the state of the worker.
 */
const stateManager = StateManager(WorkerState.UNINITIALIZED, transitions)

/**
 * Checks if the worker state is either INITIALIZED or READY.
 * @throws {Error} If the state is not INITIALIZED or READY.
 */
const isInitializedOrReady = () => {
  const check = stateManager.createStateCheckRule([WorkerState.INITIALIZED, WorkerState.READY])
  if (!check()) {
    throw new Error(
      'You can not execute this command in the current state: ' +
        stateManager.getCurrentState().description
    )
  }
}

/**
 * Checks if the worker state is READY.
 * @throws {Error} If the state is not READY.
 */
const isReady = () => {
  const check = stateManager.createStateCheckRule([WorkerState.READY])
  if (!check()) {
    throw new Error(
      'You can not execute this command in the current state: ' +
        stateManager.getCurrentState().description
    )
  }
}

/****************************************
 *           INIT WORKER                *
 ****************************************/

let engine = null
let timingManager = null
let loopManager = null

/**
 * Function to be executed in each loop iteration.
 */
const loopAction = () => {
  let deltaTime = timingManager.calculateDeltaTime(Date.now())
  if (deltaTime === 0) {
    return
  }
  timingManager.recordTick(Date.now())
  // TODO: For testing, to be removed !!!
  const speedFactor = 2000
  engine.run(deltaTime * speedFactor)

  // update client with computed data
  parentPort.postMessage({ action: 'engineData', data: engine.data })
}

/**
 * Handles uncaught exceptions in the worker process.
 */
process.on('uncaughtException', (error) => {
  stateManager.transitionTo(WorkerState.ERROR)
  parentPort.postMessage({ action: 'error', error: error.message })
})

/**
 * Object containing handlers for different commands sent to the worker.
 */
const commandHandlers = {
  /**
   * Retrieves the worker type.
   * @returns {CommandResponse} Response object containing the worker type.
   */
  getWorkerType: () => {
    return { action: 'getWorkerType', status: 'success', data: 'SimpleEngineWorker' }
  },
  /**
   * Initializes the engine and related managers.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the state transition is not allowed.
   */
  init: () => {
    if (stateManager.canTransitionTo(WorkerState.INITIALIZED)) {
      engine = SimpleEngine()
      timingManager = TimingManager()
      loopManager = LoopManager(loopAction)
    }
    stateManager.transitionTo(WorkerState.INITIALIZED)
    return { action: 'init', status: 'success' }
  },

  /**
   * Validates the current state of the engine.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the engine is not in a state that allows validation.
   */
  validate: () => {
    if (stateManager.canTransitionTo(WorkerState.READY)) {
      engine.validate()
    }
    stateManager.transitionTo(WorkerState.READY)
    return { action: 'validate', status: 'success' }
  },

  /**
   * Starts the engine loop.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the engine is not in a READY state.
   */
  start: () => {
    isReady()
    timingManager.init(Date.now()) // important to call this before starting the loop
    loopManager.start()
    return { action: 'start', status: 'success' }
  },

  /**
   * Stops the engine loop.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the engine is not in a READY state.
   */
  stop: () => {
    isReady()
    loopManager.stop()
    return { action: 'stop', status: 'success' }
  },

  /**
   * Sets a task in the engine.
   * @param {number} taskId - The ID of the task to set.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the state is not INITIALIZED or READY.
   */
  setTask: (taskId) => {
    isInitializedOrReady()
    engine.setTask(taskId)
    return { action: 'setTask', status: 'success' }
  },

  /**
   * Sets entities in the engine.
   * @param {Object[]} entities - Array of entities to set in the engine.
   * @returns {CommandResponse} Response object indicating the result of the command.
   * @throws {Error} If the state is not INITIALIZED or READY.
   */
  setEntities: (entities) => {
    isInitializedOrReady()
    engine.setEntities(entities)
    return { action: 'setEntities', status: 'success', data: entities }
  },

  /**
   * Retrieves information about the engine.
   * @returns {CommandResponse} Response object containing engine information.
   * @throws {Error} If the state is not INITIALIZED or READY.
   */
  getEngineInfos: () => {
    isInitializedOrReady()
    return {
      action: 'getEngineInfos',
      status: 'success',
      data: {
        meanTickTime: timingManager.meanTickTime,
        currentState: stateManager.getCurrentState().description,
        lastTickTime: timingManager.lastTickTime,
        tickPerSecond: timingManager.tickPerSecond,
        tickCount: timingManager.ticks,
      },
    }
  },
}

/**
 * Handles incoming messages and executes corresponding command handlers.
 * @param {Object} message - The message received from the parent port.
 */
const handleMessage = (message) => {
  try {
    const handler = commandHandlers[message.command]
    if (!handler) {
      throw new Error('Unknown command')
    }
    const response = handler(message.data)
    sendResponse(response.action, response.status, response.data)
  } catch (error) {
    sendError(error.message, message.command)
  }
}

// Event listener for incoming messages
parentPort.on('message', handleMessage)

/****************************************
 *          HELPER FUNCTIONS            *
 ****************************************/

/**
 * Sends a response to the parent thread.
 * @param {string} action - The action that was performed.
 * @param {string} status - The status of the action.
 * @param {*} [data=null] - Additional data to send back.
 */
const sendResponse = (action, status, data = null) => {
  parentPort.postMessage({ action, status, data })
}

/**
 * Sends an error message to the parent thread.
 * @param {string} errorMessage - The error message to be sent.
 * @param {string} [command] - The command during which the error occurred.
 */
const sendError = (errorMessage, command) => {
  parentPort.postMessage({
    action: command ? command : 'error',
    status: 'error',
    error: errorMessage,
  })
}
