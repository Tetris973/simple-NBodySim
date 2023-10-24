/**
 * Asynchronously creates an instance of SimpleEngineControl to interface with the provided worker thread.
 * It checks if the worker is of the correct type before proceeding with the initialization.
 *
 * @param {Worker} worker - The worker thread to interface with.
 * @returns {Promise<Object>} A promise that resolves to an object containing methods to control the engine.
 * @throws {Error} Throws an error if the provided worker is not of the correct type.
 */
const SimpleEngineController = async (worker) => {
  const isCorrectType = await checkWorkerType(worker, 'SimpleEngineWorker')
  if (!isCorrectType) {
    throw new Error('Provided worker is not of the correct type.')
  }
  // Handler for worker termination
  worker.on('exit', () => {
    _isTerminated = true
  })

  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/

  /**
   * Instance of a Worker, used to run the SimpleEngine in a separate thread.
   * @type {Worker}
   */
  const _worker = worker
  // Handler for messages received from the worker
  _worker.on('message', (message) => {
    if (message.action === 'engineData' && _engineDataCallback) {
      _engineDataCallback(message.data)
    } else if (_resolveCurrentCommand && message.action !== 'engineData') {
      _resolveCurrentCommand(message)
      _resolveCurrentCommand = null
    }
  })

  /**
   * Function to resolve the current command.
   * It's set when a command is sent to the worker and is called when the worker responds.
   * @type {Function|null}
   */
  let _resolveCurrentCommand = null

  /**
   * Callback function that is triggered when engine data is received from the worker.
   * @type {Function|null}
   */
  let _engineDataCallback = null

  /**
   * Flag to indicate whether the worker has been terminated, to prevent further communication attempts.
   * @type {boolean}
   */
  let _isTerminated = false

  /****************************************
   *         PRIVATE FUNCTIONS           *
   ****************************************/

  /**
   * Sends a command to the worker and returns a promise that resolves with the worker's response.
   * @param {string} command - The command to send to the worker.
   * @param {*} [data=null] - Additional data to send to the worker.
   * @returns A promise resolving with the worker's response.
   * @throws {Error} If the worker is terminated.
   * @throws {Error} If the worker responds with an error.
   */
  const sendToWorker = (command, data) => {
    if (_isTerminated) {
      throw new Error('Worker is terminated')
    }
    return new Promise((resolve) => {
      _resolveCurrentCommand = (response) => {
        resolve(parseWorkerResponse(response))
      }
      _worker.postMessage({ command, data })
    })
  }

  /****************************************
   *          PUBLIC FUNCTIONS           *
   ****************************************/
  const obj = {}

  /**
   * Initializes the engine.
   * @async
   * @returns {Promise<void>} A promise that resolves when the engine has been initialized.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.init = () => sendToWorker('init')

  /**
   * Validates the engine's current state.
   * @async
   * @returns {Promise<void>} A promise that resolves when the engine's state has been validated.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.validate = () => sendToWorker('validate')

  /**
   * Starts the engine loop.
   * @async
   * @returns {Promise<void>} A promise that resolves when the engine loop has started.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.start = () => sendToWorker('start')

  /**
   * Stops the engine loop.
   * @async
   * @returns {Promise<void>} A promise that resolves when the engine loop has stopped.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.stop = () => sendToWorker('stop')

  /**
   * Sets a task in the engine.
   * @async
   * @param {number} taskId - The ID of the task to set.
   * @returns {Promise<void>} A promise that resolves when the task has been set in the engine.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.setTask = (taskId) => sendToWorker('setTask', taskId)

  /**
   * Sets entities in the engine. This method is asynchronous and returns a promise that resolves with the entities that were set.
   * @async
   * @param {Object[]} entities - Array of entities to set in the engine.
   * @returns {Promise<Object[]>} A promise resolving with the array of entities that were set in the engine.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.setEntities = (entities) => sendToWorker('setEntities', entities)

  /**
   * Retrieves information about the engine's current state and performance metrics.
   * @async
   * @returns {Promise<EngineInfo>} A promise that resolves to an object containing detailed engine information.
   * @throws {Error} If the worker is terminated or responds with an error.
   */
  obj.getEngineInfos = () => sendToWorker('getEngineInfos')

  /**
   * @typedef {Object} EngineInfo
   * @property {number} meanTickTime - The average time between ticks in the engine.
   * @property {string} currentState - A description of the current state of the engine.
   * @property {number} lastTickTime - The time taken for the last tick in the engine.
   * @property {number} tickPerSecond - The number of ticks occurring per second in the engine.
   * @property {number} tickCount - The total number of ticks that have occurred in the engine so far.
   */

  /**
   * Registers a callback to handle engine data.
   * @param {function} callback - The callback function to handle engine data.
   */
  obj.onEngineData = (callback) => {
    _engineDataCallback = callback
  }

  /**
   * Terminates the worker thread.
   */
  obj.terminate = () => {
    _isTerminated = true
    _worker.terminate()
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Indicates if the engine was terminated
   * @name SimpleEngineControl#isTerminated
   * @type {boolean}
   * @readonly
   * @default false
   */
  Object.defineProperty(obj, 'isTerminated', {
    get: () => _isTerminated,
    enumerable: true,
  })

  return obj
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS     *
 ****************************************/

/**
 * Parses the response from the worker and handles success and error cases.
 * @param {Object} response - The response object from the worker.
 * @returns The parsed data or throws an error.
 */
const parseWorkerResponse = (response) => {
  if (response.status === 'error') {
    throw new Error(response.error)
  }
  return response.data === null ? undefined : response.data
}

/**
 * Listens for a message from the worker to verify its type. This function sends a request to the worker
 * and resolves to true if the worker responds with the expected type, otherwise resolves to false.
 *
 * @param {Worker} worker - The worker thread to be checked.
 * @param {string} expectedType - The expected type identifier of the worker.
 * @returns {Promise<boolean>} A promise that resolves to true if the worker is of the expected type, otherwise false.
 */
function checkWorkerType(worker, expectedType) {
  return new Promise((resolve) => {
    const messageHandler = (message) => {
      if (message.action === 'getWorkerType' && message.data === expectedType) {
        resolve(true)
      } else {
        resolve(false)
      }
      worker.off('message', messageHandler)
    }

    worker.on('message', messageHandler)
    worker.postMessage({ command: 'getWorkerType' })
  })
}

export { SimpleEngineController }
