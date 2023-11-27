import { forcesDictionnary } from './tasksLogic/simulationTasks/forces/forcesDictionnary.js'

/**
 * Creates a new instance of the simple engine.
 * @returns {SimpleEngine} The simple engine instance with methods to control the engine processing.
 */
function SimpleEngine() {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/

  /**
   * Flag to indicate if the engine is ready to run.
   * @type {boolean}
   */
  let _isReady = false

  /**
   * @type {Object|null}
   * @description Current task used to update entities in the engine. Set to null initially.
   */
  let _task = null

  /**
   * @type {Array|null}
   * @description Collection of entities that are processed in the engine.
   */
  let _entities = null

  /****************************************
   *          PUBLIC FUNCTIONS           *
   ****************************************/
  const engine = {}

  /**
   * Sets the task for the engine based on a provided taskId.
   * The task dictates how the entities in the engine are updated.
   * @param {string} taskId - The identifier of the task to set.
   */
  engine.setTask = (taskId) => (_task = getTask(taskId, forcesDictionnary))

  /**
   * validate the engine.
   * @throws {Error} If the engine is not ready to run.
   */
  engine.validate = () => {
    const { status, details } = engine.getCheckStatus()
    if (status !== 'success') {
      throw new Error('Engine not ready: ' + details)
    }
    _isReady = true
  }

  /**
   * Run one tick of the engine, using dt.
   * @param {number} dt - The delta time to run the tick with.
   * @throws {Error} If the engine is not ready to run.
   * @returns {Object} The result of processing the task.
   */
  engine.run = (dt) => {
    if (!_isReady) {
      throw new Error('Engine not ready, please use validate() method')
    }
    return runTick(_task, _entities, dt)
  }

  /**
   * Sets the collection of entities to be processed by the engine.
   * The entities array should be prepared (e.g., cloned) before being passed to this method.
   * @param {Array} newEntities - The new collection of entities to be used in the engine.
   */
  engine.setEntities = (newEntities) => {
    _entities = newEntities
  }

  /**
   * Retrieves the status of various checks performed on the engine to determine its readiness for operation.
   *
   * This function assesses multiple conditions that are essential for the engine's proper functioning.
   * It returns detailed information about the status of these checks, identifying any issues that might
   * prevent the engine from operating as expected.
   *
   * @returns {{status: string, details: string[] | string}} An object containing the check status ('success' or 'error') and detailed reasons if any checks fail.
   */
  engine.getCheckStatus = () => {
    let details = []

    if (!_task) {
      details.push('Task not set')
    }
    if (!_entities) {
      details.push('Entities not set')
    } else if (_entities.length === 0) {
      details.push('No entities')
    }

    if (details.length === 0) {
      return { status: 'success', details: 'Ready' }
    } else {
      return { status: 'error', details }
    }
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Indicates if the engine is ready to run.
   * This property is read-only and can be used to check if the engine is ready to run.
   * @name SimpleEngine#isStarted
   * @type {boolean}
   * @readonly
   */
  Object.defineProperty(engine, 'isReady', {
    get: () => _isReady,
    enumerable: true,
  })

  Object.defineProperty(engine, 'data', {
    get: () => _entities,
    enumerable: true,
  })

  return engine
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

/**
 * Retrieves a task from the dictionary based on the given ID.
 * @param {string} taskid - The identifier of the task to retrieve.
 * @throws {Error} If the task is not found in the dictionary.
 * @returns {Object} The retrieved task.
 */
const getTask = (taskid, dictionnary) => {
  const task = dictionnary[taskid]
  if (task) {
    return task
  } else {
    throw new Error('Task not found for ID: ' + taskid)
  }
}

/**
 * Run one tick of the engine, using dt.
 * @param {Object} task - The current task to process.
 * @param {Array} entities - The entities to be processed by the task.
 * @param {number} dt - The delta time to run the tick with.
 * @returns {Object} The result of processing the task.
 */
const runTick = (task, entities, dt) => {
  // If dt is 0, skip this tick
  if (dt === 0) {
    throw new Error('dt must be non-zero')
  }

  const result = task.process(entities, dt)
  return result
}

const SimpleEngineLibrary = {
  getTask,
  runTick,
}

export { SimpleEngine, SimpleEngineLibrary }
