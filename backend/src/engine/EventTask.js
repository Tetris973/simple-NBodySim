// TODO: verify jsdoc, add tests, verify overall functionality
import { Task } from './Task.js'
import { Counter } from '../Utilities/Counter.js'

/**
 * @typedef {Object} EventTask
 * @property {Function} process - Processes the event based on the event condition.
 * @property {Function} getLimit - Retrieves the limit of the counter.
 * @property {Function} setLimit - Updates the limit of the counter.
 * @property {Function} setIsActive - Updates the active state of the event task.
 * @property {Function} getIsActive - Retrieves the active state of the event task.
 * @property {Object} callbacks - Manages the callback functions associated with the event task.
 */

/**
 * Creates an event task object, extending the functionalities of a engine task.
 * An event task represents a conditional task in a engine system, where specific
 * conditions are evaluated to determine if associated callbacks should be triggered.
 *
 * @param {string} id - A unique identifier for the event task.
 * @param {Function} conditionFunction - A function that evaluates specific conditions.
 * @param {ItemManager} callbacks - Manages the callback functions associated with the event task.
 * @returns {EventTask} The event task instance.
 */
function EventTask(id, conditionFunction, callbacks) {
  /****************************************
   *         PRIVATE VARIABLES           *
   ****************************************/
  /**
   * The task that contains the condition function.
   * It is extended with additional properties and methods.
   */
  const _task = Task(id, conditionFunction)

  /**
   * The state object of the event task.
   * @type {Object}
   * @property {boolean} isActive - Indicates if the event task is active.
   * @property {Object} counter - The counter object used to track the number of times the event task is triggered.
   */
  const _state = { isActive: true, counter: Counter(0, 1) }

  /****************************************
   *         PUBLIC FUNCTIONS             *
   ****************************************/
  const obj = { ..._task, callbacks: [...callbacks] }

  /**
   * Processes the event task with provided data.
   * @param {*} entities - Data to process.
   * @returns
   */
  obj.process = (entities) => process(_task.process, entities, _state, obj._callbacks)

  /**
   * Retrieves the number of time each callback function associated with the event task is triggered.
   * @returns {number} the limit
   */
  obj.getLimit = () => _state.counter.getLimit()

  /**
   * Updates the number of time each callback function associated with the event task is triggered.
   * @param {*} value new limit
   */
  obj.setLimit = (value) => {
    _state.counter.setLimit(value)
    obj.setIsActive = (value) => {
      _state.isActive = value
    }
  }

  /****************************************
   *            PUBLIC PROPERTIES         *
   ****************************************/

  /**
   * Updates the active state of the event task.
   * @param {boolean} value - The new active state of the event task.
   */
  Object.defineProperty(obj, 'isActive', {
    get: () => _state.isActive,
    set: (value) => {
      _state.isActive = value
    },
    enumerable: true,
  })

  return obj
}

/****************************************
 *    FUNCTIONAL UTILITY FUNCTIONS      *
 ****************************************/

/**
 * Evaluate the condition function of the event task and invoke associated callback functions.
 *
 * @function
 * @param {Function} eventTask - The condition function to evaluate.
 * @param {Array} entities - A collection of objects involved in the event task.
 * @param {Object} state - The state object of the event task, holding properties like `isActive` and `counter`.
 * @param {ItemManager} callbacks - The item manager instance managing callback functions associated with the event task.
 * @throws {Error} Throws an error if there is an issue processing the event.
 */
function process(evaluate, entities, state, callbacks) {
  if (!state.isActive) return

  try {
    while (state.counter.getValue() < state.counter.getLimit()) {
      const eventData = evaluate(entities)
      if (eventData === null) {
        state.counter.reset()
        return
      }
      processCallbacks(callbacks, eventData)
      state.counter.increment()
    }
  } catch (error) {
    state.isActive = false
    state.counter.reset()
    throw new Error('Error processing event: ' + error.message)
  }
}

/**
 * Invokes each callback function associated with the event task with the provided event data.
 *
 * @function
 * @param {ItemManager} callbacks - The item manager instance managing callback functions associated with the event task.
 * @param {Object} eventData - The event data to be passed to each callback function.
 */
function processCallbacks(callbacks, eventData) {
  callbacks.getItems().forEach((callback) => {
    callback.process(eventData)
  })
}

export { EventTask }
